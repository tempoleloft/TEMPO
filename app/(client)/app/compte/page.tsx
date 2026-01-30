import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { User, Mail, Phone, Calendar, CreditCard } from "lucide-react"

export default async function ComptePage() {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  const [profile, wallet, creditHistory] = await Promise.all([
    db.clientProfile.findUnique({
      where: { userId: session.user.id },
    }),
    db.wallet.findUnique({
      where: { userId: session.user.id },
    }),
    db.creditLedger.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-tempo-bordeaux">
          Mon compte
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos informations personnelles
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Vos coordonnées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-medium">
                  {profile?.firstName} {profile?.lastName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
            </div>
            
            {profile?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
            )}
            
            {profile?.birthdate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date de naissance</p>
                  <p className="font-medium">
                    {format(profile.birthdate, "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>
            )}

            <Button variant="outline" className="mt-4" disabled>
              Modifier mes informations (bientôt)
            </Button>
          </CardContent>
        </Card>

        {/* Wallet */}
        <Card>
          <CardHeader>
            <CardTitle>Mon portefeuille</CardTitle>
            <CardDescription>
              Vos crédits de cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 mx-auto text-tempo-bordeaux mb-4" />
              <p className="text-5xl font-bold text-tempo-bordeaux">
                {wallet?.creditsBalance || 0}
              </p>
              <p className="text-muted-foreground mt-2">
                crédits disponibles
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des crédits</CardTitle>
          <CardDescription>
            Mouvements de votre portefeuille
          </CardDescription>
        </CardHeader>
        <CardContent>
          {creditHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun mouvement
            </div>
          ) : (
            <div className="space-y-3">
              {creditHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {entry.reason === "PURCHASE" && "Achat"}
                      {entry.reason === "BOOKING" && "Réservation"}
                      {entry.reason === "CANCEL_REFUND" && "Annulation"}
                      {entry.reason === "ADMIN_ADJUST" && "Ajustement admin"}
                      {entry.reason === "EXPIRATION" && "Expiration"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(entry.createdAt, "d MMM yyyy à HH:mm", { locale: fr })}
                    </p>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={entry.delta > 0 ? "default" : entry.delta < 0 ? "destructive" : "secondary"}
                    className={entry.delta > 0 ? "bg-green-600" : ""}
                  >
                    {entry.delta > 0 ? "+" : ""}{entry.delta}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
