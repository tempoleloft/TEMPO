import { db } from "@/lib/db"
import { format, startOfWeek, endOfWeek, addWeeks, eachDayOfInterval } from "date-fns"

export const dynamic = 'force-dynamic'
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, User, MapPin } from "lucide-react"

interface PageProps {
  searchParams: { week?: string }
}

export default async function PublicPlanningPage({ searchParams }: PageProps) {
  const weekOffset = parseInt(searchParams.week || "0")
  const now = new Date()
  const weekStart = startOfWeek(addWeeks(now, weekOffset), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Get sessions for this week
  const sessions = await db.session.findMany({
    where: {
      status: "SCHEDULED",
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

  // Group sessions by day
  const sessionsByDay = days.map((day) => ({
    date: day,
    sessions: sessions.filter(
      (s) => format(s.startAt, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    ),
  }))

  return (
    <div className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-tempo-bordeaux mb-4">
            Planning des cours
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Découvrez nos cours de yoga et pilates. 
            Connectez-vous pour réserver votre place.
          </p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            asChild
            variant="outline"
            disabled={weekOffset <= 0}
          >
            <Link href={`/planning?week=${weekOffset - 1}`}>
              ← Semaine précédente
            </Link>
          </Button>
          
          <h2 className="text-xl font-semibold text-tempo-bordeaux">
            {format(weekStart, "d MMMM", { locale: fr })} - {format(weekEnd, "d MMMM yyyy", { locale: fr })}
          </h2>
          
          <Button
            asChild
            variant="outline"
            disabled={weekOffset >= 4}
          >
            <Link href={`/planning?week=${weekOffset + 1}`}>
              Semaine suivante →
            </Link>
          </Button>
        </div>

        {/* Planning Grid */}
        <div className="grid gap-6">
          {sessionsByDay.map(({ date, sessions }) => (
            <div key={date.toISOString()} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-tempo-bordeaux text-tempo-creme px-6 py-3">
                <h3 className="font-semibold capitalize">
                  {format(date, "EEEE d MMMM", { locale: fr })}
                </h3>
              </div>
              
              {sessions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  Aucun cours ce jour
                </div>
              ) : (
                <div className="divide-y">
                  {sessions.map((session) => {
                    const spotsLeft = session.capacity - session.reservations.length
                    const isFull = spotsLeft <= 0
                    
                    return (
                      <div
                        key={session.id}
                        className="p-4 flex items-center justify-between hover:bg-tempo-taupe/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-1 h-14 rounded-full"
                            style={{ backgroundColor: session.classType.colorTag || "#42101B" }}
                          />
                          <div>
                            <p className="font-semibold text-tempo-bordeaux">
                              {session.classType.title}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(session.startAt, "HH:mm")} - {format(session.endAt, "HH:mm")}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {session.teacher.displayName}
                              </span>
                              {session.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {session.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {session.classType.level && (
                            <Badge variant="outline" className="hidden sm:inline-flex">
                              {session.classType.level}
                            </Badge>
                          )}
                          
                          {isFull ? (
                            <Badge variant="destructive">COMPLET</Badge>
                          ) : (
                            <Badge variant="secondary">
                              {spotsLeft} place{spotsLeft > 1 ? "s" : ""}
                            </Badge>
                          )}
                          
                          <Button
                            asChild
                            size="sm"
                            className="bg-tempo-bordeaux hover:bg-tempo-noir"
                            disabled={isFull}
                          >
                            <Link href="/login?callbackUrl=/app/planning">
                              Réserver
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-tempo-bordeaux text-tempo-creme rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4">Prêt à commencer ?</h3>
          <p className="opacity-80 mb-6">
            Créez votre compte pour réserver vos cours et profiter de nos offres.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild className="bg-tempo-creme text-tempo-bordeaux hover:bg-tempo-taupe">
              <Link href="/register">Créer un compte</Link>
            </Button>
            <Button asChild variant="outline" className="border-tempo-creme/30 text-tempo-creme hover:bg-tempo-creme/10">
              <Link href="/tarifs">Voir les tarifs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
