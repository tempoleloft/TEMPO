"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Buyer {
  id: string
  userName: string
  userEmail: string
  purchaseDate: string
  amount: number
}

interface ProductBuyersProps {
  productId: string
  productName: string
  purchaseCount: number
}

export function ProductBuyers({ productId, productName, purchaseCount }: ProductBuyersProps) {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && buyers.length === 0 && !loading) {
      const fetchBuyers = async () => {
        setLoading(true)
        try {
          const res = await fetch(`/api/admin/products/${productId}/buyers`)
          if (res.ok) {
            const data = await res.json()
            setBuyers(data.buyers || [])
          }
        } catch (error) {
          console.error("Error fetching buyers:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchBuyers()
    }
  }, [open, productId, buyers.length, loading])

  if (purchaseCount === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2"
        >
          <Users className="h-4 w-4 mr-2" />
          Voir les acheteurs ({purchaseCount})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Acheteurs - {productName}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-tempo-bordeaux" />
          </div>
        ) : buyers.length > 0 ? (
          <div className="space-y-3">
            {buyers.map((buyer) => (
              <div 
                key={buyer.id} 
                className="flex items-center justify-between p-3 bg-tempo-taupe/10 rounded-lg"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{buyer.userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{buyer.userEmail}</p>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="font-medium text-sm text-tempo-bordeaux">{buyer.amount}€</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(buyer.purchaseDate), "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Aucun acheteur trouvé
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
