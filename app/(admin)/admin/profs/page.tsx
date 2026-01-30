import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { fr } from "date-fns/locale"
import { User, Calendar, Plus } from "lucide-react"
import Link from "next/link"

export default async function AdminProfsPage() {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const teachers = await db.teacherProfile.findMany({
    include: {
      user: true,
      sessions: {
        where: {
          startAt: { gte: monthStart, lte: monthEnd },
          status: "SCHEDULED",
        },
      },
    },
    orderBy: { displayName: "asc" },
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tempo-bordeaux">Professeurs</h1>
          <p className="text-muted-foreground mt-1">
            {teachers.length} professeur{teachers.length > 1 ? "s" : ""} actif{teachers.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild className="bg-tempo-bordeaux hover:bg-tempo-noir">
          <Link href="/admin/profs/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un professeur
          </Link>
        </Button>
      </div>

      {/* Teachers Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {teachers.map((teacher) => (
          <Card key={teacher.id}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-tempo-taupe/30 flex items-center justify-center">
                  {teacher.photoUrl ? (
                    <img
                      src={teacher.photoUrl}
                      alt={teacher.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-tempo-bordeaux/50" />
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle>{teacher.displayName}</CardTitle>
                  <CardDescription className="mt-1">
                    {teacher.user.email}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {teacher.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {teacher.sessions.length} cours ce mois
                  </span>
                </div>
              </div>
              
              {teacher.bio && (
                <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                  {teacher.bio}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {teachers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun professeur enregistré</p>
        </div>
      )}
    </div>
  )
}
