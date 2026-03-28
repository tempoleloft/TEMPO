"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { notifyNextInWaitlist } from "./waitlist"
import { sendBookingConfirmationEmail } from "@/lib/email"

// Cancellation policy: 24 hours before class
const CANCEL_HOURS_BEFORE = 24

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
          classType: true,
          teacher: true,
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

      // Get user info for email
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { clientProfile: true },
      })

      return { 
        success: true,
        emailData: {
          email: user?.email || "",
          firstName: user?.clientProfile?.firstName || user?.name?.split(" ")[0] || "Client",
          className: classSession.classType?.title || "Cours",
          teacherName: classSession.teacher?.displayName || "Professeur",
          classDate: classSession.startAt,
        }
      }
    })

    // Send confirmation email (outside transaction)
    if (result.success && result.emailData) {
      const { email, firstName, className, teacherName, classDate } = result.emailData
      sendBookingConfirmationEmail(email, firstName, className, teacherName, classDate)
        .catch(err => console.error("Failed to send booking confirmation email:", err))
    }

    revalidatePath("/app/planning")
    revalidatePath("/app")
    return { success: result.success }
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

export async function addGuestToReservation(
  reservationId: string,
  guestFirstName: string,
  guestLastName: string
) {
  const session = await auth()
  
  if (!session?.user) {
    return { success: false, error: "Non authentifié" }
  }

  const userId = session.user.id

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Vérifier que la réservation existe et appartient à l'utilisateur
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: {
          session: true,
          guestReservations: true,
        },
      })

      if (!reservation) {
        throw new Error("Réservation non trouvée")
      }

      if (reservation.userId !== userId) {
        throw new Error("Cette réservation ne vous appartient pas")
      }

      if (reservation.status !== "BOOKED") {
        throw new Error("Cette réservation n'est plus active")
      }

      // 2. Vérifier que le cours n'est pas passé
      if (reservation.session.startAt < new Date()) {
        throw new Error("Ce cours est déjà passé")
      }

      // 3. Vérifier qu'il reste de la place
      const bookedCount = await tx.reservation.count({
        where: {
          sessionId: reservation.sessionId,
          status: "BOOKED",
        },
      })

      const guestCount = await tx.guestReservation.count({
        where: {
          reservation: {
            sessionId: reservation.sessionId,
            status: "BOOKED",
          },
        },
      })

      const totalBooked = bookedCount + guestCount

      if (totalBooked >= reservation.session.capacity) {
        throw new Error("Ce cours est complet")
      }

      // 4. Vérifier le wallet de l'utilisateur
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      })

      if (!wallet || wallet.creditsBalance < 1) {
        throw new Error("Vous n'avez pas assez de crédits")
      }

      // 5. Créer l'entrée du ledger
      const ledgerEntry = await tx.creditLedger.create({
        data: {
          userId,
          delta: -1,
          reason: "BOOKING",
          refType: "GuestReservation",
          refId: reservationId,
          notes: `Invité: ${guestFirstName} ${guestLastName}`,
        },
      })

      // 6. Décrémenter le wallet
      await tx.wallet.update({
        where: { userId },
        data: {
          creditsBalance: { decrement: 1 },
        },
      })

      // 7. Créer la réservation invité
      await tx.guestReservation.create({
        data: {
          reservationId,
          guestFirstName: guestFirstName.trim(),
          guestLastName: guestLastName.trim(),
          creditLedgerId: ledgerEntry.id,
        },
      })

      return { success: true }
    })

    revalidatePath("/app/planning")
    revalidatePath("/app")
    revalidatePath("/app/reservations")
    return result
  } catch (error) {
    console.error("Add guest error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'ajout de l'invité",
    }
  }
}

export async function cancelGuestReservation(guestReservationId: string) {
  const session = await auth()
  
  if (!session?.user) {
    return { success: false, error: "Non authentifié" }
  }

  const userId = session.user.id

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Récupérer la réservation invité
      const guestReservation = await tx.guestReservation.findUnique({
        where: { id: guestReservationId },
        include: {
          reservation: {
            include: { session: true },
          },
        },
      })

      if (!guestReservation) {
        throw new Error("Réservation invité non trouvée")
      }

      if (guestReservation.reservation.userId !== userId) {
        throw new Error("Cette réservation ne vous appartient pas")
      }

      // 2. Vérifier la politique d'annulation (24h avant)
      const hoursUntilStart = (guestReservation.reservation.session.startAt.getTime() - Date.now()) / (1000 * 60 * 60)

      if (hoursUntilStart < CANCEL_HOURS_BEFORE) {
        throw new Error(`Annulation impossible moins de ${CANCEL_HOURS_BEFORE}h avant le cours`)
      }

      // 3. Supprimer la réservation invité
      await tx.guestReservation.delete({
        where: { id: guestReservationId },
      })

      // 4. Rembourser le crédit
      await tx.creditLedger.create({
        data: {
          userId,
          delta: 1,
          reason: "CANCEL_REFUND",
          refType: "GuestReservation",
          refId: guestReservationId,
          notes: `Annulation invité: ${guestReservation.guestFirstName} ${guestReservation.guestLastName}`,
        },
      })

      await tx.wallet.update({
        where: { userId },
        data: {
          creditsBalance: { increment: 1 },
        },
      })

      return { success: true }
    })

    revalidatePath("/app/planning")
    revalidatePath("/app")
    revalidatePath("/app/reservations")
    return result
  } catch (error) {
    console.error("Cancel guest error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'annulation",
    }
  }
}
