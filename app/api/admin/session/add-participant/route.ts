import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { sessionId, type } = body

    // Vérifier que la session existe
    const classSession = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        classType: true,
        reservations: { where: { status: { not: "CANCELLED" } } },
        walkInParticipants: { where: { status: { not: "CANCELLED" } } },
      },
    })

    if (!classSession) {
      return NextResponse.json({ error: "Session non trouvée" }, { status: 404 })
    }

    // Vérifier la capacité
    const guestCount = await db.guestReservation.count({
      where: {
        reservation: {
          sessionId: sessionId,
          status: { not: "CANCELLED" },
        },
      },
    })

    const totalBooked =
      classSession.reservations.length +
      guestCount +
      classSession.walkInParticipants.length

    if (totalBooked >= classSession.capacity) {
      return NextResponse.json(
        { error: "Le cours est complet" },
        { status: 400 }
      )
    }

    if (type === "existing") {
      // Ajouter un client existant
      const { userId } = body

      // Vérifier que le client n'est pas déjà inscrit
      const existingReservation = await db.reservation.findFirst({
        where: {
          sessionId,
          userId,
          status: { not: "CANCELLED" },
        },
      })

      if (existingReservation) {
        return NextResponse.json(
          { error: "Ce client est déjà inscrit à ce cours" },
          { status: 400 }
        )
      }

      // Créer la réservation (sans déduire de crédit)
      await db.reservation.create({
        data: {
          sessionId,
          userId,
          status: "BOOKED",
          bookedAt: new Date(),
        },
      })
    } else if (type === "manual") {
      // Ajouter un participant manuel (walk-in)
      const { firstName, lastName, email, phone, source, numeroReservation } = body

      if (!firstName || !lastName || !source) {
        return NextResponse.json(
          { error: "Prénom, nom et source sont requis" },
          { status: 400 }
        )
      }

      await db.walkInParticipant.create({
        data: {
          sessionId,
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          source: source,
          numeroReservation: numeroReservation || null,
          status: "BOOKED",
          createdById: session.user.id,
        },
      })
    } else {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 })
    }

    revalidatePath(`/admin/session/${sessionId}`)
    revalidatePath("/admin/planning")
    revalidatePath("/admin/walk-ins")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Add participant error:", error)
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    )
  }
}
