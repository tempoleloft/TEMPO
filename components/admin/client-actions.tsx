"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { blacklistClient, unblacklistClient, deleteClient } from "@/lib/actions/admin"
import { Ban, Trash2, CheckCircle, Loader2 } from "lucide-react"

interface ClientActionsProps {
  userId: string
  isBlacklisted: boolean
  hasActiveReservations: boolean
}

export function ClientActions({ userId, isBlacklisted, hasActiveReservations }: ClientActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [blacklistReason, setBlacklistReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleBlacklist() {
    if (!blacklistReason.trim()) {
      setError("Veuillez indiquer une raison")
      return
    }
    
    setIsLoading("blacklist")
    setError(null)
    
    const result = await blacklistClient(userId, blacklistReason)
    
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || "Erreur")
    }
    
    setIsLoading(null)
  }

  async function handleUnblacklist() {
    setIsLoading("unblacklist")
    setError(null)
    
    const result = await unblacklistClient(userId)
    
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || "Erreur")
    }
    
    setIsLoading(null)
  }

  async function handleDelete() {
    setIsLoading("delete")
    setError(null)
    
    const result = await deleteClient(userId)
    
    if (result.success) {
      router.push("/admin/clients")
    } else {
      setError(result.error || "Erreur")
    }
    
    setIsLoading(null)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {error && (
        <p className="w-full text-sm text-red-600 mb-2">{error}</p>
      )}
      
      {isBlacklisted ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-green-600 border-green-300">
              <CheckCircle className="h-4 w-4 mr-1" />
              Retirer du blacklist
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Retirer du blacklist ?</AlertDialogTitle>
              <AlertDialogDescription>
                Ce client pourra à nouveau réserver des cours.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUnblacklist}
                disabled={isLoading === "unblacklist"}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading === "unblacklist" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirmer"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-orange-600 border-orange-300">
              <Ban className="h-4 w-4 mr-1" />
              Blacklister
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Blacklister ce client ?</AlertDialogTitle>
              <AlertDialogDescription>
                Ce client ne pourra plus réserver de cours tant qu'il sera blacklisté.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="reason">Raison du blacklist</Label>
              <Input
                id="reason"
                placeholder="Ex: No-shows répétés, comportement inapproprié..."
                value={blacklistReason}
                onChange={(e) => setBlacklistReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBlacklistReason("")}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBlacklist}
                disabled={isLoading === "blacklist"}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLoading === "blacklist" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Blacklister"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-red-600 border-red-300">
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données du client seront supprimées.
              {hasActiveReservations && (
                <span className="block mt-2 text-red-600 font-medium">
                  Ce client a des réservations actives. Annulez-les d'abord.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading === "delete" || hasActiveReservations}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading === "delete" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Supprimer définitivement"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
