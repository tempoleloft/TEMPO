"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { createTeacher } from "@/lib/actions/admin"

const SPECIALTIES_OPTIONS = [
  "Yoga Vinyasa",
  "Yoga Hatha",
  "Yoga Ashtanga",
  "Yoga Yin",
  "Méditation",
  "Pilates Mat",
  "Pilates Reformer",
  "Barre au Sol",
]

export default function NewTeacherPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    bio: "",
    specialties: [] as string[],
  })

  function addSpecialty(specialty: string) {
    if (!formData.specialties.includes(specialty)) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty],
      })
    }
  }

  function removeSpecialty(specialty: string) {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((s) => s !== specialty),
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (formData.specialties.length === 0) {
      setError("Sélectionnez au moins une spécialité")
      return
    }

    setIsLoading(true)

    try {
      const result = await createTeacher(formData)

      if (!result.success) {
        setError(result.error || "Une erreur est survenue")
      } else {
        router.push("/admin/profs")
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
          <Link href="/admin/profs">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-tempo-bordeaux">
            Ajouter un professeur
          </h1>
          <p className="text-muted-foreground mt-1">
            Créer un nouveau compte professeur
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du professeur</CardTitle>
          <CardDescription>
            Les identifiants seront envoyés au professeur
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
              <Label htmlFor="displayName">Nom affiché *</Label>
              <Input
                id="displayName"
                placeholder="Marie Dupont"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="marie@tempo-leloft.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe temporaire *</Label>
              <Input
                id="password"
                type="text"
                placeholder="TempoProf2026!"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Le professeur pourra changer son mot de passe plus tard
              </p>
            </div>

            <div className="space-y-2">
              <Label>Spécialités *</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.specialties.map((s) => (
                  <Badge key={s} variant="default" className="bg-tempo-bordeaux">
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(s)}
                      className="ml-1 hover:text-red-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES_OPTIONS.filter((s) => !formData.specialties.includes(s)).map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="cursor-pointer hover:bg-tempo-taupe/30"
                    onClick={() => addSpecialty(s)}
                  >
                    + {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biographie</Label>
              <textarea
                id="bio"
                placeholder="Quelques lignes sur le parcours du professeur..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-tempo-bordeaux hover:bg-tempo-noir"
                disabled={isLoading}
              >
                {isLoading ? "Création..." : "Créer le professeur"}
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
