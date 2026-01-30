"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid"
import { sendWaitlistNotification } from "@/lib/email"

const MAX_WAITLIST_SIZE = 3 // Maximum 3 personnes en liste d'attente
const NOTIFICATION_EXPIRY_MINUTES = 10 // 10 minutes pour accepter

// Rejoindre la liste d'attente
export async function joinWaitlist(sessionId: string) {
  const authSession = await auth()
  
  if (!authSession?.user) {
    return { success: false, error: "Non authentifié" }
  }

  const userId = authSession.user.id

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Vérifier que la session existe et est complète
      const classSession = await tx.session.findUnique({
        where: { id: sessionId },
        include: {
          classType: true,
          reservations: {
            where: { status: "BOOKED" },
          },
          waitlist: {
            where: { status: "WAITING" },
            orderBy: { position: "asc" },
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

      // 2. Vérifier que le cours est complet
      if (classSession.reservations.length < classSession.capacity) {
        throw new Error("Il reste des places disponibles, vous pouvez réserver directement")
      }

      // 3. Vérifier que l'utilisateur n'est pas déjà inscrit
      const existingReservation = await tx.reservation.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
      })

      if (existingReservation && existingReservation.status === "BOOKED") {
        throw new Error("Vous êtes déjà inscrit à ce cours")
      }

      // 4. Vérifier que l'utilisateur n'est pas déjà sur la liste d'attente
      const existingWaitlist = await tx.waitlistEntry.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
      })

      if (existingWaitlist && existingWaitlist.status === "WAITING") {
        throw new Error("Vous êtes déjà sur la liste d'attente")
      }

      // 5. Vérifier que la liste d'attente n'est pas pleine
      if (classSession.waitlist.length >= MAX_WAITLIST_SIZE) {
        throw new Error("La liste d'attente est complète (max 3 personnes)")
      }

      // 6. Ajouter à la liste d'attente
      const position = classSession.waitlist.length + 1

      if (existingWaitlist) {
        // Réactiver une ancienne entrée
        await tx.waitlistEntry.update({
          where: { id: existingWaitlist.id },
          data: {
            status: "WAITING",
            position,
            token: null,
            notifiedAt: null,
            expiresAt: null,
            acceptedAt: null,
          },
        })
      } else {
        await tx.waitlistEntry.create({
          data: {
            sessionId,
            userId,
            position,
            status: "WAITING",
          },
        })
      }

      return { success: true, position }
    })

    revalidatePath("/app/planning")
    revalidatePath("/app/reservations")
    return result
  } catch (error) {
    console.error("Join waitlist error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'inscription à la liste d'attente",
    }
  }
}

// Quitter la liste d'attente
export async function leaveWaitlist(sessionId: string) {
  const authSession = await auth()
  
  if (!authSession?.user) {
    return { success: false, error: "Non authentifié" }
  }

  const userId = authSession.user.id

  try {
    await db.$transaction(async (tx) => {
      const entry = await tx.waitlistEntry.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
      })

      if (!entry || entry.status !== "WAITING") {
        throw new Error("Vous n'êtes pas sur la liste d'attente")
      }

      // Marquer comme annulé
      await tx.waitlistEntry.update({
        where: { id: entry.id },
        data: { status: "CANCELLED" },
      })

      // Réorganiser les positions
      await tx.waitlistEntry.updateMany({
        where: {
          sessionId,
          status: "WAITING",
          position: { gt: entry.position },
        },
        data: {
          position: { decrement: 1 },
        },
      })
    })

    revalidatePath("/app/planning")
    revalidatePath("/app/reservations")
    return { success: true }
  } catch (error) {
    console.error("Leave waitlist error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur",
    }
  }
}

// Notifier le prochain sur la liste d'attente (appelé quand une place se libère)
export async function notifyNextInWaitlist(sessionId: string) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Trouver le prochain en attente
      const nextEntry = await tx.waitlistEntry.findFirst({
        where: {
          sessionId,
          status: "WAITING",
        },
        orderBy: { position: "asc" },
        include: {
          user: {
            include: {
              clientProfile: true,
            },
          },
          session: {
            include: {
              classType: true,
            },
          },
        },
      })

      if (!nextEntry) {
        return { notified: false, reason: "Pas de personne en liste d'attente" }
      }

      // Générer un token unique
      const token = nanoid(32)
      const expiresAt = new Date(Date.now() + NOTIFICATION_EXPIRY_MINUTES * 60 * 1000)

      // Mettre à jour l'entrée
      await tx.waitlistEntry.update({
        where: { id: nextEntry.id },
        data: {
          status: "NOTIFIED",
          token,
          notifiedAt: new Date(),
          expiresAt,
        },
      })

      // Envoyer l'email
      await sendWaitlistNotification(
        nextEntry.user.email,
        token,
        nextEntry.session.classType.title,
        nextEntry.session.startAt,
        nextEntry.user.clientProfile?.firstName || "Client"
      )

      return { notified: true, userId: nextEntry.userId }
    })

    return result
  } catch (error) {
    console.error("Notify waitlist error:", error)
    return { notified: false, error: "Erreur lors de la notification" }
  }
}

// Accepter une place depuis la liste d'attente
export async function acceptWaitlistSpot(token: string) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Trouver l'entrée
      const entry = await tx.waitlistEntry.findUnique({
        where: { token },
        include: {
          session: {
            include: {
              reservations: {
                where: { status: "BOOKED" },
              },
            },
          },
          user: true,
        },
      })

      if (!entry) {
        throw new Error("Lien invalide")
      }

      if (entry.status !== "NOTIFIED") {
        throw new Error("Cette invitation n'est plus valide")
      }

      if (entry.expiresAt && entry.expiresAt < new Date()) {
        // Expirer et passer au suivant
        await tx.waitlistEntry.update({
          where: { id: entry.id },
          data: { status: "EXPIRED" },
        })
        throw new Error("Le délai pour accepter est dépassé")
      }

      // Vérifier qu'il y a encore de la place
      if (entry.session.reservations.length >= entry.session.capacity) {
        throw new Error("La place n'est plus disponible")
      }

      // Vérifier le wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: entry.userId },
      })

      if (!wallet || wallet.creditsBalance < 1) {
        throw new Error("Vous n'avez pas assez de crédits")
      }

      // Créer la réservation
      const ledgerEntry = await tx.creditLedger.create({
        data: {
          userId: entry.userId,
          delta: -1,
          reason: "BOOKING",
          refType: "Session",
          refId: entry.sessionId,
          notes: `Réservation cours (depuis liste d'attente)`,
        },
      })

      await tx.wallet.update({
        where: { userId: entry.userId },
        data: {
          creditsBalance: { decrement: 1 },
        },
      })

      await tx.reservation.create({
        data: {
          sessionId: entry.sessionId,
          userId: entry.userId,
          status: "BOOKED",
          creditLedgerId: ledgerEntry.id,
        },
      })

      // Marquer l'entrée comme acceptée
      await tx.waitlistEntry.update({
        where: { id: entry.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      })

      // Réorganiser les positions des autres
      await tx.waitlistEntry.updateMany({
        where: {
          sessionId: entry.sessionId,
          status: "WAITING",
          position: { gt: entry.position },
        },
        data: {
          position: { decrement: 1 },
        },
      })

      return { success: true }
    })

    return result
  } catch (error) {
    console.error("Accept waitlist error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'acceptation",
    }
  }
}

// Traiter les notifications expirées (à appeler via cron ou API)
export async function processExpiredWaitlistNotifications() {
  try {
    const expiredEntries = await db.waitlistEntry.findMany({
      where: {
        status: "NOTIFIED",
        expiresAt: { lt: new Date() },
      },
      include: {
        session: {
          include: {
            reservations: {
              where: { status: "BOOKED" },
            },
          },
        },
      },
    })

    for (const entry of expiredEntries) {
      await db.$transaction(async (tx) => {
        // Marquer comme expiré
        await tx.waitlistEntry.update({
          where: { id: entry.id },
          data: { status: "EXPIRED" },
        })

        // Réorganiser les positions
        await tx.waitlistEntry.updateMany({
          where: {
            sessionId: entry.sessionId,
            status: "WAITING",
            position: { gt: entry.position },
          },
          data: {
            position: { decrement: 1 },
          },
        })
      })

      // Vérifier s'il reste de la place et notifier le suivant
      const currentReservations = await db.reservation.count({
        where: {
          sessionId: entry.sessionId,
          status: "BOOKED",
        },
      })

      if (currentReservations < entry.session.capacity) {
        await notifyNextInWaitlist(entry.sessionId)
      }
    }

    return { processed: expiredEntries.length }
  } catch (error) {
    console.error("Process expired waitlist error:", error)
    return { error: "Erreur lors du traitement" }
  }
}
