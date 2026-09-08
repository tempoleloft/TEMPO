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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Search, Loader2 } from "lucide-react"

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

interface Client {
  id: string
  email: string
  clientProfile: {
    firstName: string
    lastName: string
    phone: string | null
  } | null
}

interface AddParticipantDialogProps {
  sessionId: string
  sessionName: string
}

export function AddParticipantDialog({ sessionId, sessionName }: AddParticipantDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Client[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  // Manual entry fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [source, setSource] = useState("WALK_IN")
  const [numeroReservation, setNumeroReservation] = useState("")

  const searchClients = async () => {
    if (searchQuery.length < 2) return
    setSearching(true)
    try {
      const res = await fetch(`/api/admin/clients/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.clients || [])
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setSearching(false)
    }
  }

  const handleAddExistingClient = async () => {
    if (!selectedClient) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/session/add-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          type: "existing",
          userId: selectedClient.id,
        }),
      })

      if (res.ok) {
        setOpen(false)
        resetForm()
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erreur lors de l'ajout")
      }
    } catch (error) {
      console.error("Add error:", error)
      alert("Erreur lors de l'ajout")
    } finally {
      setLoading(false)
    }
  }

  const handleAddManualParticipant = async () => {
    if (!firstName || !lastName || !source) {
      alert("Prénom, nom et source sont requis")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/session/add-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          type: "manual",
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
        resetForm()
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erreur lors de l'ajout")
      }
    } catch (error) {
      console.error("Add error:", error)
      alert("Erreur lors de l'ajout")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSearchQuery("")
    setSearchResults([])
    setSelectedClient(null)
    setFirstName("")
    setLastName("")
    setEmail("")
    setPhone("")
    setSource("WALK_IN")
    setNumeroReservation("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter un participant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un participant</DialogTitle>
          <DialogDescription>
            Ajouter un participant au cours : {sessionName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Saisie manuelle</TabsTrigger>
            <TabsTrigger value="existing">Client existant</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nom"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source *</Label>
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
              <Label htmlFor="numeroReservation">N° réservation (optionnel)</Label>
              <Input
                id="numeroReservation"
                value={numeroReservation}
                onChange={(e) => setNumeroReservation(e.target.value)}
                placeholder="Ex: abc123..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optionnel)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
              />
            </div>

            <Button
              onClick={handleAddManualParticipant}
              disabled={loading || !firstName || !lastName}
              className="w-full"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ajouter le participant
            </Button>
          </TabsContent>

          <TabsContent value="existing" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchClients()}
              />
              <Button onClick={searchClients} disabled={searching || searchQuery.length < 2}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((client) => (
                  <div
                    key={client.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                      selectedClient?.id === client.id ? "bg-tempo-taupe/20" : ""
                    }`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <p className="font-medium">
                      {client.clientProfile?.firstName} {client.clientProfile?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedClient && (
              <div className="p-3 bg-tempo-taupe/10 rounded-lg">
                <p className="font-medium">
                  {selectedClient.clientProfile?.firstName} {selectedClient.clientProfile?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
              </div>
            )}

            <Button
              onClick={handleAddExistingClient}
              disabled={loading || !selectedClient}
              className="w-full"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ajouter ce client
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
