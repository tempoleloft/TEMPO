import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { startOfMonth, endOfMonth } from "date-fns"
import { User, Calendar, Plus, EyeOff } from "lucide-react"
import Link from "next/link"
import { TeacherActions } from "@/components/admin/teacher-actions"

export default async function AdminProfsPage() {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const teachers = await db.teacherProfile.findMany({
    include: {
      user: true,
      _count: {
        select: {
          sessions: true,
        },
      },
    },
    orderBy: [
      { isActive: "desc" },
      { displayName: "asc" },
    ],
  })

  // Count sessions this month separately
  const teachersWithMonthCount = await Promise.all(
    teachers.map(async (teacher) => {
      const monthSessions = await db.session.count({
        where: {
          teacherId: teacher.id,
          startAt: { gte: monthStart, lte: monthEnd },
          status: "SCHEDULED",
        },
      })
      return { ...teacher, monthSessions }
    })
  )
  
  const activeTeachers = teachersWithMonthCount.filter(t => t.isActive)
  const hiddenTeachers = teachersWithMonthCount.filter(t => !t.isActive)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tempo-bordeaux">Professeurs</h1>
          <p className="text-muted-foreground mt-1">
            {activeTeachers.length} professeur{activeTeachers.length > 1 ? "s" : ""} actif{activeTeachers.length > 1 ? "s" : ""}
            {hiddenTeachers.length > 0 && (
              <span className="text-tempo-noir/40"> • {hiddenTeachers.length} masqué{hiddenTeachers.length > 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
        <Button asChild className="bg-tempo-bordeaux hover:bg-tempo-noir">
          <Link href="/admin/profs/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un professeur
          </Link>
        </Button>
      </div>

      {/* Active Teachers Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {activeTeachers.map((teacher) => (
          <Card key={teacher.id} className="hover:shadow-md transition-shadow">
            <Link href={`/admin/profs/${teacher.id}`} className="block">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-tempo-taupe/30 flex items-center justify-center shrink-0">
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
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-tempo-bordeaux hover:underline">
                      {teacher.displayName}
                    </CardTitle>
                    <CardDescription className="mt-1 truncate">
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
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{teacher.monthSessions} cours ce mois</span>
                </div>
                {teacher.bio && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {teacher.bio}
                  </p>
                )}
              </CardContent>
            </Link>
            <div className="px-6 pb-4 flex justify-end">
              <TeacherActions 
                teacherId={teacher.id}
                teacherName={teacher.displayName}
                isActive={teacher.isActive}
                sessionsCount={teacher._count.sessions}
              />
            </div>
          </Card>
        ))}
      </div>

      {activeTeachers.length === 0 && hiddenTeachers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun professeur enregistré</p>
        </div>
      )}

      {/* Hidden Teachers Section */}
      {hiddenTeachers.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-tempo-noir/50 mb-4 flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            Professeurs masqués
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {hiddenTeachers.map((teacher) => (
              <Card key={teacher.id} className="opacity-60 border-dashed hover:opacity-80 transition-opacity">
                <Link href={`/admin/profs/${teacher.id}`} className="block">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-tempo-taupe/20 flex items-center justify-center relative shrink-0">
                        {teacher.photoUrl ? (
                          <img
                            src={teacher.photoUrl}
                            alt={teacher.displayName}
                            className="w-full h-full rounded-full object-cover grayscale"
                          />
                        ) : (
                          <User className="h-8 w-8 text-tempo-noir/30" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-full">
                          <EyeOff className="h-6 w-6 text-tempo-noir/40" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-tempo-noir/60 hover:underline">
                          {teacher.displayName}
                        </CardTitle>
                        <CardDescription className="mt-1 truncate">
                          {teacher.user.email}
                        </CardDescription>
                        <Badge variant="outline" className="mt-2 text-xs">
                          Masqué
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Link>
                <div className="px-6 pb-4 flex justify-end">
                  <TeacherActions 
                    teacherId={teacher.id}
                    teacherName={teacher.displayName}
                    isActive={teacher.isActive}
                    sessionsCount={teacher._count.sessions}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
