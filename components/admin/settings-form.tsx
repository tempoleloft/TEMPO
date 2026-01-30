"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateSettings } from "@/lib/actions/admin"
import { Loader2, Save } from "lucide-react"

interface Settings {
  cancelHoursBefore: number
  maxWaitlistSize: number
  defaultCapacity: number
  reminderEnabled: boolean
  reminderHoursBefore: number
}

interface SettingsFormProps {
  settings: Settings
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    cancelHoursBefore: settings.cancelHoursBefore,
    maxWaitlistSize: settings.maxWaitlistSize,
    defaultCapacity: settings.defaultCapacity,
    reminderEnabled: settings.reminderEnabled,
    reminderHoursBefore: settings.reminderHoursBefore,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await updateSettings(formData)
      
      if (result.success) {
        setMessage({ type: "success", text: "Paramètres enregistrés" })
        router.refresh()
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" })
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.type === "success" 
            ? "bg-green-50 text-green-700" 
            : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cancelHoursBefore">
            Délai d'annulation (heures avant le cours)
          </Label>
          <Input
            id="cancelHoursBefore"
            type="number"
            min={0}
            max={72}
            value={formData.cancelHoursBefore}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              cancelHoursBefore: parseInt(e.target.value) || 0 
            }))}
          />
          <p className="text-xs text-muted-foreground">
            Les clients ne pourront pas annuler moins de {formData.cancelHoursBefore}h avant le cours
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxWaitlistSize">
            Taille max de la liste d'attente
          </Label>
          <Input
            id="maxWaitlistSize"
            type="number"
            min={0}
            max={10}
            value={formData.maxWaitlistSize}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              maxWaitlistSize: parseInt(e.target.value) || 0 
            }))}
          />
          <p className="text-xs text-muted-foreground">
            {formData.maxWaitlistSize === 0 
              ? "Liste d'attente désactivée" 
              : `${formData.maxWaitlistSize} personne(s) max en liste d'attente`}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultCapacity">
            Capacité par défaut des cours
          </Label>
          <Input
            id="defaultCapacity"
            type="number"
            min={1}
            max={50}
            value={formData.defaultCapacity}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              defaultCapacity: parseInt(e.target.value) || 12 
            }))}
          />
        </div>

        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminderEnabled">Rappel avant cours</Label>
              <p className="text-xs text-muted-foreground">
                Envoyer un email de rappel aux participants
              </p>
            </div>
            <Switch
              id="reminderEnabled"
              checked={formData.reminderEnabled}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                reminderEnabled: checked 
              }))}
            />
          </div>

          {formData.reminderEnabled && (
            <div className="space-y-2">
              <Label htmlFor="reminderHoursBefore">
                Envoyer le rappel (heures avant)
              </Label>
              <Input
                id="reminderHoursBefore"
                type="number"
                min={1}
                max={72}
                value={formData.reminderHoursBefore}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  reminderHoursBefore: parseInt(e.target.value) || 24 
                }))}
              />
            </div>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-tempo-bordeaux hover:bg-tempo-noir"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer les paramètres
          </>
        )}
      </Button>
    </form>
  )
}
