"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ShoppingBag, Sparkles } from "lucide-react"
import { CheckoutButton } from "@/components/checkout/checkout-button"
import { UnlockCodeInput } from "@/components/unlock-code-input"

interface Product {
  id: string
  name: string
  description: string | null
  kind: string
  priceCents: number
  credits: number
  validityDays: number | null
  imageUrl: string | null
  featured: boolean
  isHidden: boolean
}

interface ProductsWithUnlockProps {
  visibleProducts: Product[]
  hiddenProducts: Product[]
}

export function ProductsWithUnlock({ visibleProducts, hiddenProducts }: ProductsWithUnlockProps) {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  
  // Separate by kind
  const visibleCourseProducts = visibleProducts.filter(p => p.kind !== "MERCH")
  const hiddenCourseProducts = hiddenProducts.filter(p => p.kind !== "MERCH")
  const visibleMerchProducts = visibleProducts.filter(p => p.kind === "MERCH")
  const hiddenMerchProducts = hiddenProducts.filter(p => p.kind === "MERCH")
  
  // Combine visible with unlocked hidden products
  const courseProducts = [
    ...hiddenCourseProducts.filter(p => unlockedIds.includes(p.id)),
    ...visibleCourseProducts,
  ]
  const merchProducts = [
    ...hiddenMerchProducts.filter(p => unlockedIds.includes(p.id)),
    ...visibleMerchProducts,
  ]

  const hasHiddenProducts = hiddenProducts.length > 0

  return (
    <>
      {/* Unlock Code Input */}
      {hasHiddenProducts && (
        <div className="mb-6">
          <UnlockCodeInput 
            onUnlock={setUnlockedIds} 
            unlockedIds={unlockedIds}
          />
        </div>
      )}

      {/* Credit Products (Courses) */}
      {courseProducts.length > 0 && (
        <>
          <h2 className="text-lg sm:text-xl font-semibold text-tempo-bordeaux">Forfaits de cours</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courseProducts.map((product) => {
              const pricePerClass = product.credits > 0 
                ? (product.priceCents / 100 / product.credits).toFixed(0)
                : (product.priceCents / 100).toFixed(0)
              
              const isPopular = product.featured
              const isUnlocked = unlockedIds.includes(product.id)

              return (
                <Card 
                  key={product.id} 
                  className={`relative ${
                    isUnlocked 
                      ? "border-purple-500 border-2 shadow-lg ring-2 ring-purple-200" 
                      : isPopular 
                        ? "border-tempo-bordeaux border-2 shadow-lg" 
                        : ""
                  }`}
                >
                  {isUnlocked && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Offre exclusive
                    </Badge>
                  )}
                  {isPopular && !isUnlocked && (
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
                    <CardTitle className={isUnlocked ? "text-purple-700" : "text-tempo-bordeaux"}>
                      {product.name}
                    </CardTitle>
                    <CardDescription>
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <span className={`text-4xl font-bold ${isUnlocked ? "text-purple-700" : "text-tempo-bordeaux"}`}>
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
                      isPopular={isPopular || isUnlocked}
                      variant={isUnlocked ? "purple" : undefined}
                    />
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Merch Products */}
      {merchProducts.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-tempo-bordeaux flex items-center gap-2 mt-8">
            <ShoppingBag className="h-5 w-5" />
            Boutique
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {merchProducts.map((product) => {
              const isUnlocked = unlockedIds.includes(product.id)
              
              return (
                <Card key={product.id} className={isUnlocked ? "border-purple-500 border-2" : ""}>
                  {product.imageUrl && (
                    <div className="relative w-full aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="p-4">
                    <CardTitle className={`text-base ${isUnlocked ? "text-purple-700" : ""}`}>
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <span className={`text-2xl font-bold ${isUnlocked ? "text-purple-700" : "text-tempo-bordeaux"}`}>
                      {(product.priceCents / 100).toFixed(0)}€
                    </span>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <CheckoutButton 
                      productId={product.id}
                      isPopular={false}
                      size="sm"
                    />
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
