import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { format, startOfWeek, endOfWeek, addWeeks, eachDayOfInterval } from "date-fns"

export const dynamic = 'force-dynamic'
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, User, MapPin } from "lucide-react"
import { BookingButton } from "@/components/booking/booking-button"

interface PageProps {
  searchParams: { week?: string }
}

export default async function ClientPlanningPage({ searchParams }: PageProps) {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  const weekOffset = parseInt(searchParams.week || "0")
  const now = new Date()
  const weekStart = startOfWeek(addWeeks(now, weekOffset), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Get sessions, user wallet, existing reservations, and waitlist entries
  const [sessions, wallet, userReservations, userWaitlist] = await Promise.all([
    db.session.findMany({
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
        waitlist: {
          where: { status: "WAITING" },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { startAt: "asc" },
    }),
    db.wallet.findUnique({
      where: { userId: session.user.id },
    }),
    db.reservation.findMany({
      where: {
        userId: session.user.id,
        status: "BOOKED",
        session: {
          startAt: { gte: weekStart, lte: weekEnd },
        },
      },
      select: { sessionId: true },
    }),
    db.waitlistEntry.findMany({
      where: {
        userId: session.user.id,
        status: "WAITING",
        session: {
          startAt: { gte: weekStart, lte: weekEnd },
        },
      },
      select: { sessionId: true, position: true },
    }),
  ])

  const reservedSessionIds = new Set(userReservations.map((r) => r.sessionId))
  const waitlistMap = new Map(userWaitlist.map((w) => [w.sessionId, w.position]))

  // Group sessions by day
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
            Réservez vos cours pour la semaine
          </p>
        </div>
        <div className="text-left sm:text-right bg-white p-3 rounded-lg shadow-sm">
          <p className="text-sm text-muted-foreground">Crédits disponibles</p>
          <p className="text-2xl font-bold text-tempo-bordeaux">
            {wallet?.creditsBalance || 0}
          </p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-lg p-4 shadow-sm">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full sm:w-auto order-2 sm:order-1"
          disabled={weekOffset <= 0}
        >
          <Link href={`/app/planning?week=${weekOffset - 1}`}>
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
          disabled={weekOffset >= 4}
        >
          <Link href={`/app/planning?week=${weekOffset + 1}`}>
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
                Aucun cours ce jour
              </div>
            ) : (
              <div className="divide-y">
                {sessions.map((classSession) => {
                  const spotsLeft = classSession.capacity - classSession.reservations.length
                  const isFull = spotsLeft <= 0
                  const isBooked = reservedSessionIds.has(classSession.id)
                  const isPast = classSession.startAt < now
                  const isOnWaitlist = waitlistMap.has(classSession.id)
                  const waitlistPosition = waitlistMap.get(classSession.id)
                  const hoursUntilClass = (classSession.startAt.getTime() - now.getTime()) / (1000 * 60 * 60)
                  const canCancel = hoursUntilClass >= 12
                  const waitlistCount = classSession.waitlist.length
                  
                  return (
                    <div
                      key={classSession.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isBooked ? "bg-green-50" : isOnWaitlist ? "bg-amber-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div 
                          className="w-1 h-12 sm:h-14 rounded-full shrink-0"
                          style={{ backgroundColor: classSession.classType.colorTag || "#42101B" }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-tempo-bordeaux flex flex-wrap items-center gap-2">
                            <span className="truncate">{classSession.classType.title}</span>
                            {isBooked && (
                              <Badge className="bg-green-600 text-xs">Réservé</Badge>
                            )}
                            {isOnWaitlist && (
                              <Badge className="bg-amber-500 text-xs">Attente #{waitlistPosition}</Badge>
                            )}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(classSession.startAt, "HH:mm")} - {format(classSession.endAt, "HH:mm")}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {classSession.teacher.displayName}
                            </span>
                            {classSession.location && (
                              <span className="flex items-center gap-1 hidden sm:flex">
                                <MapPin className="h-3 w-3" />
                                {classSession.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-4 sm:pl-0">
                        {isFull ? (
                          <div className="flex flex-col items-start sm:items-end gap-1">
                            <Badge variant="destructive" className="text-xs">COMPLET</Badge>
                            {waitlistCount > 0 && waitlistCount < 3 && (
                              <span className="text-xs text-muted-foreground">
                                {3 - waitlistCount} place{3 - waitlistCount > 1 ? "s" : ""} attente
                              </span>
                            )}
                            {waitlistCount >= 3 && (
                              <span className="text-xs text-muted-foreground">
                                Attente pleine
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {spotsLeft} place{spotsLeft > 1 ? "s" : ""}
                          </Badge>
                        )}
                        
                        <BookingButton
                          sessionId={classSession.id}
                          isBooked={isBooked}
                          isFull={isFull}
                          isPast={isPast}
                          hasCredits={(wallet?.creditsBalance || 0) > 0}
                          isOnWaitlist={isOnWaitlist}
                          waitlistPosition={waitlistPosition}
                          canCancel={canCancel}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No credits warning */}
      {(wallet?.creditsBalance || 0) === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-amber-800 mb-2">
            Vous n'avez plus de crédits disponibles
          </p>
          <Button asChild className="bg-tempo-bordeaux hover:bg-tempo-noir">
            <Link href="/app/paiements">Acheter des cours</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
