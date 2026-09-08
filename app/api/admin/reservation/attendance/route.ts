import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

async function canMarkAttendance(userId: string, role: string, sessionTeacherId: string) {
  if (role === "ADMIN") return true
  if (role !== "TEACHER") return false

  const teacherProfile = await db.teacherProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  return teacherProfile?.id === sessionTeacherId
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { reservationId, status } = body

    if (!reservationId || !status) {
      return NextResponse.json({ error: "ID et statut requis" }, { status: 400 })
    }

    if (!["ATTENDED", "NO_SHOW", "BOOKED"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
    }

    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
      include: { session: true },
    })

    if (!reservation) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 })
    }

    const allowed = await canMarkAttendance(
      session.user.id,
      session.user.role,
      reservation.session.teacherId
    )

    if (!allowed) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    await db.reservation.update({
      where: { id: reservationId },
      data: {
        status,
        attendedAt: status === "ATTENDED" ? new Date() : null,
      },
    })

    revalidatePath(`/admin/session/${reservation.sessionId}`)
    revalidatePath("/admin/planning")
    revalidatePath("/teacher/planning")
    revalidatePath(`/teacher/session/${reservation.sessionId}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Attendance update error:", error)
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    )
  }
}
