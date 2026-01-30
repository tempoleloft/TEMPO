import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const classTypes = await db.classType.findMany({
    where: { active: true },
    select: {
      id: true,
      title: true,
      durationMin: true,
    },
    orderBy: { title: "asc" },
  })

  return NextResponse.json(classTypes)
}
