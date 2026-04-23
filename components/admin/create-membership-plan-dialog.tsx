"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { createMembershipPlan } from "@/lib/actions/membership"

export function CreateMembershipPlanDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    creditsPerMonth: "4",
    pricePerMonth: "65",
    commitmentMonths: "2",
    renewalType: "AUTO" as "AUTO" | "FIXED",
    promoFreeMonths: "",
    promoBonusCredits: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await createMembershipPlan({
      name: formData.name,
      description: formData.description || undefined,
      creditsPerMonth: parseInt(formData.creditsPerMonth),
      priceCentsPerMonth: Math.round(parseFloat(formData.pricePerMonth) * 100),
      commitmentMonths: parseInt(formData.commitmentMonths),
      renewalType: formData.renewalType,
      promoFreeMonths: formData.promoFreeMonths ? parseInt(formData.promoFreeMonths) : undefined,
      promoBonusCredits: formData.promoBonusCredits ? parseInt(formData.promoBonusCredits) : undefined,
    })

    setIsLoading(false)

    if (result.success) {
      setOpen(false)
      setFormData({
        name: "",
        description: "",
        creditsPerMonth: "4",
        pricePerMonth: "65",
        commitmentMonths: "2",
        renewalType: "AUTO",
        promoFreeMonths: "",
        promoBonusCredits: "",
      })
      router.refresh()
    } else {
      setError(result.error || "Une erreur est survenue")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-tempo-bordeaux hover:bg-tempo-noir">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle formule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer une formule d'abonnement</DialogTitle>
            <DialogDescription>
              Définissez les paramètres de votre nouvelle formule membership.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de la formule *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Essentiel, Premium, Illimité"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la formule..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="creditsPerMonth">Crédits / mois *</Label>
                <Input
                  id="creditsPerMonth"
                  type="number"
                  min="1"
                  value={formData.creditsPerMonth}
                  onChange={(e) => setFormData({ ...formData, creditsPerMonth: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pricePerMonth">Prix / mois (€) *</Label>
                <Input
                  id="pricePerMonth"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="commitmentMonths">Engagement (mois) *</Label>
                <Select
                  value={formData.commitmentMonths}
                  onValueChange={(value) => setFormData({ ...formData, commitmentMonths: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 mois</SelectItem>
                    <SelectItem value="3">3 mois</SelectItem>
                    <SelectItem value="6">6 mois</SelectItem>
                    <SelectItem value="12">12 mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="renewalType">Type de renouvellement *</Label>
                <Select
                  value={formData.renewalType}
                  onValueChange={(value) => setFormData({ ...formData, renewalType: value as "AUTO" | "FIXED" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTO">Automatique</SelectItem>
                    <SelectItem value="FIXED">Durée fixe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <p className="text-sm font-medium mb-3">Options promotionnelles (optionnel)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="promoFreeMonths">Mois offerts</Label>
                  <Input
                    id="promoFreeMonths"
                    type="number"
                    min="0"
                    value={formData.promoFreeMonths}
                    onChange={(e) => setFormData({ ...formData, promoFreeMonths: e.target.value })}
                    placeholder="Ex: 1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mois gratuits à la souscription
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="promoBonusCredits">Crédits bonus</Label>
                  <Input
                    id="promoBonusCredits"
                    type="number"
                    min="0"
                    value={formData.promoBonusCredits}
                    onChange={(e) => setFormData({ ...formData, promoBonusCredits: e.target.value })}
                    placeholder="Ex: 2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Crédits offerts à la souscription
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-tempo-bordeaux hover:bg-tempo-noir">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer la formule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
