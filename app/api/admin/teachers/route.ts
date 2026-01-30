import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const teachers = await db.teacherProfile.findMany({
    select: {
      id: true,
      displayName: true,
    },
    orderBy: { displayName: "asc" },
  })

  return NextResponse.json(teachers)
}
