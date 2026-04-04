import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { format } from "date-fns"

export async function GET() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const clients = await db.user.findMany({
      where: { role: "CLIENT" },
      include: {
        clientProfile: true,
        wallet: true,
        _count: {
          select: {
            reservations: true,
            purchases: true,
          },
        },
        purchases: {
          where: { status: "PAID" },
          select: { amountCents: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Create CSV content
    const headers = [
      "Prénom",
      "Nom",
      "Email",
      "Téléphone",
      "Crédits",
      "Réservations",
      "Achats",
      "Total dépensé (€)",
      "Date inscription",
      "Statut",
    ]

    const rows = clients.map((client) => {
      const totalSpent = client.purchases.reduce((sum, p) => sum + p.amountCents, 0) / 100
      
      return [
        client.clientProfile?.firstName || "",
        client.clientProfile?.lastName || "",
        client.email,
        client.clientProfile?.phone || "",
        client.wallet?.creditsBalance || 0,
        client._count.reservations,
        client._count.purchases,
        totalSpent.toFixed(2),
        format(client.createdAt, "dd/MM/yyyy"),
        client.isBlacklisted ? "Blacklisté" : "Actif",
      ]
    })

    // Build CSV string with BOM for Excel compatibility
    const BOM = "\uFEFF"
    const csvContent = BOM + [
      headers.join(";"),
      ...rows.map((row) => 
        row.map((cell) => {
          const str = String(cell)
          // Escape quotes and wrap in quotes if contains special chars
          if (str.includes(";") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }).join(";")
      ),
    ].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="clients-tempo-${format(new Date(), "yyyy-MM-dd")}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 })
  }
}
