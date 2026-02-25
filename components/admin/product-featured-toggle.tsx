"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toggleProductFeatured } from "@/lib/actions/admin"
import { Star, Loader2 } from "lucide-react"

interface ProductFeaturedToggleProps {
  productId: string
  isFeatured: boolean
}

export function ProductFeaturedToggle({ productId, isFeatured }: ProductFeaturedToggleProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggle() {
    setIsLoading(true)
    try {
      const result = await toggleProductFeatured(productId)
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
      className={isFeatured ? "text-yellow-500" : "text-muted-foreground"}
      title={isFeatured ? "Retirer 'Meilleure offre'" : "Définir comme 'Meilleure offre'"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Star className={`h-4 w-4 ${isFeatured ? "fill-current" : ""}`} />
      )}
    </Button>
  )
}
