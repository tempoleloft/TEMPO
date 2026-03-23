import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CheckCircle, XCircle, ShieldCheck, ShoppingBag } from "lucide-react"
import { ProductsWithUnlock } from "@/components/products-with-unlock"

interface PageProps {
  searchParams: { success?: string; canceled?: string; session_id?: string }
}

export default async function PaiementsPage({ searchParams }: PageProps) {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  const isSuccess = searchParams.success === "true"
  const isCanceled = searchParams.canceled === "true"

  const [products, wallet, purchases] = await Promise.all([
    db.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.wallet.findUnique({
      where: { userId: session.user.id },
    }),
    db.purchase.findMany({
      where: { 
        userId: session.user.id,
        status: "PAID",
      },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  // Separate visible and hidden products
  const visibleProducts = products.filter(p => !p.isHidden)
  const hiddenProducts = products.filter(p => p.isHidden)

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-4">
          <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-800">Paiement réussi !</h3>
            <p className="text-green-700 text-sm">
              Vos crédits ont été ajoutés à votre compte. Vous pouvez maintenant réserver vos cours.
            </p>
          </div>
        </div>
      )}

      {isCanceled && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-4">
          <XCircle className="h-8 w-8 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800">Paiement annulé</h3>
            <p className="text-amber-700 text-sm">
              Votre paiement a été annulé. Aucun montant n'a été débité.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-tempo-bordeaux">
            Acheter des cours
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Choisissez la formule adaptée à votre rythme
          </p>
        </div>
        <div className="text-left sm:text-right bg-white rounded-lg p-3 sm:p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Crédits actuels</p>
          <p className="text-2xl sm:text-3xl font-bold text-tempo-bordeaux">
            {wallet?.creditsBalance || 0}
          </p>
        </div>
      </div>

      {/* Products with unlock code support */}
      <ProductsWithUnlock 
        visibleProducts={visibleProducts}
        hiddenProducts={hiddenProducts}
      />

      {/* Security notice */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        <span>Paiement sécurisé par Stripe</span>
      </div>

      {/* Purchase History */}
      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des achats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchases.map((purchase) => {
                const isMerch = purchase.product.kind === "MERCH"
                return (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {purchase.product.imageUrl && (
                        <img
                          src={purchase.product.imageUrl}
                          alt={purchase.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{purchase.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(purchase.createdAt, "d MMMM yyyy", { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-tempo-bordeaux">
                        {(purchase.amountCents / 100).toFixed(0)}€
                      </p>
                      {!isMerch && purchase.creditsGranted > 0 && (
                        <Badge variant="secondary">
                          +{purchase.creditsGranted} crédits
                        </Badge>
                      )}
                      {isMerch && (
                        <Badge variant="outline">
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          Merch
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
