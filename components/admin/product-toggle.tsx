"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toggleProductActive } from "@/lib/actions/admin"
import { Eye, EyeOff, Loader2 } from "lucide-react"

interface ProductToggleProps {
  productId: string
  isActive: boolean
}

export function ProductToggle({ productId, isActive }: ProductToggleProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggle() {
    setIsLoading(true)
    try {
      const result = await toggleProductActive(productId)
      if (!result.success) {
        alert(result.error)
      }
      router.refresh()
    } catch (error) {
      alert("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={isActive ? "text-green-600" : "text-muted-foreground"}
      title={isActive ? "Désactiver" : "Activer"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isActive ? (
        <Eye className="h-4 w-4" />
      ) : (
        <EyeOff className="h-4 w-4" />
      )}
    </Button>
  )
}
