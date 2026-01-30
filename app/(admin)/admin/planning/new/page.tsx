"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createSession } from "@/lib/actions/admin"

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
  
  const [formData, setFormData] = useState({
    classTypeId: "",
    teacherId: "",
    date: "",
    time: "",
    capacity: 12,
    location: "",
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
      const result = await createSession({
        ...formData,
        capacity: Number(formData.capacity),
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
                value={formData.classTypeId}
                onChange={(e) => setFormData({ ...formData, classTypeId: e.target.value })}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Sélectionner un type</option>
                {classTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.title} ({ct.durationMin} min)
                  </option>
                ))}
              </select>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
