import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
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
            email: true,
            name: true,
            clientProfile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const buyers = purchases.map((purchase) => {
      const firstName = purchase.user.clientProfile?.firstName || ""
      const lastName = purchase.user.clientProfile?.lastName || ""
      const fullName = `${firstName} ${lastName}`.trim() || purchase.user.name || "Client"
      
      return {
        id: purchase.id,
        userName: fullName,
        userEmail: purchase.user.email,
        purchaseDate: purchase.createdAt.toISOString(),
        amount: purchase.amountCents / 100,
      }
    })

    return NextResponse.json({ buyers })
  } catch (error) {
    console.error("Error fetching buyers:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des acheteurs" },
      { status: 500 }
    )
  }
}
