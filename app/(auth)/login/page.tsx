"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Icons pour les providers
function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/app"
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Check if it's an email verification error
        if (result.error.includes("vérifier votre email")) {
          setError("Veuillez vérifier votre email avant de vous connecter. Vérifiez votre boîte de réception.")
        } else {
          setError("Email ou mot de passe incorrect")
        }
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="text-2xl font-bold text-tempo-bordeaux mb-2 block">
          TEMPO
        </Link>
        <CardTitle className="text-xl">Connexion</CardTitle>
        <CardDescription>
          Entrez vos identifiants pour accéder à votre compte
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
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
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link 
                href="/forgot-password" 
                className="text-xs text-tempo-bordeaux hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            {searchParams.get("registered") === "true" && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                Compte créé ! Vérifiez votre email pour activer votre compte.
              </div>
            )}
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit" 
            className="w-full bg-tempo-bordeaux hover:bg-tempo-noir"
            disabled={isLoading || isOAuthLoading !== null}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>
          
          {/* Séparateur */}
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>
          
          {/* OAuth Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOAuthLoading("google")
              signIn("google", { callbackUrl })
            }}
            disabled={isLoading || isOAuthLoading !== null}
            className="w-full"
          >
            {isOAuthLoading === "google" ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <GoogleIcon />
            )}
            <span className="ml-2">Continuer avec Google</span>
          </Button>
          
          <p className="text-sm text-center text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-tempo-bordeaux hover:underline font-medium">
              Créer un compte
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

function LoginLoading() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="text-2xl font-bold text-tempo-bordeaux mb-2 block">
          TEMPO
        </Link>
        <CardTitle className="text-xl">Connexion</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-tempo-bordeaux" />
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-tempo-bordeaux flex items-center justify-center p-4">
      <Suspense fallback={<LoginLoading />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
