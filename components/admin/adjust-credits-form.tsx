"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adjustCredits } from "@/lib/actions/admin"
import { Loader2, Plus, Minus } from "lucide-react"

interface AdjustCreditsFormProps {
  userId: string
  currentBalance: number
}

export function AdjustCreditsForm({ userId, currentBalance }: AdjustCreditsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState(1)
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleAdjust(delta: number) {
    setIsLoading(true)
    setMessage(null)

    const result = await adjustCredits(userId, delta, notes || `Ajustement de ${delta >= 0 ? "+" : ""}${delta} crédits`)
    
    if (result.success) {
      setMessage({ type: "success", text: `Crédits ajustés : ${delta >= 0 ? "+" : ""}${delta}` })
      setNotes("")
      router.refresh()
    } else {
      setMessage({ type: "error", text: result.error || "Erreur" })
    }
    
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">Solde actuel</p>
        <p className="text-3xl font-bold text-tempo-bordeaux">{currentBalance}</p>
        <p className="text-xs text-muted-foreground">crédits</p>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.type === "success" 
            ? "bg-green-50 text-green-700" 
            : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="amount">Nombre de crédits</Label>
          <Input
            id="amount"
            type="number"
            min={1}
            max={100}
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Note (optionnel)</Label>
          <Input
            id="notes"
            placeholder="Ex: Geste commercial, correction erreur..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleAdjust(amount)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter {amount}
              </>
            )}
          </Button>
          <Button
            onClick={() => handleAdjust(-amount)}
            disabled={isLoading || currentBalance < amount}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Minus className="h-4 w-4 mr-1" />
                Retirer {amount}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
