"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { moveProductOrder } from "@/lib/actions/admin"
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react"

interface ProductOrderButtonsProps {
  productId: string
  isFirst: boolean
  isLast: boolean
}

export function ProductOrderButtons({ productId, isFirst, isLast }: ProductOrderButtonsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<"up" | "down" | null>(null)

  async function handleMove(direction: "up" | "down") {
    setIsLoading(direction)
    try {
      const result = await moveProductOrder(productId, direction)
      if (!result.success) {
        console.error(result.error)
      }
      router.refresh()
    } catch (error) {
      console.error("Error moving product:", error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => handleMove("up")}
        disabled={isFirst || isLoading !== null}
        title="Monter"
      >
        {isLoading === "up" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ChevronUp className="h-3 w-3" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => handleMove("down")}
        disabled={isLast || isLoading !== null}
        title="Descendre"
      >
        {isLoading === "down" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </Button>
    </div>
  )
}
