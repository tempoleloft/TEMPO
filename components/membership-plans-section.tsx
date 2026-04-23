"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, Check, RefreshCw, Clock, Gift, Loader2 } from "lucide-react"
import Link from "next/link"
import type { MembershipPlan } from "@prisma/client"

interface MembershipPlansSectionProps {
  plans: MembershipPlan[]
  isLoggedIn: boolean
  hasActiveMembership: boolean
}

export function MembershipPlansSection({ plans, isLoggedIn, hasActiveMembership }: MembershipPlansSectionProps) {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (planId: string) => {
    if (!isLoggedIn) {
      router.push("/login?callbackUrl=/tarifs")
      return
    }

    setLoadingPlanId(planId)
    try {
      const response = await fetch("/api/checkout-membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Une erreur est survenue")
        setLoadingPlanId(null)
      }
    } catch (error) {
      console.error("Subscription error:", error)
      alert("Une erreur est survenue")
      setLoadingPlanId(null)
    }
  }

  return (
    <section id="plans" className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
            <Crown className="h-3 w-3 mr-1" />
            Abonnements
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-tempo-bordeaux mb-4">
            Nos formules Membership
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pratiquez régulièrement avec nos abonnements mensuels. 
            Crédits automatiques chaque mois, tarifs préférentiels.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const pricePerMonth = (plan.priceCentsPerMonth / 100).toFixed(0)
            const pricePerCredit = (plan.priceCentsPerMonth / 100 / plan.creditsPerMonth).toFixed(2)
            const isLoading = loadingPlanId === plan.id

            return (
              <Card key={plan.id} className="relative overflow-hidden">
                {plan.promoFreeMonths || plan.promoBonusCredits ? (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                    <Gift className="h-3 w-3 inline mr-1" />
                    PROMO
                  </div>
                ) : null}
                
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.description && (
                    <CardDescription>{plan.description}</CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center py-4 bg-tempo-taupe/20 rounded-lg">
                    <p className="text-4xl font-bold text-tempo-bordeaux">{pricePerMonth}€</p>
                    <p className="text-sm text-muted-foreground">par mois</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      soit {pricePerCredit}€ / crédit
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span><strong>{plan.creditsPerMonth} crédits</strong> par mois</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span>Engagement <strong>{plan.commitmentMonths} mois</strong></span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      {plan.renewalType === "AUTO" ? (
                        <>
                          <RefreshCw className="h-4 w-4 text-tempo-bordeaux shrink-0" />
                          <span>Renouvellement automatique</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-tempo-bordeaux shrink-0" />
                          <span>Durée fixe (pas de renouvellement)</span>
                        </>
                      )}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span>Crédits valables +1 mois après fin</span>
                    </li>
                  </ul>

                  {/* Promo */}
                  {(plan.promoFreeMonths || plan.promoBonusCredits) && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium">
                        🎁 {plan.promoFreeMonths && `${plan.promoFreeMonths} mois offert${plan.promoFreeMonths > 1 ? "s" : ""}`}
                        {plan.promoFreeMonths && plan.promoBonusCredits && " + "}
                        {plan.promoBonusCredits && `${plan.promoBonusCredits} crédit${plan.promoBonusCredits > 1 ? "s" : ""} bonus`}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  {hasActiveMembership ? (
                    <Button disabled className="w-full">
                      Déjà abonné
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading}
                      className="w-full bg-tempo-bordeaux hover:bg-tempo-noir"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Crown className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? "Chargement..." : "S'abonner"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Legal notice */}
        <p className="text-xs text-center text-muted-foreground mt-8 max-w-2xl mx-auto">
          En souscrivant, vous acceptez nos <Link href="/mentions-legales" className="underline">conditions d'abonnement</Link>. 
          Engagement ferme pour la durée choisie. Aucun remboursement ni report possible. 
          {plans.some(p => p.renewalType === "AUTO") && " Abonnements à renouvellement automatique : annulation possible avant chaque échéance."}
        </p>
      </div>
    </section>
  )
}
