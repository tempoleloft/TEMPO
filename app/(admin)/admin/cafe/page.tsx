"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Coffee, 
  Leaf, 
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Save,
  X
} from "lucide-react"
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
import { 
  getCafeMenuItems, 
  createCafeMenuItem, 
  updateCafeMenuItem, 
  deleteCafeMenuItem,
  toggleCafeMenuItemActive 
} from "@/lib/actions/admin"

interface MenuItem {
  id: string
  name: string
  price: number
  description: string | null
  category: string
  sortOrder: number
  isActive: boolean
}

export default function AdminCafePage() {
  const router = useRouter()
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newCategory, setNewCategory] = useState<"boissons" | "food">("boissons")
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "boissons" as "boissons" | "food",
  })

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    setLoading(true)
    const result = await getCafeMenuItems()
    if (result.success && result.items) {
      setItems(result.items.map(item => ({
        ...item,
        price: Number(item.price)
      })))
    }
    setLoading(false)
  }

  async function handleCreate() {
    if (!formData.name || !formData.price) return
    
    setSaving(true)
    const result = await createCafeMenuItem({
      name: formData.name,
      price: parseFloat(formData.price.replace(",", ".")),
      description: formData.description || null,
      category: formData.category,
    })
    
    if (result.success) {
      setFormData({ name: "", price: "", description: "", category: "boissons" })
      setShowNewForm(false)
      loadItems()
    }
    setSaving(false)
  }

  async function handleUpdate(id: string, data: Partial<MenuItem>) {
    setSaving(true)
    const result = await updateCafeMenuItem(id, {
      name: data.name,
      price: data.price,
      description: data.description,
    })
    
    if (result.success) {
      setEditingId(null)
      loadItems()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const result = await deleteCafeMenuItem(id)
    if (result.success) {
      loadItems()
    }
  }

  async function handleToggleActive(id: string) {
    const result = await toggleCafeMenuItemActive(id)
    if (result.success) {
      loadItems()
    }
  }

  const boissons = items.filter(i => i.category === "boissons")
  const food = items.filter(i => i.category === "food")

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-tempo-bordeaux">Carte du Café</h1>
          <p className="text-tempo-noir/60">Gérez les produits affichés sur la carte du café</p>
        </div>
        <Button
          onClick={() => {
            setShowNewForm(true)
            setNewCategory("boissons")
            setFormData({ ...formData, category: "boissons" })
          }}
          className="bg-tempo-bordeaux hover:bg-tempo-noir"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* New Item Form */}
      {showNewForm && (
        <Card className="mb-8 border-tempo-bordeaux/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Nouveau produit</span>
              <Button variant="ghost" size="sm" onClick={() => setShowNewForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Catégorie</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={formData.category === "boissons" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, category: "boissons" })}
                    className={formData.category === "boissons" ? "bg-tempo-bordeaux" : ""}
                  >
                    <Coffee className="h-4 w-4 mr-1" />
                    Boissons
                  </Button>
                  <Button
                    type="button"
                    variant={formData.category === "food" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, category: "food" })}
                    className={formData.category === "food" ? "bg-tempo-bordeaux" : ""}
                  >
                    <Leaf className="h-4 w-4 mr-1" />
                    À grignoter
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nom du produit</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Flat White"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="price">Prix (€)</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="4,50"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description (optionnel)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Matcha bio du Japon"
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!formData.name || !formData.price || saving}
                className="bg-tempo-bordeaux hover:bg-tempo-noir"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boissons Section */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-tempo-bordeaux" />
            Boissons
            <Badge variant="secondary" className="ml-2">{boissons.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {boissons.length === 0 ? (
            <p className="text-tempo-noir/50 text-center py-4">Aucune boisson</p>
          ) : (
            <div className="space-y-2">
              {boissons.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  onEdit={() => setEditingId(item.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={(data) => handleUpdate(item.id, data)}
                  onDelete={() => handleDelete(item.id)}
                  onToggleActive={() => handleToggleActive(item.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Food Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-tempo-bordeaux" />
            À grignoter
            <Badge variant="secondary" className="ml-2">{food.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {food.length === 0 ? (
            <p className="text-tempo-noir/50 text-center py-4">Aucun produit</p>
          ) : (
            <div className="space-y-2">
              {food.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  onEdit={() => setEditingId(item.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={(data) => handleUpdate(item.id, data)}
                  onDelete={() => handleDelete(item.id)}
                  onToggleActive={() => handleToggleActive(item.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MenuItemRow({
  item,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onToggleActive,
}: {
  item: MenuItem
  isEditing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onSave: (data: Partial<MenuItem>) => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  const [editData, setEditData] = useState({
    name: item.name,
    price: item.price.toString().replace(".", ","),
    description: item.description || "",
  })

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 p-3 bg-tempo-taupe/10 rounded-lg">
        <div className="flex-1 grid grid-cols-4 gap-2">
          <Input
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="col-span-2"
          />
          <Input
            value={editData.price}
            onChange={(e) => setEditData({ ...editData, price: e.target.value })}
            placeholder="Prix"
          />
          <Input
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            placeholder="Description"
            className="col-span-4 mt-1"
          />
        </div>
        <Button size="sm" variant="ghost" onClick={onCancelEdit}>
          <X className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          onClick={() => onSave({
            name: editData.name,
            price: parseFloat(editData.price.replace(",", ".")),
            description: editData.description || null,
          })}
          className="bg-tempo-bordeaux hover:bg-tempo-noir"
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg hover:bg-tempo-taupe/10 transition-colors ${!item.isActive ? "opacity-50" : ""}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-tempo-noir">{item.name}</span>
          {!item.isActive && (
            <Badge variant="outline" className="text-xs">Masqué</Badge>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-tempo-noir/50">{item.description}</p>
        )}
      </div>
      <span className="font-semibold text-tempo-bordeaux whitespace-nowrap">
        {item.price.toFixed(2).replace(".", ",")}€
      </span>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onToggleActive} title={item.isActive ? "Masquer" : "Afficher"}>
          {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le produit "{item.name}" sera définitivement supprimé de la carte.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
