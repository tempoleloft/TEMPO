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
    const { reservationId, refundCredit } = body

    if (!reservationId) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 })
    }

    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
      include: {
        user: true,
        session: true,
        guestReservations: true,
      },
    })

    if (!reservation) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 })
    }

    // Start transaction
    await db.$transaction(async (tx) => {
      // Cancel the reservation
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: "CANCELLED" },
      })

      // Refund credit if requested
      if (refundCredit) {
        // Refund 1 credit for the main reservation
        await tx.wallet.update({
          where: { userId: reservation.userId },
          data: { creditsBalance: { increment: 1 } },
        })

        // Create ledger entry for refund
        await tx.creditLedger.create({
          data: {
            walletId: (await tx.wallet.findUnique({ where: { userId: reservation.userId } }))!.id,
            amount: 1,
            type: "REFUND",
            description: `Remboursement - Annulation admin du cours du ${reservation.session.startAt.toLocaleDateString('fr-FR')}`,
          },
        })

        // Refund credits for guest reservations too
        const guestCount = reservation.guestReservations.length
        if (guestCount > 0) {
          await tx.wallet.update({
            where: { userId: reservation.userId },
            data: { creditsBalance: { increment: guestCount } },
          })

          await tx.creditLedger.create({
            data: {
              walletId: (await tx.wallet.findUnique({ where: { userId: reservation.userId } }))!.id,
              amount: guestCount,
              type: "REFUND",
              description: `Remboursement - ${guestCount} invité(s) annulé(s)`,
            },
          })
        }
      }
    })

    revalidatePath(`/admin/session/${reservation.sessionId}`)
    revalidatePath("/admin/planning")
    revalidatePath("/planning")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Cancel reservation error:", error)
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    )
  }
}
