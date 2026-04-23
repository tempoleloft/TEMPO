"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Crown, Calendar, CreditCard, RefreshCw, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cancelMembership } from "@/lib/actions/membership"
import type { Membership, MembershipPlan } from "@prisma/client"

interface MembershipCardProps {
  membership: Membership & { plan: MembershipPlan }
}

export function MembershipCard({ membership }: MembershipCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setIsLoading(true)
    const result = await cancelMembership(membership.id)
    setIsLoading(false)
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Une erreur est survenue")
    }
  }

  const isActive = membership.status === "ACTIVE"
  const isCancelling = membership.cancelAtPeriodEnd
  const isAutoRenew = membership.plan.renewalType === "AUTO"

  return (
    <Card className={`border-2 ${isActive && !isCancelling ? "border-purple-300 bg-gradient-to-br from-purple-50 to-white" : "border-amber-300 bg-gradient-to-br from-amber-50 to-white"}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className={`h-6 w-6 ${isActive && !isCancelling ? "text-purple-600" : "text-amber-600"}`} />
            <CardTitle>Mon Abonnement</CardTitle>
          </div>
          {isActive && !isCancelling ? (
            <Badge className="bg-purple-600">Actif</Badge>
          ) : isCancelling ? (
            <Badge variant="outline" className="text-amber-600 border-amber-300">Fin prévue</Badge>
          ) : (
            <Badge variant="secondary">Expiré</Badge>
          )}
        </div>
        <CardDescription>
          Formule {membership.plan.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Crédits / mois</p>
              <p className="font-semibold">{membership.plan.creditsPerMonth}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Membre depuis</p>
              <p className="font-semibold">{format(membership.startDate, "d MMM yyyy", { locale: fr })}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="p-4 bg-white rounded-lg border space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fin d'engagement</span>
            <span className="font-medium">{format(membership.commitmentEndDate, "d MMM yyyy", { locale: fr })}</span>
          </div>
          {isAutoRenew && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prochain prélèvement</span>
              <span className="font-medium">
                {isCancelling ? (
                  <span className="text-amber-600">Annulé</span>
                ) : (
                  format(membership.currentPeriodEnd, "d MMM yyyy", { locale: fr })
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Crédits valables jusqu'au</span>
            <span className="font-medium">{format(membership.creditsExpiryDate, "d MMM yyyy", { locale: fr })}</span>
          </div>
        </div>

        {/* Renewal type */}
        <div className="flex items-center gap-2 text-sm">
          {isAutoRenew ? (
            <>
              <RefreshCw className="h-4 w-4 text-tempo-bordeaux" />
              <span>Renouvellement automatique</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-tempo-bordeaux" />
              <span>Durée fixe (pas de renouvellement)</span>
            </>
          )}
        </div>

        {/* Cancellation warning or button */}
        {isCancelling ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Abonnement en cours d'annulation</p>
                <p className="text-sm text-amber-700 mt-1">
                  Votre abonnement prendra fin le {format(membership.currentPeriodEnd, "d MMMM yyyy", { locale: fr })}. 
                  Vous conservez vos crédits restants jusqu'au {format(membership.creditsExpiryDate, "d MMMM yyyy", { locale: fr })}.
                </p>
              </div>
            </div>
          </div>
        ) : isAutoRenew && isActive ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                Annuler mon abonnement
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Annuler votre abonnement ?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    Êtes-vous sûr de vouloir annuler votre abonnement <strong>{membership.plan.name}</strong> ?
                  </p>
                  <p>
                    Votre abonnement restera actif jusqu'au <strong>{format(membership.currentPeriodEnd, "d MMMM yyyy", { locale: fr })}</strong>.
                  </p>
                  <p>
                    Vos crédits resteront utilisables jusqu'au <strong>{format(membership.creditsExpiryDate, "d MMMM yyyy", { locale: fr })}</strong>.
                  </p>
                  <p className="text-amber-600 font-medium">
                    Cette action est irréversible. Aucun remboursement ne sera effectué.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirmer l'annulation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </CardContent>
    </Card>
  )
}
