"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { bookSession, cancelBooking } from "@/lib/actions/booking"
import { joinWaitlist, leaveWaitlist } from "@/lib/actions/waitlist"
import { Clock } from "lucide-react"

interface BookingButtonProps {
  sessionId: string
  isBooked: boolean
  isFull: boolean
  isPast: boolean
  hasCredits: boolean
  isOnWaitlist?: boolean
  waitlistPosition?: number
  canCancel?: boolean // true si > 12h avant le cours
}

export function BookingButton({
  sessionId,
  isBooked,
  isFull,
  isPast,
  hasCredits,
  isOnWaitlist = false,
  waitlistPosition,
  canCancel = true,
}: BookingButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleBook() {
    setIsLoading(true)
    try {
      const result = await bookSession(sessionId)
      if (!result.success) {
        alert(result.error)
      }
      router.refresh()
    } catch (error) {
      alert("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCancel() {
    if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) {
      return
    }
    
    setIsLoading(true)
    try {
      const result = await cancelBooking(sessionId)
      if (!result.success) {
        alert(result.error)
      } else if (result.message) {
        alert(result.message)
      }
      router.refresh()
    } catch (error) {
      alert("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleJoinWaitlist() {
    setIsLoading(true)
    try {
      const result = await joinWaitlist(sessionId)
      if (!result.success) {
        alert(result.error)
      } else {
        alert(`Vous êtes en position ${result.position} sur la liste d'attente. Vous recevrez un email si une place se libère.`)
      }
      router.refresh()
    } catch (error) {
      alert("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLeaveWaitlist() {
    if (!confirm("Voulez-vous vraiment quitter la liste d'attente ?")) {
      return
    }
    
    setIsLoading(true)
    try {
      const result = await leaveWaitlist(sessionId)
      if (!result.success) {
        alert(result.error)
      }
      router.refresh()
    } catch (error) {
      alert("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  if (isPast) {
    return (
      <Button disabled variant="outline" size="sm">
        Passé
      </Button>
    )
  }

  if (isBooked) {
    if (!canCancel) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-amber-600 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            -12h
          </Badge>
        </div>
      )
    }
    
    return (
      <Button
        onClick={handleCancel}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        {isLoading ? "..." : "Annuler"}
      </Button>
    )
  }

  if (isOnWaitlist) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-amber-600 border-amber-200">
          Liste #{waitlistPosition}
        </Badge>
        <Button
          onClick={handleLeaveWaitlist}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-50 h-7 px-2"
        >
          {isLoading ? "..." : "×"}
        </Button>
      </div>
    )
  }

  if (isFull) {
    if (!hasCredits) {
      return (
        <Button disabled variant="outline" size="sm">
          Complet
        </Button>
      )
    }
    
    return (
      <Button
        onClick={handleJoinWaitlist}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="text-amber-600 border-amber-200 hover:bg-amber-50"
      >
        {isLoading ? "..." : "Liste d'attente"}
      </Button>
    )
  }

  if (!hasCredits) {
    return (
      <Button disabled variant="outline" size="sm">
        Pas de crédits
      </Button>
    )
  }

  return (
    <Button
      onClick={handleBook}
      disabled={isLoading}
      size="sm"
      className="bg-tempo-bordeaux hover:bg-tempo-noir"
    >
      {isLoading ? "..." : "Réserver"}
    </Button>
  )
}
