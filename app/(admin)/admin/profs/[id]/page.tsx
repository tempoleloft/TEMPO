"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, User, Mail, Calendar, X, Plus } from "lucide-react"
import { updateTeacher, getTeacherById } from "@/lib/actions/admin"

interface TeacherData {
  id: string
  displayName: string
  bio: string | null
  photoUrl: string | null
  specialties: string[]
  isActive: boolean
  createdAt: string
  user: {
    email: string
  }
  _count: {
    sessions: number
  }
}

export default function EditTeacherPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [teacher, setTeacher] = useState<TeacherData | null>(null)
  
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    photoUrl: "",
    specialties: [] as string[],
    email: "",
  })
  
  const [newSpecialty, setNewSpecialty] = useState("")

  useEffect(() => {
    loadTeacher()
  }, [params.id])

  async function loadTeacher() {
    setLoading(true)
    const result = await getTeacherById(params.id)
    if (result.success && result.teacher) {
      setTeacher(result.teacher as TeacherData)
      setFormData({
        displayName: result.teacher.displayName,
        bio: result.teacher.bio || "",
        photoUrl: result.teacher.photoUrl || "",
        specialties: result.teacher.specialties || [],
        email: result.teacher.user.email,
      })
    } else {
      setError("Professeur non trouvé")
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateTeacher(params.id, {
      displayName: formData.displayName,
      bio: formData.bio || null,
      photoUrl: formData.photoUrl || null,
      specialties: formData.specialties,
      email: formData.email,
    })

    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Erreur lors de la mise à jour")
    }
    setSaving(false)
  }

  function addSpecialty() {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()],
      })
      setNewSpecialty("")
    }
  }

  function removeSpecialty(specialty: string) {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty),
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-tempo-taupe/20 rounded w-48" />
          <div className="h-64 bg-tempo-taupe/20 rounded" />
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error || "Professeur non trouvé"}</p>
          <Button asChild variant="outline">
            <Link href="/admin/profs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux professeurs
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/profs">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-tempo-bordeaux">
            Modifier le professeur
          </h1>
          <p className="text-muted-foreground text-sm">
            {teacher.user.email}
          </p>
        </div>
        {!teacher.isActive && (
          <Badge variant="outline" className="text-tempo-noir/50">
            Masqué
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-tempo-bordeaux" />
            <div>
              <p className="text-2xl font-bold text-tempo-bordeaux">{teacher._count.sessions}</p>
              <p className="text-xs text-muted-foreground">Cours total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-tempo-bordeaux" />
            <div>
              <p className="text-sm font-medium truncate">{teacher.user.email}</p>
              <p className="text-xs text-muted-foreground">Email</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du professeur</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo preview */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-tempo-taupe/30 flex items-center justify-center overflow-hidden">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt={formData.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-tempo-bordeaux/50" />
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="photoUrl">URL de la photo</Label>
                <Input
                  id="photoUrl"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://exemple.com/photo.jpg"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Laissez vide pour utiliser les initiales
                </p>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <Label htmlFor="displayName">Nom affiché *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Adresse email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1"
                placeholder="professeur@tempoleloft.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email utilisé pour la connexion du professeur
              </p>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Biographie</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={5}
                placeholder="Parcours, certifications, style d'enseignement..."
                className="mt-1"
              />
            </div>

            {/* Specialties */}
            <div>
              <Label>Spécialités</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                {formData.specialties.map((specialty) => (
                  <Badge 
                    key={specialty} 
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(specialty)}
                      className="ml-1 hover:bg-tempo-bordeaux/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Ajouter une spécialité"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSpecialty()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSpecialty}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ex: Yoga Vinyasa, Pilates Mat, Hatha Yoga...
              </p>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-600">
                Modifications enregistrées avec succès !
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/profs">Annuler</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={saving || !formData.displayName}
                className="bg-tempo-bordeaux hover:bg-tempo-noir"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
