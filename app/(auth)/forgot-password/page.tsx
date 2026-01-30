"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset } from "@/lib/actions/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      const result = await requestPasswordReset(email)

      if (!result.success) {
        setError(result.error || "Une erreur est survenue")
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-tempo-bordeaux flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold text-tempo-bordeaux mb-2 block">
            TEMPO
          </Link>
          <CardTitle className="text-xl">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                Si cet email existe, un lien de réinitialisation a été envoyé. 
                Vérifiez votre boîte de réception (et vos spams).
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || success}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-tempo-bordeaux hover:bg-tempo-noir"
              disabled={isLoading || success}
            >
              {isLoading ? "Envoi..." : success ? "Email envoyé" : "Envoyer le lien"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              <Link href="/login" className="text-tempo-bordeaux hover:underline font-medium">
                ← Retour à la connexion
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
