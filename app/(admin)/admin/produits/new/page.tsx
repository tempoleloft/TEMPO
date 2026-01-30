"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createProduct, CreateProductInput } from "@/lib/actions/admin"

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    
    const data: CreateProductInput = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      kind: formData.get("kind") as "SINGLE" | "PACK",
      priceCents: Math.round(parseFloat(formData.get("price") as string) * 100),
      credits: parseInt(formData.get("credits") as string),
      validityDays: parseInt(formData.get("validityDays") as string),
    }

    try {
      const result = await createProduct(data)

      if (result.success) {
        router.push("/admin/produits")
      } else {
        setError(result.error || "Erreur lors de la création")
      }
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/produits">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-tempo-bordeaux">
            Nouveau produit
          </h1>
          <p className="text-muted-foreground mt-1">
            Créer une nouvelle offre de cours
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du produit</CardTitle>
          <CardDescription>
            Remplissez les détails de l'offre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Pack 10 cours"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kind">Type *</Label>
                <select
                  id="kind"
                  name="kind"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  required
                >
                  <option value="SINGLE">Cours à l'unité</option>
                  <option value="PACK">Pack de cours</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Ex: Idéal pour les pratiquants réguliers"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="29.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Nombre de crédits *</Label>
                <Input
                  id="credits"
                  name="credits"
                  type="number"
                  min="1"
                  placeholder="10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validityDays">Validité (jours) *</Label>
                <Input
                  id="validityDays"
                  name="validityDays"
                  type="number"
                  min="1"
                  placeholder="90"
                  required
                />
              </div>
            </div>

            <div className="bg-tempo-taupe/10 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Récapitulatif</h4>
              <p className="text-sm text-muted-foreground">
                Le produit sera créé et immédiatement visible sur la page des tarifs.
                Vous pourrez le désactiver à tout moment.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-tempo-bordeaux hover:bg-tempo-noir"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Créer le produit
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
