"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"

interface CheckoutButtonProps {
  productId: string
  isPopular?: boolean
}

export function CheckoutButton({ productId, isPopular = false }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleCheckout() {
    setIsLoading(true)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du paiement")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert(error instanceof Error ? error.message : "Erreur lors du paiement")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`w-full ${isPopular ? "bg-tempo-bordeaux hover:bg-tempo-noir" : ""}`}
      variant={isPopular ? "default" : "outline"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      {isLoading ? "Redirection..." : "Acheter"}
    </Button>
  )
}
