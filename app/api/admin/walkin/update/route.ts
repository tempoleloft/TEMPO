import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {

    const body = await req.json()
    const { walkInId, firstName, lastName, email, phone, source, numeroReservation } = body

    if (!walkInId) {
      return NextResponse.json({ error: "ID du participant requis" }, { status: 400 })
    }

    if (!firstName || !lastName || !source) {
      return NextResponse.json({ error: "Prénom, nom et source sont requis" }, { status: 400 })
    }

    // Verify walk-in exists
    const walkIn = await db.walkInParticipant.findUnique({
      where: { id: walkInId },
      include: { session: true },
    })

    if (!walkIn) {
      return NextResponse.json({ error: "Participant non trouvé" }, { status: 404 })
    }

    // Update walk-in participant
    const updatedWalkIn = await db.walkInParticipant.update({
      where: { id: walkInId },
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        source,
        numeroReservation: numeroReservation || null,
      },
    })

    // Revalidate relevant paths
    revalidatePath(`/admin/session/${walkIn.sessionId}`)
    revalidatePath("/admin/walk-ins")
    revalidatePath("/admin/planning")

    return NextResponse.json({ 
      success: true, 
      walkIn: updatedWalkIn 
    })
  } catch (error) {
    console.error("Error updating walk-in participant:", error)
    return NextResponse.json(
      { error: "Erreur lors de la modification du participant" },
      { status: 500 }
    )
  }
}
