"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check, Lock, Sparkles } from "lucide-react"
import { UnlockCodeInput } from "@/components/unlock-code-input"

interface Product {
  id: string
  name: string
  description: string | null
  priceCents: number
  credits: number
  validityDays: number | null
  featured: boolean
  isHidden: boolean
}

interface TarifsSectionProps {
  visibleProducts: Product[]
  hiddenProducts: Product[]
  isLoggedIn: boolean
}

export function TarifsSection({ visibleProducts, hiddenProducts, isLoggedIn }: TarifsSectionProps) {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])
  
  // Combine visible products with unlocked hidden products
  const displayProducts = [
    ...visibleProducts,
    ...hiddenProducts.filter(p => unlockedIds.includes(p.id))
  ].sort((a, b) => {
    // Keep original order, but put newly unlocked at the beginning
    if (unlockedIds.includes(a.id) && !unlockedIds.includes(b.id)) return -1
    if (!unlockedIds.includes(a.id) && unlockedIds.includes(b.id)) return 1
    return 0
  })

  const hasHiddenProducts = hiddenProducts.length > 0
  const hasUnlockedProducts = unlockedIds.length > 0

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Unlock Code Input - Only show if there are hidden products and user is logged in */}
        {hasHiddenProducts && isLoggedIn && (
          <div className="mb-8">
            <UnlockCodeInput 
              onUnlock={setUnlockedIds} 
              unlockedIds={unlockedIds}
            />
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {displayProducts.map((product) => {
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
                    {product.credits >= 10 && (
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        Meilleur rapport qualité/prix
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    asChild 
                    className={`w-full ${
                      isUnlocked 
                        ? "bg-purple-600 hover:bg-purple-700" 
                        : isPopular 
                          ? "bg-tempo-bordeaux hover:bg-tempo-noir" 
                          : ""
                    }`}
                    variant={isPopular || isUnlocked ? "default" : "outline"}
                  >
                    <Link href={isLoggedIn ? "/app/paiements" : "/register"}>Acheter</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Hint for non-logged users about hidden products */}
        {hasHiddenProducts && !isLoggedIn && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" />
              Connectez-vous pour accéder aux offres exclusives avec un code
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
