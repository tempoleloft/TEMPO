import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const purchases = await db.purchase.findMany({
      where: {
        productId: params.id,
        status: "PAID",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const buyers = purchases.map((purchase) => ({
      id: purchase.id,
      userName: `${purchase.user.firstName || ""} ${purchase.user.lastName || ""}`.trim() || "Client",
      userEmail: purchase.user.email,
      purchaseDate: purchase.createdAt.toISOString(),
      amount: purchase.amountCents / 100,
    }))

    return NextResponse.json({ buyers })
  } catch (error) {
    console.error("Error fetching buyers:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des acheteurs" },
      { status: 500 }
    )
  }
}
