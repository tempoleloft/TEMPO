"use client"

import { useState, useEffect } from "react"
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
import { Pencil, Plus } from "lucide-react"
import { updateSession, createClassType } from "@/lib/actions/admin"
import { useRouter } from "next/navigation"

interface ClassType {
  id: string
  title: string
  durationMin: number
  level: string | null
}

interface EditSessionButtonProps {
  sessionId: string
  currentData: {
    classTypeId: string
    date: string
    time: string
    endTime: string
    capacity: number
    location: string | null
    level: string | null
  }
}

export function EditSessionButton({ sessionId, currentData }: EditSessionButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [showNewClassType, setShowNewClassType] = useState(false)
  const [newClassType, setNewClassType] = useState({
    title: "",
    description: "",
    durationMin: 60,
    level: "",
  })
  
  const [formData, setFormData] = useState({
    classTypeId: currentData.classTypeId,
    date: currentData.date,
    time: currentData.time,
    endTime: currentData.endTime,
    capacity: currentData.capacity,
    location: currentData.location || "",
    level: currentData.level || "",
  })

  useEffect(() => {
    async function fetchClassTypes() {
      const res = await fetch("/api/admin/class-types")
      if (res.ok) {
        const data = await res.json()
        setClassTypes(data)
      }
    }
    if (open) {
      fetchClassTypes()
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      let classTypeId = formData.classTypeId

      // Si nouveau type de cours, le créer d'abord
      if (showNewClassType) {
        if (!newClassType.title.trim()) {
          setError("Le nom du type de cours est requis")
          setIsLoading(false)
          return
        }

        const classTypeResult = await createClassType({
          title: newClassType.title.trim(),
          description: newClassType.description.trim() || undefined,
          durationMin: newClassType.durationMin,
          level: newClassType.level || undefined,
        })

        if (!classTypeResult.success || !classTypeResult.classTypeId) {
          setError(classTypeResult.error || "Erreur lors de la création du type de cours")
          setIsLoading(false)
          return
        }

        classTypeId = classTypeResult.classTypeId
      }

      const result = await updateSession(sessionId, {
        classTypeId,
        date: formData.date,
        time: formData.time,
        endTime: formData.endTime,
        capacity: formData.capacity,
        location: formData.location || null,
        level: formData.level || null,
      })

      if (result.success) {
        setOpen(false)
        setShowNewClassType(false)
        setNewClassType({ title: "", description: "", durationMin: 60, level: "" })
        router.refresh()
      } else {
        setError(result.error || "Une erreur est survenue")
      }
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Pencil className="h-4 w-4" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le cours</DialogTitle>
          <DialogDescription>
            Modifiez les détails de la session
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="classTypeId">Type de cours</Label>
            <select
              id="classTypeId"
              value={showNewClassType ? "__new__" : formData.classTypeId}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setShowNewClassType(true)
                  setFormData({ ...formData, classTypeId: "" })
                } else {
                  setShowNewClassType(false)
                  setFormData({ ...formData, classTypeId: e.target.value })
                }
              }}
              required={!showNewClassType}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {classTypes.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.title} ({ct.durationMin} min){ct.level ? ` - ${ct.level}` : ""}
                </option>
              ))}
              <option value="__new__">➕ Créer un nouveau type...</option>
            </select>
          </div>

          {showNewClassType && (
            <div className="p-4 border border-dashed border-tempo-bordeaux/30 rounded-lg bg-tempo-taupe/10 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-tempo-bordeaux flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nouveau type de cours
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewClassType(false)
                    setNewClassType({ title: "", description: "", durationMin: 60 })
                    setFormData({ ...formData, classTypeId: currentData.classTypeId })
                  }}
                >
                  Annuler
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newTitle">Nom du cours *</Label>
                <Input
                  id="newTitle"
                  placeholder="Ex: Yoga Yin, Stretching..."
                  value={newClassType.title}
                  onChange={(e) => setNewClassType({ ...newClassType, title: e.target.value })}
                  required={showNewClassType}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newDescription">Description</Label>
                <Textarea
                  id="newDescription"
                  placeholder="Description du cours..."
                  value={newClassType.description}
                  onChange={(e) => setNewClassType({ ...newClassType, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newDuration">Durée (minutes)</Label>
                  <Input
                    id="newDuration"
                    type="number"
                    min={15}
                    max={180}
                    value={newClassType.durationMin}
                    onChange={(e) => setNewClassType({ ...newClassType, durationMin: parseInt(e.target.value) || 60 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newLevel">Niveau</Label>
                  <select
                    id="newLevel"
                    value={newClassType.level}
                    onChange={(e) => setNewClassType({ ...newClassType, level: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Tous niveaux</option>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Heure début</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endTime">Heure fin</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacité</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={50}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 12 })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Salle</Label>
              <Input
                id="location"
                placeholder="Salle principale"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Niveau</Label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Tous niveaux</option>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
              </select>
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
              className="bg-tempo-bordeaux hover:bg-tempo-noir"
              disabled={isLoading}
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
