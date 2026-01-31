import { db } from "@/lib/db"
import { format, startOfWeek, endOfWeek, addWeeks, eachDayOfInterval } from "date-fns"

export const dynamic = 'force-dynamic'
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, User, MapPin, Plus } from "lucide-react"

interface PageProps {
  searchParams: { week?: string }
}

export default async function AdminPlanningPage({ searchParams }: PageProps) {
  const weekOffset = parseInt(searchParams.week || "0")
  const now = new Date()
  const weekStart = startOfWeek(addWeeks(now, weekOffset), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const sessions = await db.session.findMany({
    where: {
      startAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    include: {
      classType: true,
      teacher: true,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-tempo-bordeaux">Planning</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gérez les cours de la semaine
          </p>
        </div>
        <Button asChild className="bg-tempo-bordeaux hover:bg-tempo-noir w-full sm:w-auto">
          <Link href="/admin/planning/new">
            <Plus className="h-4 w-4 mr-2" />
            Créer un cours
          </Link>
        </Button>
      </div>

      {/* Week Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-lg p-4 shadow-sm">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          <Link href={`/admin/planning?week=${weekOffset - 1}`}>
            ← Précédent
          </Link>
        </Button>
        
        <h2 className="text-base sm:text-lg font-semibold text-tempo-bordeaux text-center order-1 sm:order-2">
          {format(weekStart, "d MMM", { locale: fr })} - {format(weekEnd, "d MMM yyyy", { locale: fr })}
        </h2>
        
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full sm:w-auto order-3"
        >
          <Link href={`/admin/planning?week=${weekOffset + 1}`}>
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
                Aucun cours programmé
              </div>
            ) : (
              <div className="divide-y">
                {sessions.map((session) => {
                  const spotsLeft = session.capacity - session.reservations.length
                  const fillRate = (session.reservations.length / session.capacity) * 100
                  
                  return (
                    <Link
                      key={session.id}
                      href={`/admin/session/${session.id}`}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-tempo-taupe/10 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div 
                          className="w-1 h-12 sm:h-14 rounded-full shrink-0"
                          style={{ backgroundColor: session.classType.colorTag || "#42101B" }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-tempo-bordeaux flex flex-wrap items-center gap-2">
                            <span className="truncate">{session.classType.title}</span>
                            {session.status === "CANCELLED" && (
                              <Badge variant="destructive" className="text-xs">Annulé</Badge>
                            )}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(session.startAt, "HH:mm")} - {format(session.endAt, "HH:mm")}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {session.teacher.displayName}
                            </span>
                            {session.location && (
                              <span className="flex items-center gap-1 hidden sm:flex">
                                <MapPin className="h-3 w-3" />
                                {session.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:gap-4 pl-4 sm:pl-0">
                        <div className="flex-1 sm:w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              fillRate >= 100 ? "bg-red-500" : 
                              fillRate >= 80 ? "bg-amber-500" : 
                              "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(fillRate, 100)}%` }}
                          />
                        </div>
                        <Badge 
                          variant={
                            spotsLeft <= 0 
                              ? "destructive" 
                              : spotsLeft <= 2
                              ? "default"
                              : "secondary"
                          }
                          className="min-w-[50px] sm:min-w-[60px] justify-center shrink-0"
                        >
                          {session.reservations.length}/{session.capacity}
                        </Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
