import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, CreditCard, Clock } from "lucide-react"

export default async function ClientDashboard() {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  // Get user data
  const [profile, wallet, upcomingReservations, recentPurchases] = await Promise.all([
    db.clientProfile.findUnique({
      where: { userId: session.user.id },
    }),
    db.wallet.findUnique({
      where: { userId: session.user.id },
    }),
    db.reservation.findMany({
      where: {
        userId: session.user.id,
        status: "BOOKED",
        session: {
          startAt: { gte: new Date() },
        },
      },
      include: {
        session: {
          include: {
            classType: true,
            teacher: true,
          },
        },
      },
      orderBy: { session: { startAt: "asc" } },
      take: 5,
    }),
    db.purchase.findMany({
      where: {
        userId: session.user.id,
        status: "PAID",
      },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-tempo-bordeaux">
          Bonjour {profile?.firstName || ""}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Bienvenue dans votre espace personnel
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Crédits disponibles
            </CardTitle>
            <CreditCard className="h-4 w-4 text-tempo-bordeaux" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tempo-bordeaux">
              {wallet?.creditsBalance || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              cours à utiliser
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prochains cours
            </CardTitle>
            <Calendar className="h-4 w-4 text-tempo-bordeaux" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tempo-bordeaux">
              {upcomingReservations.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              réservations à venir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild size="sm" className="bg-tempo-bordeaux hover:bg-tempo-noir">
              <Link href="/app/planning">Réserver</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/app/paiements">Acheter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Mes prochains cours</CardTitle>
          <CardDescription>
            Vos réservations à venir
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune réservation à venir</p>
              <Button asChild className="mt-4 bg-tempo-bordeaux hover:bg-tempo-noir">
                <Link href="/app/planning">Réserver un cours</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-tempo-taupe/10 gap-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div 
                      className="w-2 h-10 sm:h-12 rounded-full shrink-0"
                      style={{ backgroundColor: reservation.session.classType.colorTag || "#42101B" }}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {reservation.session.classType.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        avec {reservation.session.teacher.displayName}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right pl-5 sm:pl-0">
                    <p className="font-medium text-sm sm:text-base">
                      {format(reservation.session.startAt, "EEE d MMM", { locale: fr })}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center sm:justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {format(reservation.session.startAt, "HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <Button asChild variant="ghost" className="text-tempo-bordeaux">
                  <Link href="/app/reservations">Voir toutes mes réservations</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Purchases */}
      {recentPurchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Derniers achats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">{purchase.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(purchase.createdAt, "d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {(purchase.amountCents / 100).toFixed(0)}€
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
