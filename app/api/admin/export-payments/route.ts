import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import * as XLSX from "xlsx"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export async function GET() {
  try {
    // Check admin authorization
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Get all paid purchases with user info
    const purchases = await db.purchase.findMany({
      where: { status: "PAID" },
      include: {
        user: {
          include: {
            clientProfile: true,
          },
        },
        product: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Transform data for Excel
    const data = purchases.map((purchase) => {
      const firstName = purchase.user.clientProfile?.firstName || ""
      const lastName = purchase.user.clientProfile?.lastName || ""
      
      return {
        "Date de paiement": format(purchase.createdAt, "dd/MM/yyyy HH:mm", { locale: fr }),
        "Produit": purchase.product.name,
        "Prénom": firstName || "-",
        "Nom": lastName || "-",
        "Email": purchase.user.email,
        "Montant (€)": (purchase.amountCents / 100).toFixed(2),
        "Crédits": purchase.creditsGranted || 0,
      }
    })

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Set column widths
    worksheet["!cols"] = [
      { wch: 18 }, // Date
      { wch: 25 }, // Produit
      { wch: 15 }, // Prénom
      { wch: 15 }, // Nom
      { wch: 30 }, // Email
      { wch: 12 }, // Montant
      { wch: 10 }, // Crédits
    ]

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Paiements")

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="paiements-tempo-${format(new Date(), "yyyy-MM-dd")}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 })
  }
}
