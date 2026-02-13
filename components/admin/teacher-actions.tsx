"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  EyeOff, 
  Trash2, 
  MoreVertical,
  AlertTriangle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toggleTeacherActive, deleteTeacher, forceDeleteTeacher } from "@/lib/actions/admin"

interface TeacherActionsProps {
  teacherId: string
  teacherName: string
  isActive: boolean
  sessionsCount: number
}

export function TeacherActions({ 
  teacherId, 
  teacherName, 
  isActive,
  sessionsCount 
}: TeacherActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showForceDeleteDialog, setShowForceDeleteDialog] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleToggleActive() {
    setLoading(true)
    const result = await toggleTeacherActive(teacherId)
    if (!result.success) {
      console.error(result.error)
    }
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    setLoading(true)
    setDeleteError(null)
    
    const result = await deleteTeacher(teacherId)
    
    if (!result.success) {
      if (result.hasSession) {
        setDeleteError(result.error || "Ce professeur a des cours associés")
        setShowDeleteDialog(false)
        setShowForceDeleteDialog(true)
      } else {
        setDeleteError(result.error || "Erreur lors de la suppression")
      }
    } else {
      setShowDeleteDialog(false)
      router.refresh()
    }
    
    setLoading(false)
  }

  async function handleForceDelete() {
    setLoading(true)
    
    const result = await forceDeleteTeacher(teacherId)
    
    if (!result.success) {
      setDeleteError(result.error || "Erreur lors de la suppression")
    } else {
      setShowForceDeleteDialog(false)
      router.refresh()
    }
    
    setLoading(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={loading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleToggleActive}>
            {isActive ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Masquer
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Afficher
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce professeur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de supprimer <strong>{teacherName}</strong>.
              {sessionsCount > 0 && (
                <span className="block mt-2 text-amber-600">
                  ⚠️ Ce professeur a {sessionsCount} cours associé(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">
              {deleteError}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={loading}
            >
              {loading ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Delete Dialog (when teacher has sessions) */}
      <AlertDialog open={showForceDeleteDialog} onOpenChange={setShowForceDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Suppression forcée
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                <strong>{teacherName}</strong> a des cours associés dans le planning.
              </p>
              <p>
                Vous pouvez :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Masquer</strong> le professeur (recommandé) - il n'apparaîtra plus mais ses cours restent</li>
                <li><strong>Supprimer définitivement</strong> - tous ses cours et réservations seront également supprimés</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">
              {deleteError}
            </div>
          )}
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowForceDeleteDialog(false)
                handleToggleActive()
              }}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Masquer plutôt
            </Button>
            <AlertDialogAction
              onClick={handleForceDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={loading}
            >
              {loading ? "Suppression..." : "Supprimer tout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
