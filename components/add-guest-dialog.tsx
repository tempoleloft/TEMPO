"use client"

import { useState } from "react"
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
import { UserPlus, Loader2 } from "lucide-react"
import { addGuestToReservation } from "@/lib/actions/booking"
import { useRouter } from "next/navigation"

type Props = {
  reservationId: string
  sessionName: string
  userCredits: number
}

export function AddGuestDialog({ reservationId, sessionName, userCredits }: Props) {
  const [open, setOpen] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!firstName.trim() || !lastName.trim()) {
      setError("Veuillez remplir le nom et le prénom")
      return
    }

    if (email.trim() && !email.includes("@")) {
      setError("Veuillez entrer une adresse email valide")
      return
    }

    setIsLoading(true)

    const result = await addGuestToReservation(reservationId, firstName.trim(), lastName.trim(), email.trim() || undefined)

    if (result.success) {
      setOpen(false)
      setFirstName("")
      setLastName("")
      setEmail("")
      router.refresh()
    } else {
      setError(result.error || "Une erreur est survenue")
    }

    setIsLoading(false)
  }

  const hasCredits = userCredits >= 1

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-tempo-bordeaux text-tempo-bordeaux hover:bg-tempo-bordeaux hover:text-white"
          disabled={!hasCredits}
          title={!hasCredits ? "Vous n'avez pas assez de crédits" : "Ajouter un invité"}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          +1
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un invité (+1)</DialogTitle>
          <DialogDescription>
            Invitez quelqu'un à vous accompagner au cours "{sessionName}".
            Un crédit sera utilisé pour cette réservation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Prénom de l'invité</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Nom de l'invité</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email de l'invité (optionnel)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Un email de confirmation sera envoyé à cette adresse
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <p className="text-sm text-muted-foreground">
              💳 Crédits disponibles : {userCredits}
            </p>
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
              className="bg-tempo-bordeaux hover:bg-tempo-noir"
              disabled={isLoading || !hasCredits}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout...
                </>
              ) : (
                "Confirmer (+1 crédit)"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
