import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, MapPin, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: { id: string }
}

export default async function TeacherSessionPage({ params }: PageProps) {
  const authSession = await auth()
  
  if (!authSession?.user) {
    redirect("/login")
  }

  // Get teacher profile
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
        where: { status: "BOOKED" },
        include: {
          user: {
            include: {
              clientProfile: true,
            },
          },
        },
        orderBy: { bookedAt: "asc" },
      },
    },
  })

  if (!classSession) {
    notFound()
  }

  // Check if this teacher owns this session
  if (classSession.teacherId !== teacherProfile.id) {
    redirect("/teacher")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Session Info */}
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
                  {classSession.reservations.length}/{classSession.capacity}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des élèves</CardTitle>
          <CardDescription>
            {classSession.reservations.length} participant{classSession.reservations.length > 1 ? "s" : ""} inscrit{classSession.reservations.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classSession.reservations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun élève inscrit pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classSession.reservations.map((reservation, index) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-tempo-taupe/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-tempo-bordeaux text-tempo-creme flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {reservation.user.clientProfile?.firstName}{" "}
                        {reservation.user.clientProfile?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Inscrit le {format(reservation.bookedAt, "d MMM à HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
