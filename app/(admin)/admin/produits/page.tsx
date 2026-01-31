import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Package, Check, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { ProductToggle } from "@/components/admin/product-toggle"
import { ProductActions } from "@/components/admin/product-actions"

export default async function AdminProduitsPage() {
  const [products, purchaseStats] = await Promise.all([
    db.product.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    db.purchase.groupBy({
      by: ["productId"],
      where: { status: "PAID" },
      _count: true,
      _sum: { amountCents: true },
    }),
  ])

  const statsMap = new Map(
    purchaseStats.map((s) => [
      s.productId,
      { count: s._count, revenue: s._sum.amountCents || 0 },
    ])
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-tempo-bordeaux">Produits</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gérez vos offres (cours et merchandising)
          </p>
        </div>
        <Button asChild className="bg-tempo-bordeaux hover:bg-tempo-noir w-full sm:w-auto">
          <Link href="/admin/produits/new">
            <Plus className="h-4 w-4 mr-2" />
            Créer un produit
          </Link>
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => {
          const stats = statsMap.get(product.id)
          const pricePerClass = product.credits > 0
            ? (product.priceCents / 100 / product.credits).toFixed(0)
            : (product.priceCents / 100).toFixed(0)
          const isMerch = product.kind === "MERCH"

          const kindLabel = {
            SINGLE: "Unité",
            PACK: "Pack",
            MERCH: "Merch",
          }[product.kind]

          return (
            <Card key={product.id} className={!product.active ? "opacity-60" : ""}>
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
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2">
                      {product.name}
                      {!product.active && (
                        <Badge variant="outline">Inactif</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <ProductToggle productId={product.id} isActive={product.active} />
                    <ProductActions 
                      productId={product.id} 
                      productName={product.name}
                      hasPurchases={!!stats && stats.count > 0}
                    />
                  </div>
                </div>
                <Badge 
                  variant={isMerch ? "outline" : product.kind === "PACK" ? "default" : "secondary"}
                  className="w-fit"
                >
                  {isMerch && <ShoppingBag className="h-3 w-3 mr-1" />}
                  {kindLabel}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4 bg-tempo-taupe/10 rounded-lg">
                  <span className="text-3xl font-bold text-tempo-bordeaux">
                    {(product.priceCents / 100).toFixed(0)}€
                  </span>
                  {!isMerch && product.credits > 1 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {pricePerClass}€ / cours
                    </p>
                  )}
                </div>

                {!isMerch ? (
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      {product.credits} crédit{product.credits > 1 ? "s" : ""}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Validité {product.validityDays} jours
                    </li>
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground text-center">
                    <ShoppingBag className="h-5 w-5 mx-auto mb-1 opacity-50" />
                    Produit merchandising
                  </div>
                )}

                {stats && (
                  <div className="pt-4 border-t text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Ventes</span>
                      <span className="font-medium text-foreground">{stats.count}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground mt-1">
                      <span>CA total</span>
                      <span className="font-medium text-foreground">
                        {(stats.revenue / 100).toFixed(0)}€
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun produit configuré</p>
        </div>
      )}
    </div>
  )
}
