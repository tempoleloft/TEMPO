import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSettings, getAdmins } from "@/lib/actions/admin"

export const dynamic = 'force-dynamic'
import { SettingsForm } from "@/components/admin/settings-form"
import { AddAdminForm } from "@/components/admin/add-admin-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Palette } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default async function AdminSettingsPage() {
  const session = await auth()
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const [settings, admins] = await Promise.all([
    getSettings(),
    getAdmins(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-tempo-bordeaux">Paramètres</h1>
        <p className="text-muted-foreground">
          Configuration du studio et de l'application
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Politique de réservation
            </CardTitle>
            <CardDescription>
              Règles de réservation et annulation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm settings={settings} />
          </CardContent>
        </Card>

        {/* Admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Administrateurs
            </CardTitle>
            <CardDescription>
              Gérer les comptes administrateurs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* List of admins */}
            <div className="space-y-2">
              {admins.map((admin) => (
                <div 
                  key={admin.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {admin.clientProfile 
                        ? `${admin.clientProfile.firstName} ${admin.clientProfile.lastName}`
                        : admin.email}
                    </p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Depuis {format(new Date(admin.createdAt), "MMM yyyy", { locale: fr })}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Add admin form */}
            <div className="pt-4 border-t">
              <AddAdminForm />
            </div>
          </CardContent>
        </Card>

        {/* Studio Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Informations du studio
            </CardTitle>
            <CardDescription>
              Détails et personnalisation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Nom du studio</p>
              <p className="text-sm text-muted-foreground">Tempo – Le Loft</p>
            </div>
            <div>
              <p className="text-sm font-medium">Adresse</p>
              <p className="text-sm text-muted-foreground">41 Rue du Temple, 75004 Paris</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email de contact</p>
              <p className="text-sm text-muted-foreground">contact@tempoleloft.com</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Couleurs de la marque</p>
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-tempo-bordeaux"></div>
                  <span className="text-xs text-muted-foreground">#42101B</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-tempo-creme border"></div>
                  <span className="text-xs text-muted-foreground">#F2F1ED</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
