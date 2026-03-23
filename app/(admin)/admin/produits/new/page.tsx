"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Lock } from "lucide-react"
import { createProduct, CreateProductInput } from "@/lib/actions/admin"

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [kind, setKind] = useState<"SINGLE" | "PACK" | "MERCH">("SINGLE")
  const [isHidden, setIsHidden] = useState(false)

  const isMerch = kind === "MERCH"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    
    const data: CreateProductInput = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      kind: formData.get("kind") as "SINGLE" | "PACK" | "MERCH",
      priceCents: Math.round(parseFloat(formData.get("price") as string) * 100),
      credits: isMerch ? 0 : parseInt(formData.get("credits") as string) || 0,
      validityDays: isMerch ? 0 : parseInt(formData.get("validityDays") as string) || 0,
      imageUrl: (formData.get("imageUrl") as string) || "",
      isHidden: isHidden,
      unlockCode: isHidden ? (formData.get("unlockCode") as string) || undefined : undefined,
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
            Créer une nouvelle offre (cours ou merchandising)
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
                  placeholder={isMerch ? "Ex: T-shirt Tempo" : "Ex: Pack 10 cours"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kind">Type *</Label>
                <select
                  id="kind"
                  name="kind"
                  value={kind}
                  onChange={(e) => setKind(e.target.value as "SINGLE" | "PACK" | "MERCH")}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  required
                >
                  <option value="SINGLE">Cours à l'unité</option>
                  <option value="PACK">Pack de cours</option>
                  <option value="MERCH">Merchandising</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder={isMerch ? "Ex: T-shirt 100% coton, logo brodé" : "Ex: Idéal pour les pratiquants réguliers"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optionnel)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://exemple.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Entrez l'URL d'une image (hébergée sur Imgur, Google Drive, etc.)
              </p>
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

              {!isMerch && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="credits">Nombre de crédits *</Label>
                    <Input
                      id="credits"
                      name="credits"
                      type="number"
                      min="1"
                      placeholder="10"
                      required={!isMerch}
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
                      required={!isMerch}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Produit caché */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isHidden"
                  checked={isHidden}
                  onChange={(e) => setIsHidden(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="isHidden" className="font-medium cursor-pointer">
                    Produit caché (accessible uniquement avec un code)
                  </Label>
                </div>
              </div>
              
              {isHidden && (
                <div className="space-y-2 pl-7">
                  <Label htmlFor="unlockCode">Code de déblocage *</Label>
                  <Input
                    id="unlockCode"
                    name="unlockCode"
                    placeholder="Ex: PROMO2026"
                    required={isHidden}
                    className="max-w-xs uppercase"
                  />
                  <p className="text-xs text-muted-foreground">
                    Les clients devront saisir ce code pour voir et acheter ce produit
                  </p>
                </div>
              )}
            </div>

            <div className="bg-tempo-taupe/10 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Récapitulatif</h4>
              <p className="text-sm text-muted-foreground">
                {isHidden 
                  ? "Ce produit caché ne sera visible que pour les clients qui saisissent le code de déblocage."
                  : isMerch 
                    ? "Le produit merchandising sera créé. Les clients pourront l'acheter mais il ne donnera pas de crédits de cours."
                    : "Le produit sera créé et immédiatement visible sur la page des tarifs. Vous pourrez le désactiver à tout moment."
                }
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
