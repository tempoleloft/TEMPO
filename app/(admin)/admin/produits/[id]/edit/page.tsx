"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { updateProduct, CreateProductInput } from "@/lib/actions/admin"

interface EditProductPageProps {
  params: { id: string }
}

interface Product {
  id: string
  name: string
  description: string | null
  kind: "SINGLE" | "PACK" | "MERCH"
  priceCents: number
  credits: number
  validityDays: number | null
  imageUrl: string | null
  active: boolean
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState("")
  const [product, setProduct] = useState<Product | null>(null)
  const [kind, setKind] = useState<"SINGLE" | "PACK" | "MERCH">("SINGLE")

  const isMerch = kind === "MERCH"

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/admin/products/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
          setKind(data.kind)
        } else {
          setError("Produit non trouvé")
        }
      } catch (err) {
        setError("Erreur lors du chargement")
      } finally {
        setIsFetching(false)
      }
    }
    fetchProduct()
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    
    const data: Partial<CreateProductInput> = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      kind: formData.get("kind") as "SINGLE" | "PACK" | "MERCH",
      priceCents: Math.round(parseFloat(formData.get("price") as string) * 100),
      credits: isMerch ? 0 : parseInt(formData.get("credits") as string) || 0,
      validityDays: isMerch ? 0 : parseInt(formData.get("validityDays") as string) || 0,
      imageUrl: (formData.get("imageUrl") as string) || "",
    }

    try {
      const result = await updateProduct(params.id, data)

      if (result.success) {
        router.push("/admin/produits")
      } else {
        setError(result.error || "Erreur lors de la mise à jour")
      }
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-tempo-bordeaux" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/produits">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-tempo-bordeaux">
              Produit non trouvé
            </h1>
          </div>
        </div>
      </div>
    )
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
            Modifier le produit
          </h1>
          <p className="text-muted-foreground mt-1">
            {product.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du produit</CardTitle>
          <CardDescription>
            Modifiez les détails du produit
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
                  defaultValue={product.name}
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
                defaultValue={product.description || ""}
                placeholder={isMerch ? "Ex: T-shirt 100% coton, logo brodé" : "Ex: Idéal pour les pratiquants réguliers"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optionnel)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                defaultValue={product.imageUrl || ""}
                placeholder="https://exemple.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Entrez l'URL d'une image (hébergée sur Imgur, Google Drive, etc.)
              </p>
              {product.imageUrl && (
                <div className="mt-2">
                  <img
                    src={product.imageUrl}
                    alt="Aperçu"
                    className="w-24 h-24 object-cover rounded border"
                  />
                </div>
              )}
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
                  defaultValue={(product.priceCents / 100).toFixed(2)}
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
                      defaultValue={product.credits}
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
                      defaultValue={product.validityDays || ""}
                      placeholder="90"
                      required={!isMerch}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-tempo-taupe/10 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Statut</h4>
              <p className="text-sm text-muted-foreground">
                Ce produit est actuellement {product.active ? "actif" : "inactif"}.
                Vous pouvez changer son statut depuis la liste des produits.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-tempo-bordeaux hover:bg-tempo-noir"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Enregistrer
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
