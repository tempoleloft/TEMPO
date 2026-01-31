"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { acceptWaitlistSpot } from "@/lib/actions/waitlist"
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"

function AcceptWaitlistContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "ready" | "accepting" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [countdown, setCountdown] = useState(600) // 10 minutes en secondes

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Lien invalide")
      return
    }
    setStatus("ready")
  }, [token])

  // Countdown timer
  useEffect(() => {
    if (status !== "ready") return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setStatus("error")
          setMessage("Le délai pour accepter est dépassé")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status])

  async function handleAccept() {
    if (!token) return

    setStatus("accepting")

    try {
      const result = await acceptWaitlistSpot(token)

      if (result.success) {
        setStatus("success")
        setMessage("Place réservée avec succès !")
        setTimeout(() => {
          router.push("/app/reservations")
        }, 3000)
      } else {
        setStatus("error")
        setMessage(result.error || "Une erreur est survenue")
      }
    } catch (err) {
      setStatus("error")
      setMessage("Une erreur est survenue")
    }
  }

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center mb-2">
            <Image 
              src="/logo-dark.jpg" 
              alt="Tempo" 
              width={120} 
              height={40} 
              className="h-10 w-auto"
            />
          </Link>
          <CardTitle className="text-xl">Erreur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Lien invalide ou expiré</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full bg-tempo-bordeaux hover:bg-tempo-noir">
            <Link href="/app/planning">Voir le planning</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="text-2xl font-bold text-tempo-bordeaux mb-2 block">
          TEMPO
        </Link>
        <CardTitle className="text-xl">
          {status === "success" && "Réservation confirmée !"}
          {status === "error" && "Erreur"}
          {(status === "loading" || status === "ready" || status === "accepting") && "Place disponible !"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-tempo-bordeaux" />
            <p className="mt-4 text-muted-foreground">Chargement...</p>
          </div>
        )}

        {status === "ready" && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full mb-4">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg font-bold">{formatCountdown()}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Temps restant pour accepter
              </p>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Une place sest libérée ! Cliquez sur le bouton ci-dessous pour confirmer votre réservation.
            </p>

            <p className="text-sm text-muted-foreground mb-4">
              Un crédit sera débité de votre compte.
            </p>
          </div>
        )}

        {status === "accepting" && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-tempo-bordeaux" />
            <p className="mt-4 text-muted-foreground">Réservation en cours...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-green-600 font-medium">{message}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Redirection vers vos réservations...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {status === "ready" && (
          <Button 
            onClick={handleAccept}
            className="w-full bg-tempo-bordeaux hover:bg-tempo-noir"
            size="lg"
          >
            Accepter cette place
          </Button>
        )}
        
        {status === "error" && (
          <Button asChild className="w-full bg-tempo-bordeaux hover:bg-tempo-noir">
            <Link href="/app/planning">Voir le planning</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function AcceptWaitlistLoading() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="text-2xl font-bold text-tempo-bordeaux mb-2 block">
          TEMPO
        </Link>
        <CardTitle className="text-xl">Chargement...</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-tempo-bordeaux" />
        <p className="mt-4 text-muted-foreground">Veuillez patienter...</p>
      </CardContent>
    </Card>
  )
}

export default function AcceptWaitlistPage() {
  return (
    <div className="min-h-screen bg-tempo-bordeaux flex items-center justify-center p-4">
      <Suspense fallback={<AcceptWaitlistLoading />}>
        <AcceptWaitlistContent />
      </Suspense>
    </div>
  )
}
