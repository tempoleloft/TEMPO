import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Users, CreditCard, TrendingUp, Clock } from "lucide-react"

export default async function AdminDashboard() {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  // Get stats
  const [
    totalClients,
    totalTeachers,
    sessionsThisWeek,
    reservationsThisWeek,
    revenueThisMonth,
    upcomingSessions,
  ] = await Promise.all([
    db.user.count({ where: { role: "CLIENT" } }),
    db.user.count({ where: { role: "TEACHER" } }),
    db.session.count({
      where: {
        status: "SCHEDULED",
        startAt: { gte: weekStart, lte: weekEnd },
      },
    }),
    db.reservation.count({
      where: {
        status: "BOOKED",
        session: {
          startAt: { gte: weekStart, lte: weekEnd },
        },
      },
    }),
    db.purchase.aggregate({
      where: {
        status: "PAID",
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
      _sum: { amountCents: true },
    }),
    db.session.findMany({
      where: {
        status: "SCHEDULED",
        startAt: { gte: now },
      },
      include: {
        classType: true,
        teacher: true,
        reservations: {
          where: { status: "BOOKED" },
        },
      },
      orderBy: { startAt: "asc" },
      take: 8,
    }),
  ])

  const monthlyRevenue = (revenueThisMonth._sum.amountCents || 0) / 100

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tempo-bordeaux">
            Administration
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de votre studio
          </p>
        </div>
        <Button asChild className="bg-tempo-bordeaux hover:bg-tempo-noir">
          <Link href="/admin/planning">Gérer le planning</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients
            </CardTitle>
            <Users className="h-4 w-4 text-tempo-bordeaux" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tempo-bordeaux">
              {totalClients}
            </div>
            <Link href="/admin/clients" className="text-xs text-muted-foreground hover:underline">
              Voir tous les clients
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Professeurs
            </CardTitle>
            <Users className="h-4 w-4 text-tempo-bordeaux" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tempo-bordeaux">
              {totalTeachers}
            </div>
            <Link href="/admin/profs" className="text-xs text-muted-foreground hover:underline">
              Gérer les professeurs
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cours cette semaine
            </CardTitle>
            <Calendar className="h-4 w-4 text-tempo-bordeaux" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tempo-bordeaux">
              {sessionsThisWeek}
            </div>
            <p className="text-xs text-muted-foreground">
              {reservationsThisWeek} réservations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CA du mois
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-tempo-bordeaux" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tempo-bordeaux">
              {monthlyRevenue.toFixed(0)}€
            </div>
            <p className="text-xs text-muted-foreground">
              {format(now, "MMMM yyyy", { locale: fr })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Prochains cours</CardTitle>
          <CardDescription>
            Sessions à venir avec places disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun cours programmé</p>
              <Button asChild className="mt-4 bg-tempo-bordeaux hover:bg-tempo-noir">
                <Link href="/admin/planning">Créer un cours</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/admin/session/${session.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-tempo-taupe/10 hover:bg-tempo-taupe/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-2 h-10 rounded-full"
                      style={{ backgroundColor: session.classType.colorTag || "#42101B" }}
                    />
                    <div>
                      <p className="font-semibold">
                        {session.classType.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.teacher.displayName} • {session.location || "Salle principale"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {format(session.startAt, "EEE d MMM", { locale: fr })}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {format(session.startAt, "HH:mm")}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        session.reservations.length >= session.capacity 
                          ? "destructive" 
                          : session.reservations.length >= session.capacity * 0.8
                          ? "default"
                          : "secondary"
                      }
                      className="min-w-[60px] justify-center"
                    >
                      {session.reservations.length}/{session.capacity}
                    </Badge>
                  </div>
                </Link>
              ))}
              <div className="text-center pt-2">
                <Button asChild variant="ghost" className="text-tempo-bordeaux">
                  <Link href="/admin/planning">Voir le planning complet</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
