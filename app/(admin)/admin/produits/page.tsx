import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Package, Check } from "lucide-react"
import Link from "next/link"
import { ProductToggle } from "@/components/admin/product-toggle"

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tempo-bordeaux">Produits</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos offres de cours
          </p>
        </div>
        <Button asChild className="bg-tempo-bordeaux hover:bg-tempo-noir">
          <Link href="/admin/produits/new">
            <Plus className="h-4 w-4 mr-2" />
            Créer un produit
          </Link>
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => {
          const stats = statsMap.get(product.id)
          const pricePerClass = product.credits > 0
            ? (product.priceCents / 100 / product.credits).toFixed(0)
            : (product.priceCents / 100).toFixed(0)

          return (
            <Card key={product.id} className={!product.active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {product.name}
                      {!product.active && (
                        <Badge variant="outline">Inactif</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProductToggle productId={product.id} isActive={product.active} />
                    <Badge variant={product.kind === "PACK" ? "default" : "secondary"}>
                      {product.kind === "PACK" ? "Pack" : "Unité"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4 bg-tempo-taupe/10 rounded-lg">
                  <span className="text-3xl font-bold text-tempo-bordeaux">
                    {(product.priceCents / 100).toFixed(0)}€
                  </span>
                  {product.credits > 1 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {pricePerClass}€ / cours
                    </p>
                  )}
                </div>

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
