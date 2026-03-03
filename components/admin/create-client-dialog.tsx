"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/actions/admin"
import { UserPlus, Loader2 } from "lucide-react"

export function CreateClientDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    initialCredits: 0,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await createClient({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        initialCredits: formData.initialCredits,
      })

      if (result.success) {
        setOpen(false)
        setFormData({
          email: "",
          firstName: "",
          lastName: "",
          phone: "",
          initialCredits: 0,
        })
        router.refresh()
        if (result.userId) {
          router.push(`/admin/clients/${result.userId}`)
        }
      } else {
        setError(result.error || "Erreur lors de la création")
      }
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-tempo-bordeaux hover:bg-tempo-bordeaux/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un client</DialogTitle>
            <DialogDescription>
              Ajoutez manuellement un nouveau client au studio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Marie"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="marie@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="06 12 34 56 78"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="credits">Crédits initiaux</Label>
              <Input
                id="credits"
                type="number"
                min="0"
                value={formData.initialCredits}
                onChange={(e) => setFormData({ ...formData, initialCredits: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Nombre de crédits à attribuer au compte
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-tempo-bordeaux hover:bg-tempo-bordeaux/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
