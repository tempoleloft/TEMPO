"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CompleteProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue")
        return
      }

      // Redirect to dashboard
      router.push("/app")
      router.refresh()
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-tempo-bordeaux flex items-center justify-center">
        <p className="text-white">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tempo-bordeaux flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold text-tempo-bordeaux mb-2 block">
            TEMPO
          </Link>
          <CardTitle className="text-xl">Complétez votre profil</CardTitle>
          <CardDescription>
            Quelques informations supplémentaires pour finaliser votre inscription
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Marie"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Dupont"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="06 12 34 56 78"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Requis pour vous contacter en cas de changement de cours
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-tempo-bordeaux hover:bg-tempo-noir"
              disabled={isLoading}
            >
              {isLoading ? "Enregistrement..." : "Terminer l'inscription"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
