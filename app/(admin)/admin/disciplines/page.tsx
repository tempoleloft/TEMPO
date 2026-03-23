"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, Pencil, Plus, Save, X } from "lucide-react"
import {
  createClassType,
  getClassTypesAdmin,
  toggleClassTypeActive,
  updateClassType,
} from "@/lib/actions/admin"

interface ClassType {
  id: string
  title: string
  description: string | null
  durationMin: number
  level: string | null
  active: boolean
}

export default function AdminDisciplinesPage() {
  const [items, setItems] = useState<ClassType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newData, setNewData] = useState({
    title: "",
    description: "",
    durationMin: 60,
    level: "",
  })

  async function loadClassTypes() {
    setLoading(true)
    setError(null)
    const result = await getClassTypesAdmin()
    if (result.success) {
      setItems(result.classTypes)
    } else {
      setError(result.error || "Impossible de charger les disciplines")
    }
    setLoading(false)
  }

  useEffect(() => {
    loadClassTypes()
  }, [])

  async function handleCreate() {
    if (!newData.title.trim()) {
      setError("Le nom de la discipline est requis")
      return
    }

    setSaving(true)
    setError(null)
    const result = await createClassType({
      title: newData.title.trim(),
      description: newData.description.trim() || undefined,
      durationMin: Number(newData.durationMin) || 60,
      level: newData.level || undefined,
    })

    if (!result.success) {
      setError(result.error || "Erreur lors de la création")
    } else {
      setShowNewForm(false)
      setNewData({ title: "", description: "", durationMin: 60, level: "" })
      await loadClassTypes()
    }
    setSaving(false)
  }

  async function handleToggleActive(id: string) {
    setSaving(true)
    setError(null)
    const result = await toggleClassTypeActive(id)
    if (!result.success) {
      setError(result.error || "Erreur lors du changement de visibilité")
    } else {
      await loadClassTypes()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 rounded bg-tempo-taupe/30 animate-pulse" />
        <div className="h-24 rounded bg-tempo-taupe/20 animate-pulse" />
        <div className="h-24 rounded bg-tempo-taupe/20 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-tempo-bordeaux">Disciplines</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les cours affichés sur la home et leur description mensuelle
          </p>
        </div>
        <Button
          className="bg-tempo-bordeaux hover:bg-tempo-noir"
          onClick={() => setShowNewForm((prev) => !prev)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {showNewForm && (
        <Card className="border-tempo-bordeaux/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Nouvelle discipline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-title">Nom</Label>
              <Input
                id="new-title"
                placeholder="Ex: Yoga Nidra"
                value={newData.title}
                onChange={(e) => setNewData({ ...newData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-description">Description home</Label>
              <Textarea
                id="new-description"
                placeholder="Ex: Relaxation profonde du système nerveux"
                rows={2}
                value={newData.description}
                onChange={(e) => setNewData({ ...newData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-duration">Durée (min)</Label>
                <Input
                  id="new-duration"
                  type="number"
                  min={15}
                  max={180}
                  value={newData.durationMin}
                  onChange={(e) =>
                    setNewData({ ...newData, durationMin: parseInt(e.target.value, 10) || 60 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-level">Niveau</Label>
                <select
                  id="new-level"
                  value={newData.level}
                  onChange={(e) => setNewData({ ...newData, level: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Tous niveaux</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                Annuler
              </Button>
              <Button
                className="bg-tempo-bordeaux hover:bg-tempo-noir"
                onClick={handleCreate}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <DisciplineRow
            key={item.id}
            item={item}
            isEditing={editingId === item.id}
            onEdit={() => setEditingId(item.id)}
            onCancelEdit={() => setEditingId(null)}
            onSaved={async () => {
              setEditingId(null)
              await loadClassTypes()
            }}
            onToggleActive={() => handleToggleActive(item.id)}
            saving={saving}
            setError={setError}
          />
        ))}
      </div>
    </div>
  )
}

function DisciplineRow({
  item,
  isEditing,
  onEdit,
  onCancelEdit,
  onSaved,
  onToggleActive,
  saving,
  setError,
}: {
  item: ClassType
  isEditing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onSaved: () => Promise<void>
  onToggleActive: () => Promise<void>
  saving: boolean
  setError: (value: string | null) => void
}) {
  const [editData, setEditData] = useState({
    title: item.title,
    description: item.description || "",
    durationMin: item.durationMin,
    level: item.level || "",
  })
  const [localSaving, setLocalSaving] = useState(false)

  async function handleSave() {
    if (!editData.title.trim()) {
      setError("Le nom de la discipline est requis")
      return
    }

    setLocalSaving(true)
    setError(null)
    const result = await updateClassType(item.id, {
      title: editData.title.trim(),
      description: editData.description.trim() || undefined,
      durationMin: Number(editData.durationMin) || 60,
      level: editData.level || undefined,
    })

    if (!result.success) {
      setError(result.error || "Erreur lors de la sauvegarde")
    } else {
      await onSaved()
    }
    setLocalSaving(false)
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Description home</Label>
            <Textarea
              rows={2}
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Durée (min)</Label>
              <Input
                type="number"
                min={15}
                max={180}
                value={editData.durationMin}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    durationMin: parseInt(e.target.value, 10) || 60,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Niveau</Label>
              <select
                value={editData.level}
                onChange={(e) => setEditData({ ...editData, level: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Tous niveaux</option>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              className="bg-tempo-bordeaux hover:bg-tempo-noir"
              onClick={handleSave}
              disabled={localSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {localSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={!item.active ? "opacity-60" : ""}>
      <CardContent className="pt-6 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-tempo-bordeaux">{item.title}</p>
            {!item.active && <Badge variant="outline">Masqué</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {item.description || "Pas de description pour la home"}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.durationMin} min{item.level ? ` • ${item.level}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onToggleActive} disabled={saving}>
            {item.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
