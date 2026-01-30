import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Check, CheckCircle, XCircle, ShieldCheck } from "lucide-react"
import { CheckoutButton } from "@/components/checkout/checkout-button"

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tempo-bordeaux">
            Acheter des cours
          </h1>
          <p className="text-muted-foreground mt-1">
            Choisissez la formule adaptée à votre rythme
          </p>
        </div>
        <div className="text-right bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Crédits actuels</p>
          <p className="text-3xl font-bold text-tempo-bordeaux">
            {wallet?.creditsBalance || 0}
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product, index) => {
          const pricePerClass = product.credits > 0 
            ? (product.priceCents / 100 / product.credits).toFixed(0)
            : (product.priceCents / 100).toFixed(0)
          
          const isPopular = index === 2

          return (
            <Card 
              key={product.id} 
              className={`relative ${isPopular ? "border-tempo-bordeaux border-2 shadow-lg" : ""}`}
            >
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-tempo-bordeaux">
                  Meilleure offre
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-tempo-bordeaux">
                  {product.name}
                </CardTitle>
                <CardDescription>
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-tempo-bordeaux">
                    {(product.priceCents / 100).toFixed(0)}€
                  </span>
                </div>
                {product.credits > 1 && (
                  <p className="text-sm text-muted-foreground mb-6">
                    soit {pricePerClass}€ par cours
                  </p>
                )}
                <ul className="space-y-3 text-left">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    {product.credits} cours
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    Valable {product.validityDays} jours
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    Tous les cours inclus
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <CheckoutButton 
                  productId={product.id}
                  isPopular={isPopular}
                />
              </CardFooter>
            </Card>
          )
        })}
      </div>

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
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{purchase.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(purchase.createdAt, "d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-tempo-bordeaux">
                      {(purchase.amountCents / 100).toFixed(0)}€
                    </p>
                    <Badge variant="secondary">
                      +{purchase.creditsGranted} crédits
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
