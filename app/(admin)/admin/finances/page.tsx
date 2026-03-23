import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Wallet, TrendingUp, Users, Download } from "lucide-react"
import { ExportButton } from "@/components/admin/export-button"

export const dynamic = 'force-dynamic'

export default async function FinancesPage() {
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

  // Calculate stats
  const totalRevenue = purchases.reduce((sum, p) => sum + p.amountCents, 0)
  const thisMonthPurchases = purchases.filter(p => {
    const now = new Date()
    return p.createdAt.getMonth() === now.getMonth() && 
           p.createdAt.getFullYear() === now.getFullYear()
  })
  const thisMonthRevenue = thisMonthPurchases.reduce((sum, p) => sum + p.amountCents, 0)
  const uniqueClients = new Set(purchases.map(p => p.userId)).size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-tempo-bordeaux">Finances</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Suivi des paiements et exports
          </p>
        </div>
        <ExportButton />
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CA Total
            </CardTitle>
            <Wallet className="h-4 w-4 text-tempo-bordeaux" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tempo-bordeaux">
              {(totalRevenue / 100).toFixed(0)}€
            </div>
            <p className="text-xs text-muted-foreground">
              {purchases.length} paiements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CA ce mois
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(thisMonthRevenue / 100).toFixed(0)}€
            </div>
            <p className="text-xs text-muted-foreground">
              {thisMonthPurchases.length} paiements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients payants
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {uniqueClients}
            </div>
            <p className="text-xs text-muted-foreground">
              clients uniques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Panier moyen
            </CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {purchases.length > 0 
                ? (totalRevenue / 100 / purchases.length).toFixed(0)
                : 0}€
            </div>
            <p className="text-xs text-muted-foreground">
              par transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Historique des paiements</span>
            <Badge variant="secondary">{purchases.length} paiements</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun paiement enregistré</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium hidden md:table-cell">Email</th>
                    <th className="pb-3 font-medium">Produit</th>
                    <th className="pb-3 font-medium text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {purchases.map((purchase) => {
                    const firstName = purchase.user.clientProfile?.firstName || ""
                    const lastName = purchase.user.clientProfile?.lastName || ""
                    const fullName = firstName || lastName 
                      ? `${firstName} ${lastName}`.trim() 
                      : purchase.user.name || "Client"

                    return (
                      <tr key={purchase.id} className="hover:bg-muted/50">
                        <td className="py-3 text-sm">
                          {format(purchase.createdAt, "dd/MM/yyyy", { locale: fr })}
                          <span className="text-muted-foreground ml-1 hidden sm:inline">
                            {format(purchase.createdAt, "HH:mm")}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="font-medium text-sm">{fullName}</div>
                          <div className="text-xs text-muted-foreground md:hidden">
                            {purchase.user.email}
                          </div>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground hidden md:table-cell">
                          {purchase.user.email}
                        </td>
                        <td className="py-3 text-sm">
                          {purchase.product.name}
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-semibold text-tempo-bordeaux">
                            {(purchase.amountCents / 100).toFixed(0)}€
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
