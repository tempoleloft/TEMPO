"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verifyUnlockCode } from "@/lib/actions/admin"
import { Lock, Loader2, Check, X } from "lucide-react"

interface UnlockCodeInputProps {
  onUnlock: (productIds: string[]) => void
  unlockedIds: string[]
}

export function UnlockCodeInput({ onUnlock, unlockedIds }: UnlockCodeInputProps) {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const result = await verifyUnlockCode(code)
      
      if (result.success && result.productIds) {
        // Merge with existing unlocked IDs
        const newIds = [...new Set([...unlockedIds, ...result.productIds])]
        onUnlock(newIds)
        setSuccess(true)
        setCode("")
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || "Code invalide")
      }
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Lock className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-purple-900">Vous avez un code ?</h3>
      </div>
      <p className="text-sm text-purple-700 mb-4">
        Entrez votre code pour débloquer des offres exclusives
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setError("")
          }}
          placeholder="VOTRE CODE"
          className="uppercase font-mono bg-white"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !code.trim()}
          className="bg-purple-600 hover:bg-purple-700 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Valider"
          )}
        </Button>
      </form>
      
      {error && (
        <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
          <Check className="h-4 w-4" />
          Offre débloquée !
        </div>
      )}
    </div>
  )
}
