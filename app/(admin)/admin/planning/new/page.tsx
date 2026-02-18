"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { createSession, createClassType } from "@/lib/actions/admin"

interface ClassType {
  id: string
  title: string
  durationMin: number
}

interface Teacher {
  id: string
  displayName: string
}

export default function NewSessionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [showNewClassType, setShowNewClassType] = useState(false)
  const [newClassType, setNewClassType] = useState({
    title: "",
    description: "",
    durationMin: 60,
    level: "",
  })
  
  const [formData, setFormData] = useState({
    classTypeId: "",
    teacherId: "",
    date: "",
    time: "",
    capacity: 12,
    location: "",
    durationMin: 60,
    level: "",
  })

  // Fetch class types and teachers
  useEffect(() => {
    async function fetchData() {
      const [classTypesRes, teachersRes] = await Promise.all([
        fetch("/api/admin/class-types"),
        fetch("/api/admin/teachers"),
      ])
      
      if (classTypesRes.ok) {
        const data = await classTypesRes.json()
        setClassTypes(data)
      }
      
      if (teachersRes.ok) {
        const data = await teachersRes.json()
        setTeachers(data)
      }
    }
    
    fetchData()
  }, [])

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

      const result = await createSession({
        ...formData,
        classTypeId,
        capacity: Number(formData.capacity),
        durationMin: Number(formData.durationMin),
      })

      if (!result.success) {
        setError(result.error || "Une erreur est survenue")
      } else {
        router.push("/admin/planning")
      }
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/planning">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-tempo-bordeaux">
            Créer un cours
          </h1>
          <p className="text-muted-foreground mt-1">
            Ajouter une session au planning
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du cours</CardTitle>
          <CardDescription>
            Remplissez les détails de la session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="classTypeId">Type de cours *</Label>
              <select
                id="classTypeId"
                value={showNewClassType ? "__new__" : formData.classTypeId}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setShowNewClassType(true)
                    setFormData({ ...formData, classTypeId: "", durationMin: 60 })
                  } else {
                    setShowNewClassType(false)
                    const selectedType = classTypes.find(ct => ct.id === e.target.value)
                    setFormData({ 
                      ...formData, 
                      classTypeId: e.target.value,
                      durationMin: selectedType?.durationMin || 60
                    })
                  }
                }}
                required={!showNewClassType}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Sélectionner un type</option>
                {classTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.title} ({ct.durationMin} min)
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
                      setNewClassType({ title: "", description: "", durationMin: 60, level: "" })
                    }}
                  >
                    Annuler
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newTitle">Nom du cours *</Label>
                  <Input
                    id="newTitle"
                    placeholder="Ex: Yoga Nidra, Stretching..."
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
                    <Label htmlFor="newDuration">Durée (minutes) *</Label>
                    <Input
                      id="newDuration"
                      type="number"
                      min={15}
                      max={180}
                      value={newClassType.durationMin}
                      onChange={(e) => setNewClassType({ ...newClassType, durationMin: parseInt(e.target.value) || 60 })}
                      required={showNewClassType}
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

            <div className="space-y-2">
              <Label htmlFor="teacherId">Professeur *</Label>
              <select
                id="teacherId"
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Sélectionner un professeur</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Heure *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMin">Durée (min) *</Label>
                <Input
                  id="durationMin"
                  type="number"
                  min={15}
                  max={180}
                  step={5}
                  value={formData.durationMin}
                  onChange={(e) => setFormData({ ...formData, durationMin: parseInt(e.target.value) || 60 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacité *</Label>
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

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-tempo-bordeaux hover:bg-tempo-noir"
                disabled={isLoading}
              >
                {isLoading ? "Création..." : "Créer le cours"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
