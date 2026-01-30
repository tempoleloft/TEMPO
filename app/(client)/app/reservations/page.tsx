import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, MapPin, User } from "lucide-react"
import Link from "next/link"
import { BookingButton } from "@/components/booking/booking-button"

export default async function ReservationsPage() {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  const [upcomingReservations, pastReservations, wallet] = await Promise.all([
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
    }),
    db.reservation.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { status: { in: ["ATTENDED", "NO_SHOW", "CANCELLED"] } },
          { session: { startAt: { lt: new Date() } } },
        ],
      },
      include: {
        session: {
          include: {
            classType: true,
            teacher: true,
          },
        },
      },
      orderBy: { session: { startAt: "desc" } },
      take: 20,
    }),
    db.wallet.findUnique({
      where: { userId: session.user.id },
    }),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-tempo-bordeaux">
          Mes réservations
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos cours à venir et consultez votre historique
        </p>
      </div>

      {/* Upcoming */}
      <Card>
        <CardHeader>
          <CardTitle>Cours à venir</CardTitle>
          <CardDescription>
            {upcomingReservations.length} réservation{upcomingReservations.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">Aucune réservation à venir</p>
              <Button asChild className="bg-tempo-bordeaux hover:bg-tempo-noir">
                <Link href="/app/planning">Réserver un cours</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-tempo-taupe/10"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-1 h-14 rounded-full"
                      style={{ backgroundColor: reservation.session.classType.colorTag || "#42101B" }}
                    />
                    <div>
                      <p className="font-semibold text-tempo-bordeaux">
                        {reservation.session.classType.title}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(reservation.session.startAt, "HH:mm")}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {reservation.session.teacher.displayName}
                        </span>
                        {reservation.session.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {reservation.session.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {format(reservation.session.startAt, "EEEE d MMMM", { locale: fr })}
                      </p>
                    </div>
                    <BookingButton
                      sessionId={reservation.sessionId}
                      isBooked={true}
                      isFull={false}
                      isPast={false}
                      hasCredits={(wallet?.creditsBalance || 0) > 0}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>
            Vos derniers cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun historique
            </div>
          ) : (
            <div className="space-y-3">
              {pastReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {reservation.session.classType.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(reservation.session.startAt, "d MMMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      reservation.status === "ATTENDED"
                        ? "default"
                        : reservation.status === "CANCELLED"
                        ? "outline"
                        : reservation.status === "NO_SHOW"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {reservation.status === "ATTENDED" && "Présent"}
                    {reservation.status === "CANCELLED" && "Annulé"}
                    {reservation.status === "NO_SHOW" && "Absent"}
                    {reservation.status === "BOOKED" && "Passé"}
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
