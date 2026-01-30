"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { markAttendance, resetAttendance } from "@/lib/actions/admin"
import { Check, X, RotateCcw, Loader2 } from "lucide-react"

interface AttendanceButtonsProps {
  reservationId: string
  currentStatus: "BOOKED" | "ATTENDED" | "NO_SHOW"
}

export function AttendanceButtons({ reservationId, currentStatus }: AttendanceButtonsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  async function handleMarkPresent() {
    setIsLoading("present")
    try {
      const result = await markAttendance(reservationId, "ATTENDED")
      if (!result.success) {
        alert(result.error)
      }
      router.refresh()
    } catch (error) {
      alert("Une erreur est survenue")
    } finally {
      setIsLoading(null)
    }
  }

  async function handleMarkNoShow() {
    setIsLoading("noshow")
    try {
      const result = await markAttendance(reservationId, "NO_SHOW")
      if (!result.success) {
        alert(result.error)
      }
      router.refresh()
    } catch (error) {
      alert("Une erreur est survenue")
    } finally {
      setIsLoading(null)
    }
  }

  async function handleReset() {
    setIsLoading("reset")
    try {
      const result = await resetAttendance(reservationId)
      if (!result.success) {
        alert(result.error)
      }
      router.refresh()
    } catch (error) {
      alert("Une erreur est survenue")
    } finally {
      setIsLoading(null)
    }
  }

  // If already marked, show status with reset option
  if (currentStatus === "ATTENDED") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-green-600 flex items-center gap-1">
          <Check className="h-4 w-4" />
          Présent
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReset}
          disabled={isLoading !== null}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          title="Réinitialiser"
        >
          {isLoading === "reset" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </Button>
      </div>
    )
  }

  if (currentStatus === "NO_SHOW") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-red-600 flex items-center gap-1">
          <X className="h-4 w-4" />
          Absent
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReset}
          disabled={isLoading !== null}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          title="Réinitialiser"
        >
          {isLoading === "reset" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </Button>
      </div>
    )
  }

  // BOOKED status - show both buttons
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleMarkPresent}
        disabled={isLoading !== null}
        className="text-green-600 border-green-200 hover:bg-green-50"
      >
        {isLoading === "present" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Check className="h-4 w-4 mr-1" />
            Présent
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleMarkNoShow}
        disabled={isLoading !== null}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        {isLoading === "noshow" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <X className="h-4 w-4 mr-1" />
            No-show
          </>
        )}
      </Button>
    </div>
  )
}
