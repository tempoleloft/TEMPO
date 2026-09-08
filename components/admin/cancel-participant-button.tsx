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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Trash2, Loader2 } from "lucide-react"

interface CancelParticipantButtonProps {
  reservationId: string
  participantName: string
  hasCredits?: boolean
}

export function CancelParticipantButton({ 
  reservationId, 
  participantName,
  hasCredits = true 
}: CancelParticipantButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [refundCredit, setRefundCredit] = useState(true)

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/reservation/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          reservationId,
          refundCredit 
        }),
      })

      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erreur lors de l'annulation")
      }
    } catch (error) {
      console.error("Cancel error:", error)
      alert("Erreur lors de l'annulation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Annuler cette réservation ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous allez annuler la réservation de <strong>{participantName}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {hasCredits && (
          <div className="flex items-center space-x-2 py-4">
            <Checkbox 
              id="refund" 
              checked={refundCredit}
              onCheckedChange={(checked) => setRefundCredit(checked as boolean)}
            />
            <Label htmlFor="refund" className="text-sm">
              Rembourser le crédit au client
            </Label>
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirmer l&apos;annulation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
