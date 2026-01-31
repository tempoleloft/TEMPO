import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Check, CheckCircle, XCircle, ShieldCheck, ShoppingBag } from "lucide-react"
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

      {/* Credit Products (Courses) */}
      {products.filter(p => p.kind !== "MERCH").length > 0 && (
        <>
          <h2 className="text-lg sm:text-xl font-semibold text-tempo-bordeaux">Forfaits de cours</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.filter(p => p.kind !== "MERCH").map((product, index) => {
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
                  {/* Product Image */}
                  {product.imageUrl && (
                    <div className="relative w-full aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
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
        </>
      )}

      {/* Merch Products */}
      {products.filter(p => p.kind === "MERCH").length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-tempo-bordeaux flex items-center gap-2 mt-8">
            <ShoppingBag className="h-5 w-5" />
            Boutique
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.filter(p => p.kind === "MERCH").map((product) => (
              <Card key={product.id} className="relative">
                {/* Product Image */}
                {product.imageUrl ? (
                  <div className="relative w-full aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-tempo-taupe/10 rounded-t-lg flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-tempo-taupe/50" />
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg text-tempo-bordeaux">
                    {product.name}
                  </CardTitle>
                  {product.description && (
                    <CardDescription className="text-sm">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="text-center pb-4">
                  <span className="text-2xl font-bold text-tempo-bordeaux">
                    {(product.priceCents / 100).toFixed(0)}€
                  </span>
                </CardContent>
                <CardFooter>
                  <CheckoutButton productId={product.id} />
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

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
