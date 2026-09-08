import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query || query.length < 2) {
    return NextResponse.json({ clients: [] })
  }

  const clients = await db.user.findMany({
    where: {
      role: "CLIENT",
      OR: [
        { email: { contains: query, mode: "insensitive" } },
        { clientProfile: { firstName: { contains: query, mode: "insensitive" } } },
        { clientProfile: { lastName: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: {
      clientProfile: true,
    },
    take: 10,
  })

  return NextResponse.json({
    clients: clients.map((c) => ({
      id: c.id,
      email: c.email,
      clientProfile: c.clientProfile
        ? {
            firstName: c.clientProfile.firstName,
            lastName: c.clientProfile.lastName,
            phone: c.clientProfile.phone,
          }
        : null,
    })),
  })
}
