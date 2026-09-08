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
    const { walkInId } = body

    if (!walkInId) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 })
    }

    const walkIn = await db.walkInParticipant.findUnique({
      where: { id: walkInId },
    })

    if (!walkIn) {
      return NextResponse.json({ error: "Participant non trouvé" }, { status: 404 })
    }

    // Update status to CANCELLED
    await db.walkInParticipant.update({
      where: { id: walkInId },
      data: { status: "CANCELLED" },
    })

    revalidatePath(`/admin/session/${walkIn.sessionId}`)
    revalidatePath("/admin/planning")
    revalidatePath("/admin/walk-ins")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Cancel walk-in error:", error)
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    )
  }
}
