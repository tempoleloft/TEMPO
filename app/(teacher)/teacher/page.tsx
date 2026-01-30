import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Users, Clock } from "lucide-react"
import Link from "next/link"

export default async function TeacherDashboard() {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  // Get teacher profile
  const teacherProfile = await db.teacherProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!teacherProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profil professeur non trouvé</p>
      </div>
    )
  }

  // Get upcoming sessions for this teacher
  const upcomingSessions = await db.session.findMany({
    where: {
      teacherId: teacherProfile.id,
      status: "SCHEDULED",
      startAt: { gte: new Date() },
    },
    include: {
      classType: true,
      reservations: {
        where: { status: "BOOKED" },
      },
    },
    orderBy: { startAt: "asc" },
    take: 10,
  })

  // Stats
  const totalSessionsThisWeek = await db.session.count({
    where: {
      teacherId: teacherProfile.id,
      status: "SCHEDULED",
      startAt: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  })

  const totalStudentsThisWeek = await db.reservation.count({
    where: {
      status: "BOOKED",
      session: {
        teacherId: teacherProfile.id,
        startAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    },
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-tempo-bordeaux">
          Bonjour {teacherProfile.displayName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Votre planning et vos élèves
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cours cette semaine
            </CardTitle>
            <Calendar className="h-4 w-4 text-tempo-bordeaux" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tempo-bordeaux">
              {totalSessionsThisWeek}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Élèves inscrits
            </CardTitle>
            <Users className="h-4 w-4 text-tempo-bordeaux" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tempo-bordeaux">
              {totalStudentsThisWeek}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Vos prochains cours</CardTitle>
          <CardDescription>
            Sessions à venir avec nombre d'inscrits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun cours programmé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/teacher/session/${session.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-tempo-taupe/10 hover:bg-tempo-taupe/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-2 h-12 rounded-full"
                      style={{ backgroundColor: session.classType.colorTag || "#42101B" }}
                    />
                    <div>
                      <p className="font-semibold">
                        {session.classType.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.location || "Salle principale"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-medium">
                        {format(session.startAt, "EEEE d MMM", { locale: fr })}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {format(session.startAt, "HH:mm")} - {format(session.endAt, "HH:mm")}
                      </p>
                    </div>
                    <Badge 
                      variant={session.reservations.length >= session.capacity ? "destructive" : "secondary"}
                      className="min-w-[60px] justify-center"
                    >
                      {session.reservations.length}/{session.capacity}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
