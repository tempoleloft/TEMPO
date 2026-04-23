"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CreditCard, Users, Calendar, Gift, RefreshCw, Clock, MoreVertical, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toggleMembershipPlanActive, deleteMembershipPlan } from "@/lib/actions/membership"
import type { MembershipPlan } from "@prisma/client"

interface MembershipPlanCardProps {
  plan: MembershipPlan
  membersCount: number
}

export function MembershipPlanCard({ plan, membersCount }: MembershipPlanCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggleActive = async () => {
    setIsLoading(true)
    await toggleMembershipPlanActive(plan.id)
    setIsLoading(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette formule ? Cette action est irréversible.")) {
      return
    }
    setIsLoading(true)
    const result = await deleteMembershipPlan(plan.id)
    setIsLoading(false)
    if (!result.success) {
      alert(result.error)
    }
    router.refresh()
  }

  const pricePerMonth = (plan.priceCentsPerMonth / 100).toFixed(2)

  return (
    <Card className={!plan.isActive ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {plan.name}
              {!plan.isActive && (
                <Badge variant="secondary" className="text-xs">Inactif</Badge>
              )}
            </CardTitle>
            {plan.description && (
              <CardDescription className="mt-1">{plan.description}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleActive} disabled={isLoading}>
                {plan.isActive ? "Désactiver" : "Activer"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete} 
                disabled={isLoading || membersCount > 0}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price */}
        <div className="text-center py-4 bg-tempo-taupe/20 rounded-lg">
          <p className="text-3xl font-bold text-tempo-bordeaux">{pricePerMonth}€</p>
          <p className="text-sm text-muted-foreground">par mois</p>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-tempo-bordeaux" />
            <span><strong>{plan.creditsPerMonth}</strong> crédits / mois</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-tempo-bordeaux" />
            <span>Engagement <strong>{plan.commitmentMonths} mois</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {plan.renewalType === "AUTO" ? (
              <>
                <RefreshCw className="h-4 w-4 text-tempo-bordeaux" />
                <span>Renouvellement automatique</span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 text-tempo-bordeaux" />
                <span>Durée fixe</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-tempo-bordeaux" />
            <span><strong>{membersCount}</strong> membre{membersCount > 1 ? "s" : ""} actif{membersCount > 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Promo */}
        {(plan.promoFreeMonths || plan.promoBonusCredits) && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Gift className="h-4 w-4" />
              <span>
                {plan.promoFreeMonths && `${plan.promoFreeMonths} mois offert${plan.promoFreeMonths > 1 ? "s" : ""}`}
                {plan.promoFreeMonths && plan.promoBonusCredits && " + "}
                {plan.promoBonusCredits && `${plan.promoBonusCredits} crédit${plan.promoBonusCredits > 1 ? "s" : ""} bonus`}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
