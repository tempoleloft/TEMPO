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
import { Pencil, Loader2 } from "lucide-react"

const ACQUISITION_SOURCES = [
  { value: "WALK_IN", label: "Walk-in (direct)" },
  { value: "CLASSPASS", label: "ClassPass" },
  { value: "GYMLIB", label: "Gymlib" },
  { value: "LASTSPOT", label: "Lastspot" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "WORD_OF_MOUTH", label: "Bouche à oreille" },
  { value: "PARTNERSHIP", label: "Partenariat" },
  { value: "EVENT", label: "Événement" },
  { value: "OTHER", label: "Autre" },
]

interface WalkInData {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  source: string
  numeroReservation: string | null
}

interface EditWalkInDialogProps {
  walkIn: WalkInData
  children?: React.ReactNode
}

export function EditWalkInDialog({ walkIn, children }: EditWalkInDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [firstName, setFirstName] = useState(walkIn.firstName)
  const [lastName, setLastName] = useState(walkIn.lastName)
  const [email, setEmail] = useState(walkIn.email || "")
  const [phone, setPhone] = useState(walkIn.phone || "")
  const [source, setSource] = useState(walkIn.source)
  const [numeroReservation, setNumeroReservation] = useState(walkIn.numeroReservation || "")

  const handleUpdate = async () => {
    if (!firstName || !lastName || !source) {
      alert("Prénom, nom et source sont requis")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/walkin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walkInId: walkIn.id,
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          source,
          numeroReservation: numeroReservation || null,
        }),
      })

      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erreur lors de la modification")
      }
    } catch (error) {
      console.error("Update error:", error)
      alert("Erreur lors de la modification")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFirstName(walkIn.firstName)
    setLastName(walkIn.lastName)
    setEmail(walkIn.email || "")
    setPhone(walkIn.phone || "")
    setSource(walkIn.source)
    setNumeroReservation(walkIn.numeroReservation || "")
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) resetForm()
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le participant</DialogTitle>
          <DialogDescription>
            Corrigez les informations de {walkIn.firstName} {walkIn.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">Prénom *</Label>
              <Input
                id="edit-firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Nom *</Label>
              <Input
                id="edit-lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-source">Source *</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="Comment a-t-il connu Tempo ?" />
              </SelectTrigger>
              <SelectContent>
                {ACQUISITION_SOURCES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-numeroReservation">N° réservation (optionnel)</Label>
            <Input
              id="edit-numeroReservation"
              value={numeroReservation}
              onChange={(e) => setNumeroReservation(e.target.value)}
              placeholder="Ex: abc123..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email (optionnel)</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">Téléphone (optionnel)</Label>
            <Input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
            />
          </div>

          <Button
            onClick={handleUpdate}
            disabled={loading || !firstName || !lastName}
            className="w-full"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enregistrer les modifications
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
