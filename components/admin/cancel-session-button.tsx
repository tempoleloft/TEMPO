"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { cancelSession } from "@/lib/actions/admin"
import { XCircle, Loader2, AlertTriangle } from "lucide-react"

interface CancelSessionButtonProps {
  sessionId: string
  sessionTitle: string
  participantsCount: number
  isCancelled: boolean
}

export function CancelSessionButton({ 
  sessionId, 
  sessionTitle, 
  participantsCount,
  isCancelled,
}: CancelSessionButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleCancel() {
    setIsLoading(true)
    setError("")

    try {
      const result = await cancelSession(sessionId)
      
      if (!result.success) {
        setError(result.error || "Erreur lors de l'annulation")
        setIsLoading(false)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError("Une erreur est survenue")
      setIsLoading(false)
    }
  }

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200">
        <XCircle className="h-5 w-5" />
        <span className="font-medium">Cours annulé</span>
      </div>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
          <XCircle className="h-4 w-4 mr-2" />
          Annuler ce cours
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Annuler ce cours ?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Vous êtes sur le point d'annuler le cours <strong>{sessionTitle}</strong>.
              </p>
              
              {participantsCount > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
                  <p className="font-medium">
                    ⚠️ {participantsCount} participant{participantsCount > 1 ? "s" : ""} inscrit{participantsCount > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm mt-1">
                    Les crédits seront automatiquement remboursés et un email de notification sera envoyé à chaque participant.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun participant inscrit pour le moment.
                </p>
              )}
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Retour</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Annulation...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Confirmer l'annulation
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
