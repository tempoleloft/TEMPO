"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"

export function ExportButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleExport() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/export-payments")
      
      if (!response.ok) {
        throw new Error("Erreur lors de l'export")
      }
      
      // Get the blob from response
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `paiements-tempo-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export error:", error)
      alert("Erreur lors de l'export")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleExport}
      disabled={isLoading}
      className="bg-tempo-bordeaux hover:bg-tempo-noir"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      Exporter Excel
    </Button>
  )
}
