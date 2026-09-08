"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"

interface WalkInAttendanceButtonsProps {
  walkInId: string
  currentStatus: "BOOKED" | "ATTENDED" | "NO_SHOW"
}

export function WalkInAttendanceButtons({ walkInId, currentStatus }: WalkInAttendanceButtonsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleAttendance = async (status: "ATTENDED" | "NO_SHOW" | "BOOKED") => {
    setLoading(status)
    try {
      const res = await fetch("/api/admin/walkin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walkInId, status }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      console.error("Attendance error:", error)
      alert("Erreur lors de la mise à jour")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={currentStatus === "ATTENDED" ? "default" : "outline"}
        className={currentStatus === "ATTENDED" 
          ? "bg-green-600 hover:bg-green-700 text-white" 
          : "text-green-600 border-green-200 hover:bg-green-50"}
        onClick={() => handleAttendance("ATTENDED")}
        disabled={loading !== null}
      >
        {loading === "ATTENDED" ? (
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
        variant={currentStatus === "NO_SHOW" ? "default" : "outline"}
        className={currentStatus === "NO_SHOW" 
          ? "bg-red-600 hover:bg-red-700 text-white" 
          : "text-red-600 border-red-200 hover:bg-red-50"}
        onClick={() => handleAttendance("NO_SHOW")}
        disabled={loading !== null}
      >
        {loading === "NO_SHOW" ? (
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
