import { db } from "@/lib/db"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, MapPin, User, Users, ArrowLeft, Check, X, ClipboardList, Phone, UserPlus } from "lucide-react"
import Link from "next/link"
import { AttendanceButtons } from "@/components/admin/attendance-buttons"
import { CancelSessionButton } from "@/components/admin/cancel-session-button"
import { EditSessionButton } from "@/components/admin/edit-session-button"
import { AddParticipantDialog } from "@/components/admin/add-participant-dialog"
import { CancelWalkInButton } from "@/components/admin/cancel-walkin-button"
import { CancelParticipantButton } from "@/components/admin/cancel-participant-button"
import { EditWalkInDialog } from "@/components/admin/edit-walkin-dialog"
import { WalkInAttendanceButtons } from "@/components/admin/walkin-attendance-buttons"

interface PageProps {
  params: { id: string }
}

export default async function AdminSessionPage({ params }: PageProps) {
  const session = await db.session.findUnique({
    where: { id: params.id },
    include: {
      classType: true,
      teacher: true,
      reservations: {
        where: { status: { in: ["BOOKED", "ATTENDED", "NO_SHOW", "CANCELLED"] } },
        include: {
          user: {
            include: {
              clientProfile: true,
              wallet: true,
            },
          },
          guestReservations: true,
        },
        orderBy: { bookedAt: "asc" },
      },
      walkInParticipants: {
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!session) {
    notFound()
  }

  // For cancelled sessions, show all reservations (including cancelled ones)
  // For active sessions, only show active reservations
  const isCancelledSession = session.status === "CANCELLED"
  const allActiveReservations = isCancelledSession 
    ? session.reservations.filter(r => r.status === "CANCELLED")
    : session.reservations.filter(r => ["BOOKED", "ATTENDED", "NO_SHOW"].includes(r.status))
  
  const bookedReservations = session.reservations.filter(r => r.status === "BOOKED")
  const attendedReservations = session.reservations.filter(r => r.status === "ATTENDED")
  const noShowReservations = session.reservations.filter(r => r.status === "NO_SHOW")
  const cancelledReservations = session.reservations.filter(r => r.status === "CANCELLED")
  
  // Count guests
  const allGuests = allActiveReservations.flatMap(r => r.guestReservations || [])
  const totalGuests = allGuests.length
  
  // Walk-in participants (ClassPass, Gymlib, etc.)
  const activeWalkIns = session.walkInParticipants.filter(w => w.status !== "CANCELLED")
  const bookedWalkIns = activeWalkIns.filter(w => w.status === "BOOKED")
  const attendedWalkIns = activeWalkIns.filter(w => w.status === "ATTENDED")
  const noShowWalkIns = activeWalkIns.filter(w => w.status === "NO_SHOW")
  
  // Total = reservations + guests + walk-ins
  const totalParticipants = allActiveReservations.length + totalGuests + activeWalkIns.length
  const spotsLeft = session.capacity - totalParticipants
  const pendingCount = bookedReservations.length + totalGuests + bookedWalkIns.length
  const presentCount = attendedReservations.length + attendedWalkIns.length
  const absentCount = noShowReservations.length + noShowWalkIns.length
  
  // Allow attendance marking for sessions on today's date or earlier
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sessionDate = new Date(session.startAt)
  sessionDate.setHours(0, 0, 0, 0)
  const isPastOrToday = sessionDate <= today

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/planning">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-tempo-bordeaux">
                {session.classType.title}
              </h1>
              {(session.level || session.classType.level) && (
                <Badge variant="secondary">{session.level || session.classType.level}</Badge>
              )}
              {session.status === "CANCELLED" && (
                <Badge variant="destructive">Annulé</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {format(session.startAt, "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {session.status !== "CANCELLED" && (
            <>
              <AddParticipantDialog
                sessionId={session.id}
                sessionName={session.classType.title}
              />
              <EditSessionButton
                sessionId={session.id}
                currentData={{
                  classTypeId: session.classTypeId,
                  date: format(session.startAt, "yyyy-MM-dd"),
                  time: format(session.startAt, "HH:mm"),
                  endTime: format(session.endAt, "HH:mm"),
                  capacity: session.capacity,
                  location: session.location,
                  level: session.level,
                }}
              />
            </>
          )}
          <CancelSessionButton
            sessionId={session.id}
            sessionTitle={session.classType.title}
            participantsCount={totalParticipants}
            isCancelled={session.status === "CANCELLED"}
          />
        </div>
      </div>

      {/* Session Info */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-tempo-bordeaux" />
              <div>
                <p className="text-sm text-muted-foreground">Professeur</p>
                <p className="font-semibold">{session.teacher.displayName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-tempo-bordeaux" />
              <div>
                <p className="text-sm text-muted-foreground">Horaire</p>
                <p className="font-semibold">
                  {format(session.startAt, "HH:mm")} - {format(session.endAt, "HH:mm")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-tempo-bordeaux" />
              <div>
                <p className="text-sm text-muted-foreground">Lieu</p>
                <p className="font-semibold">{session.location || "Salle principale"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-tempo-bordeaux" />
              <div>
                <p className="text-sm text-muted-foreground">Places</p>
                <p className="font-semibold">
                  {totalParticipants}/{session.capacity}
                  {spotsLeft > 0 && (
                    <span className="text-muted-foreground font-normal"> ({spotsLeft} restantes)</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Émargement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-tempo-bordeaux" />
            Émargement
          </CardTitle>
          <CardDescription>
            {isCancelledSession
              ? "Participants inscrits avant l'annulation du cours (crédits remboursés)"
              : isPastOrToday
              ? "Cliquez sur Présent ou No-show pour chaque participant"
              : "L'émargement sera disponible le jour du cours"}
          </CardDescription>
          
          {/* Stats résumé */}
          {totalParticipants > 0 && !isCancelledSession && (
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <span>En attente: {pendingCount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Présents: {presentCount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Absents: {absentCount}</span>
              </div>
            </div>
          )}
          {isCancelledSession && totalParticipants > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>{totalParticipants} personne{totalParticipants > 1 ? "s" : ""}</strong> étai{totalParticipants > 1 ? "en" : ""}t inscrite{totalParticipants > 1 ? "s" : ""} à ce cours.
                Un email d&apos;annulation leur a été envoyé et leurs crédits ont été remboursés.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {totalParticipants === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun participant inscrit</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(() => {
                let participantIndex = 0
                return allActiveReservations.flatMap((reservation) => {
                  const statusColors = {
                    BOOKED: "bg-gray-50",
                    ATTENDED: "bg-green-50 border-l-4 border-green-500",
                    NO_SHOW: "bg-red-50 border-l-4 border-red-500",
                    CANCELLED: "bg-amber-50 border-l-4 border-amber-400",
                  }
                  
                  const elements = []
                  participantIndex++
                  const currentIndex = participantIndex
                  
                  // Main reservation
                  elements.push(
                    <div
                      key={reservation.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${statusColors[reservation.status as keyof typeof statusColors] || "bg-tempo-taupe/10"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          reservation.status === "ATTENDED"
                            ? "bg-green-600 text-white"
                            : reservation.status === "NO_SHOW"
                            ? "bg-red-600 text-white"
                            : reservation.status === "CANCELLED"
                            ? "bg-amber-500 text-white"
                            : "bg-tempo-bordeaux text-tempo-creme"
                        }`}>
                          {reservation.status === "ATTENDED" ? (
                            <Check className="h-4 w-4" />
                          ) : reservation.status === "NO_SHOW" ? (
                            <X className="h-4 w-4" />
                          ) : (
                            currentIndex
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {reservation.user.clientProfile?.firstName}{" "}
                            {reservation.user.clientProfile?.lastName}
                            {reservation.guestReservations && reservation.guestReservations.length > 0 && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                +{reservation.guestReservations.length} invité{reservation.guestReservations.length > 1 ? "s" : ""}
                              </Badge>
                            )}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{reservation.user.email}</span>
                            {reservation.user.clientProfile?.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {reservation.user.clientProfile.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">Crédits</p>
                          <p className="font-semibold">{reservation.user.wallet?.creditsBalance || 0}</p>
                        </div>
                        
                        {isCancelledSession ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            Remboursé
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            {isPastOrToday ? (
                              <AttendanceButtons
                                reservationId={reservation.id}
                                currentStatus={reservation.status as "BOOKED" | "ATTENDED" | "NO_SHOW"}
                              />
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-200"
                                  disabled
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Présent
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200"
                                  disabled
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  No-show
                                </Button>
                              </>
                            )}
                            {reservation.status === "BOOKED" && (
                              <CancelParticipantButton
                                reservationId={reservation.id}
                                participantName={`${reservation.user.clientProfile?.firstName} ${reservation.user.clientProfile?.lastName}`}
                                hasCredits={true}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                  
                  // Guest reservations
                  if (reservation.guestReservations) {
                    reservation.guestReservations.forEach((guest) => {
                      participantIndex++
                      const guestIndex = participantIndex
                      elements.push(
                        <div
                          key={guest.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border-l-4 border-blue-400 ml-8"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-blue-500 text-white">
                              {guestIndex}
                            </div>
                            <div>
                              <p className="font-semibold flex items-center gap-2">
                                {guest.guestFirstName} {guest.guestLastName}
                                <Badge variant="outline" className="text-xs border-blue-400 text-blue-600">
                                  Invité +1
                                </Badge>
                              </p>
                              <div className="text-sm text-muted-foreground">
                                {guest.guestEmail ? (
                                  <span>{guest.guestEmail}</span>
                                ) : (
                                  <span className="italic">Pas d&apos;email</span>
                                )}
                                <span className="mx-2">•</span>
                                <span>
                                  Invité par {reservation.user.clientProfile?.firstName} {reservation.user.clientProfile?.lastName}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                  
                  return elements
                })
              })()}
              
              {/* Walk-in participants */}
              {activeWalkIns.map((walkIn, index) => {
                const statusColors = {
                  BOOKED: "bg-purple-50 border-l-4 border-purple-400",
                  ATTENDED: "bg-green-50 border-l-4 border-green-500",
                  NO_SHOW: "bg-red-50 border-l-4 border-red-500",
                }
                const sourceLabels: Record<string, string> = {
                  CLASSPASS: "ClassPass",
                  GYMLIB: "Gymlib",
                  LASTSPOT: "Lastspot",
                  WALK_IN: "Walk-in",
                  INSTAGRAM: "Instagram",
                  WORD_OF_MOUTH: "Bouche à oreille",
                  OTHER: "Autre",
                }
                
                return (
                  <div
                    key={walkIn.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${statusColors[walkIn.status as keyof typeof statusColors] || "bg-purple-50 border-l-4 border-purple-400"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        walkIn.status === "ATTENDED"
                          ? "bg-green-600 text-white"
                          : walkIn.status === "NO_SHOW"
                          ? "bg-red-600 text-white"
                          : "bg-purple-500 text-white"
                      }`}>
                        {walkIn.status === "ATTENDED" ? (
                          <Check className="h-4 w-4" />
                        ) : walkIn.status === "NO_SHOW" ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          {walkIn.firstName} {walkIn.lastName}
                          <Badge variant="outline" className="text-xs border-purple-400 text-purple-600">
                            {sourceLabels[walkIn.source] || walkIn.source}
                          </Badge>
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {walkIn.email && <span>{walkIn.email}</span>}
                          {walkIn.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {walkIn.phone}
                            </span>
                          )}
                          {!walkIn.email && !walkIn.phone && (
                            <span className="italic">Pas de coordonnées</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {walkIn.numeroReservation && (
                        <div className="text-right text-xs text-muted-foreground">
                          <p>N° rés.</p>
                          <p className="font-mono">{walkIn.numeroReservation.substring(0, 8)}...</p>
                        </div>
                      )}
                      
                      {isPastOrToday && (
                        <WalkInAttendanceButtons
                          walkInId={walkIn.id}
                          currentStatus={walkIn.status as "BOOKED" | "ATTENDED" | "NO_SHOW"}
                        />
                      )}
                      
                      <EditWalkInDialog
                        walkIn={{
                          id: walkIn.id,
                          firstName: walkIn.firstName,
                          lastName: walkIn.lastName,
                          email: walkIn.email,
                          phone: walkIn.phone,
                          source: walkIn.source,
                          numeroReservation: walkIn.numeroReservation,
                        }}
                      />
                      
                      {walkIn.status === "BOOKED" && (
                        <CancelWalkInButton
                          walkInId={walkIn.id}
                          participantName={`${walkIn.firstName} ${walkIn.lastName}`}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résumé final si émargement commencé */}
      {(presentCount > 0 || absentCount > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-600 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Présents ({presentCount}/{totalParticipants})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {presentCount === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun participant marqué présent</p>
              ) : (
                <div className="space-y-2">
                  {attendedReservations.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {r.user.clientProfile?.firstName} {r.user.clientProfile?.lastName}
                      </span>
                      {r.attendedAt && (
                        <span className="text-muted-foreground">
                          {format(r.attendedAt, "HH:mm")}
                        </span>
                      )}
                    </div>
                  ))}
                  {attendedWalkIns.map((w) => (
                    <div key={w.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {w.firstName} {w.lastName}
                      </span>
                      {w.attendedAt && (
                        <span className="text-muted-foreground">
                          {format(w.attendedAt, "HH:mm")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-600 flex items-center gap-2">
                <X className="h-5 w-5" />
                Absents ({absentCount}/{totalParticipants})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {absentCount === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun absent</p>
              ) : (
                <div className="space-y-2">
                  {noShowReservations.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {r.user.clientProfile?.firstName} {r.user.clientProfile?.lastName}
                      </span>
                    </div>
                  ))}
                  {noShowWalkIns.map((w) => (
                    <div key={w.id} className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {w.firstName} {w.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
