"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { createAdmin } from "@/lib/actions/admin"
import { Loader2, UserPlus, ChevronDown, ChevronUp } from "lucide-react"

export function AddAdminForm() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await createAdmin(formData)
      
      if (result.success) {
        setMessage({ type: "success", text: "Administrateur créé avec succès" })
        setFormData({ email: "", password: "", firstName: "", lastName: "" })
        setIsOpen(false)
        router.refresh()
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" })
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la création" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Ajouter un administrateur
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 p-4 border rounded-lg">
          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.type === "success" 
                ? "bg-green-50 text-green-700" 
                : "bg-red-50 text-red-700"
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              minLength={6}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-tempo-bordeaux hover:bg-tempo-noir"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              "Créer l'administrateur"
            )}
          </Button>
        </form>
      )}
    </div>
  )
}
