import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, MapPin, Users, ArrowLeft, UserPlus, Check, X, ClipboardList } from "lucide-react"
import Link from "next/link"
import { AttendanceButtons } from "@/components/admin/attendance-buttons"
import { WalkInAttendanceButtons } from "@/components/admin/walkin-attendance-buttons"

interface PageProps {
  params: { id: string }
}

export default async function TeacherSessionPage({ params }: PageProps) {
  const authSession = await auth()
  
  if (!authSession?.user) {
    redirect("/login")
  }

  const teacherProfile = await db.teacherProfile.findUnique({
    where: { userId: authSession.user.id },
  })

  if (!teacherProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profil professeur non trouvé</p>
      </div>
    )
  }

  const classSession = await db.session.findUnique({
    where: { id: params.id },
    include: {
      classType: true,
      teacher: true,
      reservations: {
        where: { status: { in: ["BOOKED", "ATTENDED", "NO_SHOW"] } },
        include: {
          user: {
            include: {
              clientProfile: true,
            },
          },
          guestReservations: true,
        },
        orderBy: { bookedAt: "asc" },
      },
      walkInParticipants: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!classSession) {
    notFound()
  }

  if (classSession.teacherId !== teacherProfile.id) {
    redirect("/teacher")
  }

  const guestCount = classSession.reservations.reduce(
    (acc, r) => acc + (r.guestReservations?.length || 0),
    0
  )
  const walkInCount = classSession.walkInParticipants?.length || 0
  const totalParticipants = classSession.reservations.length + guestCount + walkInCount

  const bookedCount =
    classSession.reservations.filter((r) => r.status === "BOOKED").length +
    classSession.walkInParticipants.filter((w) => w.status === "BOOKED").length
  const presentCount =
    classSession.reservations.filter((r) => r.status === "ATTENDED").length +
    classSession.walkInParticipants.filter((w) => w.status === "ATTENDED").length
  const absentCount =
    classSession.reservations.filter((r) => r.status === "NO_SHOW").length +
    classSession.walkInParticipants.filter((w) => w.status === "NO_SHOW").length

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sessionDate = new Date(classSession.startAt)
  sessionDate.setHours(0, 0, 0, 0)
  const isPastOrToday = sessionDate <= today

  const sourceLabels: Record<string, string> = {
    CLASSPASS: "ClassPass",
    GYMLIB: "Gymlib",
    LASTSPOT: "Lastspot",
    WALK_IN: "Walk-in",
    INSTAGRAM: "Instagram",
    WORD_OF_MOUTH: "Bouche à oreille",
    OTHER: "Autre",
  }

  const statusColors = {
    BOOKED: "bg-tempo-taupe/10",
    ATTENDED: "bg-green-50 border-l-4 border-green-500",
    NO_SHOW: "bg-red-50 border-l-4 border-red-500",
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/teacher/planning">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-tempo-bordeaux">
            {classSession.classType.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(classSession.startAt, "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-tempo-bordeaux" />
              <div>
                <p className="text-sm text-muted-foreground">Horaire</p>
                <p className="font-semibold">
                  {format(classSession.startAt, "HH:mm")} - {format(classSession.endAt, "HH:mm")}
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
                <p className="font-semibold">{classSession.location || "Salle principale"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-tempo-bordeaux" />
              <div>
                <p className="text-sm text-muted-foreground">Inscrits</p>
                <p className="font-semibold">
                  {totalParticipants}/{classSession.capacity}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-tempo-bordeaux" />
            Émargement
          </CardTitle>
          <CardDescription>
            {isPastOrToday
              ? "Cliquez sur Présent ou No-show pour chaque participant"
              : "L'émargement sera disponible le jour du cours"}
            {walkInCount > 0 && (
              <span className="ml-2 text-purple-600">
                (dont {walkInCount} ajout{walkInCount > 1 ? "s" : ""} manuel{walkInCount > 1 ? "s" : ""})
              </span>
            )}
          </CardDescription>

          {totalParticipants > 0 && (
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <span>En attente: {bookedCount}</span>
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
        </CardHeader>
        <CardContent>
          {totalParticipants === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun élève inscrit pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classSession.reservations.map((reservation, index) => (
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
                        : "bg-tempo-bordeaux text-tempo-creme"
                    }`}>
                      {reservation.status === "ATTENDED" ? (
                        <Check className="h-4 w-4" />
                      ) : reservation.status === "NO_SHOW" ? (
                        <X className="h-4 w-4" />
                      ) : (
                        index + 1
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
                      <p className="text-sm text-muted-foreground">
                        Inscrit le {format(reservation.bookedAt, "d MMM à HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>

                  {isPastOrToday ? (
                    <AttendanceButtons
                      reservationId={reservation.id}
                      currentStatus={reservation.status as "BOOKED" | "ATTENDED" | "NO_SHOW"}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-200" disabled>
                        <Check className="h-4 w-4 mr-1" />
                        Présent
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200" disabled>
                        <X className="h-4 w-4 mr-1" />
                        No-show
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {classSession.walkInParticipants?.map((walkIn) => (
                <div
                  key={walkIn.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    walkIn.status === "ATTENDED"
                      ? "bg-green-50 border-l-4 border-green-500"
                      : walkIn.status === "NO_SHOW"
                      ? "bg-red-50 border-l-4 border-red-500"
                      : "bg-purple-50 border-l-4 border-purple-400"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
                      <p className="text-sm text-muted-foreground">
                        Ajouté manuellement
                      </p>
                    </div>
                  </div>

                  {isPastOrToday ? (
                    <WalkInAttendanceButtons
                      walkInId={walkIn.id}
                      currentStatus={walkIn.status as "BOOKED" | "ATTENDED" | "NO_SHOW"}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-200" disabled>
                        <Check className="h-4 w-4 mr-1" />
                        Présent
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200" disabled>
                        <X className="h-4 w-4 mr-1" />
                        No-show
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
