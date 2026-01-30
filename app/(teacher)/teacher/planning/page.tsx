import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { format, startOfWeek, endOfWeek, addWeeks, eachDayOfInterval } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, MapPin, Users } from "lucide-react"

interface PageProps {
  searchParams: { week?: string }
}

export default async function TeacherPlanningPage({ searchParams }: PageProps) {
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

  const weekOffset = parseInt(searchParams.week || "0")
  const now = new Date()
  const weekStart = startOfWeek(addWeeks(now, weekOffset), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Get sessions for this teacher
  const sessions = await db.session.findMany({
    where: {
      teacherId: teacherProfile.id,
      startAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    include: {
      classType: true,
      reservations: {
        where: { status: "BOOKED" },
      },
    },
    orderBy: { startAt: "asc" },
  })

  const sessionsByDay = days.map((day) => ({
    date: day,
    sessions: sessions.filter(
      (s) => format(s.startAt, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    ),
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-tempo-bordeaux">Mon planning</h1>
        <p className="text-muted-foreground mt-1">
          Vos cours de la semaine
        </p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
        <Button
          asChild
          variant="outline"
        >
          <Link href={`/teacher/planning?week=${weekOffset - 1}`}>
            ← Précédent
          </Link>
        </Button>
        
        <h2 className="text-lg font-semibold text-tempo-bordeaux">
          {format(weekStart, "d MMM", { locale: fr })} - {format(weekEnd, "d MMM yyyy", { locale: fr })}
        </h2>
        
        <Button
          asChild
          variant="outline"
        >
          <Link href={`/teacher/planning?week=${weekOffset + 1}`}>
            Suivant →
          </Link>
        </Button>
      </div>

      {/* Planning Grid */}
      <div className="grid gap-4">
        {sessionsByDay.map(({ date, sessions }) => (
          <div key={date.toISOString()} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-tempo-bordeaux text-tempo-creme px-6 py-3">
              <h3 className="font-semibold capitalize">
                {format(date, "EEEE d MMMM", { locale: fr })}
              </h3>
            </div>
            
            {sessions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                Pas de cours ce jour
              </div>
            ) : (
              <div className="divide-y">
                {sessions.map((classSession) => (
                  <Link
                    key={classSession.id}
                    href={`/teacher/session/${classSession.id}`}
                    className="p-4 flex items-center justify-between hover:bg-tempo-taupe/10 transition-colors block"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-1 h-14 rounded-full"
                        style={{ backgroundColor: classSession.classType.colorTag || "#42101B" }}
                      />
                      <div>
                        <p className="font-semibold text-tempo-bordeaux">
                          {classSession.classType.title}
                          {classSession.status === "CANCELLED" && (
                            <Badge variant="destructive" className="ml-2">Annulé</Badge>
                          )}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(classSession.startAt, "HH:mm")} - {format(classSession.endAt, "HH:mm")}
                          </span>
                          {classSession.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {classSession.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <Badge 
                          variant={
                            classSession.reservations.length >= classSession.capacity 
                              ? "destructive" 
                              : "secondary"
                          }
                        >
                          {classSession.reservations.length}/{classSession.capacity}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
