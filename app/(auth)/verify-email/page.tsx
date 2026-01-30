"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { verifyEmail } from "@/lib/actions/auth"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const hasVerified = useRef(false)

  useEffect(() => {
    async function verify() {
      // Éviter les appels multiples (React Strict Mode)
      if (hasVerified.current) return
      hasVerified.current = true

      if (!token) {
        setStatus("error")
        setMessage("Token manquant")
        return
      }

      try {
        const result = await verifyEmail(token)

        if (result.success) {
          setStatus("success")
          setMessage("Votre compte a été activé avec succès !")
          setTimeout(() => {
            router.push("/login")
          }, 3000)
        } else {
          // Si le token est invalide, le compte est peut-être déjà vérifié
          if (result.error === "Token invalide") {
            setStatus("error")
            setMessage("Ce lien a déjà été utilisé ou a expiré. Si vous avez déjà activé votre compte, vous pouvez vous connecter.")
          } else {
            setStatus("error")
            setMessage(result.error || "Erreur lors de la vérification")
          }
        }
      } catch (err) {
        setStatus("error")
        setMessage("Une erreur est survenue")
      }
    }

    verify()
  }, [token, router])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="text-2xl font-bold text-tempo-bordeaux mb-2 block">
          TEMPO
        </Link>
        <CardTitle className="text-xl">
          {status === "loading" && "Vérification en cours..."}
          {status === "success" && "Compte activé !"}
          {status === "error" && "Vérification"}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {status === "loading" && (
          <div className="py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-tempo-bordeaux mb-4" />
            <p className="text-muted-foreground">Veuillez patienter...</p>
          </div>
        )}
        
        {status === "success" && (
          <div className="py-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <p className="text-green-600 font-medium mb-2">{message}</p>
            <p className="text-sm text-muted-foreground">
              Redirection vers la connexion...
            </p>
          </div>
        )}
        
        {status === "error" && (
          <div className="py-4">
            <XCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <p className="text-muted-foreground mb-4">{message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {status === "error" && (
          <Button asChild className="w-full bg-tempo-bordeaux hover:bg-tempo-noir">
            <Link href="/login">Aller à la connexion</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function VerifyEmailLoading() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="text-2xl font-bold text-tempo-bordeaux mb-2 block">
          TEMPO
        </Link>
        <CardTitle className="text-xl">Vérification en cours...</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-tempo-bordeaux mb-4" />
        <p className="text-muted-foreground">Veuillez patienter...</p>
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-tempo-bordeaux flex items-center justify-center p-4">
      <Suspense fallback={<VerifyEmailLoading />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
