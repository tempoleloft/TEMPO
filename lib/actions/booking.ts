"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { notifyNextInWaitlist } from "./waitlist"

// Cancellation policy: 12 hours before class
const CANCEL_HOURS_BEFORE = 12

export async function bookSession(sessionId: string) {
  const session = await auth()
  
  if (!session?.user) {
    return { success: false, error: "Non authentifié" }
  }

  const userId = session.user.id

  try {
    // Use transaction for atomicity
    const result = await db.$transaction(async (tx) => {
      // 1. Get session with lock
      const classSession = await tx.session.findUnique({
        where: { id: sessionId },
        include: {
          reservations: {
            where: { status: "BOOKED" },
          },
        },
      })

      if (!classSession) {
        throw new Error("Cours non trouvé")
      }

      if (classSession.status !== "SCHEDULED") {
        throw new Error("Ce cours n'est plus disponible")
      }

      if (classSession.startAt < new Date()) {
        throw new Error("Ce cours est déjà passé")
      }

      // 2. Check capacity
      const bookedCount = classSession.reservations.length
      if (bookedCount >= classSession.capacity) {
        throw new Error("Ce cours est complet")
      }

      // 3. Check if already booked
      const existingReservation = await tx.reservation.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
      })

      if (existingReservation && existingReservation.status === "BOOKED") {
        throw new Error("Vous avez déjà réservé ce cours")
      }

      // 4. Check wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      })

      if (!wallet || wallet.creditsBalance < 1) {
        throw new Error("Vous n'avez pas assez de crédits")
      }

      // 5. Create credit ledger entry
      const ledgerEntry = await tx.creditLedger.create({
        data: {
          userId,
          delta: -1,
          reason: "BOOKING",
          refType: "Session",
          refId: sessionId,
          notes: `Réservation cours`,
        },
      })

      // 6. Update wallet
      await tx.wallet.update({
        where: { userId },
        data: {
          creditsBalance: { decrement: 1 },
        },
      })

      // 7. Create or update reservation
      if (existingReservation) {
        await tx.reservation.update({
          where: { id: existingReservation.id },
          data: {
            status: "BOOKED",
            bookedAt: new Date(),
            cancelledAt: null,
            creditLedgerId: ledgerEntry.id,
          },
        })
      } else {
        await tx.reservation.create({
          data: {
            sessionId,
            userId,
            status: "BOOKED",
            creditLedgerId: ledgerEntry.id,
          },
        })
      }

      return { success: true }
    })

    revalidatePath("/app/planning")
    revalidatePath("/app")
    return result
  } catch (error) {
    console.error("Booking error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la réservation",
    }
  }
}

export async function cancelBooking(sessionId: string) {
  const session = await auth()
  
  if (!session?.user) {
    return { success: false, error: "Non authentifié" }
  }

  const userId = session.user.id

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Get reservation
      const reservation = await tx.reservation.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
        include: {
          session: true,
        },
      })

      if (!reservation) {
        throw new Error("Réservation non trouvée")
      }

      if (reservation.status !== "BOOKED") {
        throw new Error("Cette réservation n'est pas active")
      }

      // 2. Check cancellation policy - BLOCK if less than 12h
      const hoursUntilClass = (reservation.session.startAt.getTime() - Date.now()) / (1000 * 60 * 60)
      
      if (hoursUntilClass < CANCEL_HOURS_BEFORE) {
        throw new Error(`Annulation impossible à moins de ${CANCEL_HOURS_BEFORE}h du cours. Contactez le studio si nécessaire.`)
      }

      // 3. Update reservation
      await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationPolicyApplied: false,
        },
      })

      // 4. Refund credit (always refunded since we block < 12h)
      await tx.creditLedger.create({
        data: {
          userId,
          delta: 1,
          reason: "CANCEL_REFUND",
          refType: "Reservation",
          refId: reservation.id,
          notes: `Annulation cours (remboursé)`,
        },
      })

      await tx.wallet.update({
        where: { userId },
        data: {
          creditsBalance: { increment: 1 },
        },
      })

      return { 
        success: true, 
        refunded: true,
        message: "Réservation annulée, crédit remboursé",
        sessionId: reservation.sessionId,
      }
    })

    // Notifier la liste d'attente (hors transaction pour ne pas bloquer)
    if (result.success && result.sessionId) {
      await notifyNextInWaitlist(result.sessionId)
    }

    revalidatePath("/app/planning")
    revalidatePath("/app")
    revalidatePath("/app/reservations")
    return result
  } catch (error) {
    console.error("Cancel booking error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'annulation",
    }
  }
}
