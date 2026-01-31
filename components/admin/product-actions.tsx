"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteProduct } from "@/lib/actions/admin"
import { Pencil, Trash2, Loader2 } from "lucide-react"

interface ProductActionsProps {
  productId: string
  productName: string
  hasPurchases: boolean
}

export function ProductActions({ productId, productName, hasPurchases }: ProductActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  async function handleDelete() {
    setIsDeleting(true)
    setError("")
    try {
      const result = await deleteProduct(productId)
      if (!result.success) {
        setError(result.error || "Erreur lors de la suppression")
      } else {
        router.refresh()
      }
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        asChild
        variant="ghost"
        size="sm"
        title="Modifier"
      >
        <Link href={`/admin/produits/${productId}/edit`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasPurchases ? (
                <span className="text-orange-600">
                  Ce produit a des achats associés et ne peut pas être supprimé.
                  Vous pouvez le désactiver à la place.
                </span>
              ) : (
                <>
                  Êtes-vous sûr de vouloir supprimer "{productName}" ?
                  Cette action est irréversible.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            {!hasPurchases && (
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Supprimer
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
