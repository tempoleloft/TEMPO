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
    const memberships = await db.membership.findMany({
      include: {
        user: {
          include: {
            clientProfile: true,
          }
        },
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Create CSV content
    const headers = [
      "Prénom",
      "Nom",
      "Email",
      "Formule",
      "Prix mensuel (€)",
      "Crédits/mois",
      "Date adhésion",
      "Fin engagement",
      "Prochain renouvellement",
      "Type renouvellement",
      "Statut",
      "Total crédits reçus",
    ]

    const rows = memberships.map((m) => {
      const status = m.status === "ACTIVE" 
        ? (m.cancelAtPeriodEnd ? "Fin prévue" : "Actif")
        : m.status === "CANCELLED" 
        ? "Annulé" 
        : "Expiré"
      
      return [
        m.user.clientProfile?.firstName || "",
        m.user.clientProfile?.lastName || "",
        m.user.email,
        m.plan.name,
        (m.plan.priceCentsPerMonth / 100).toFixed(2),
        m.plan.creditsPerMonth,
        format(m.startDate, "dd/MM/yyyy"),
        format(m.commitmentEndDate, "dd/MM/yyyy"),
        m.plan.renewalType === "AUTO" ? format(m.currentPeriodEnd, "dd/MM/yyyy") : "N/A",
        m.plan.renewalType === "AUTO" ? "Automatique" : "Durée fixe",
        status,
        m.totalCreditsGranted,
      ]
    })

    // Build CSV string with BOM for Excel compatibility
    const BOM = "\uFEFF"
    const csvContent = BOM + [
      headers.join(";"),
      ...rows.map((row) => 
        row.map((cell) => {
          const str = String(cell)
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
        "Content-Disposition": `attachment; filename="membres-tempo-${format(new Date(), "yyyy-MM-dd")}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 })
  }
}
