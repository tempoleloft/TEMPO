"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Users, Download } from "lucide-react"

type Teacher = {
  id: string
  displayName: string
}

type Session = {
  id: string
  startAt: Date
  endAt: Date
  classType: { title: string }
  _count: { reservations: number }
}

type TeacherWithSessions = Teacher & {
  sessions: Session[]
}

type Props = {
  teachers: TeacherWithSessions[]
}

export function TeacherStats({ teachers }: Props) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId)

  // Filter sessions by selected month
  const filteredSessions = selectedTeacher?.sessions.filter((session) => {
    const sessionDate = new Date(session.startAt)
    const sessionMonth = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, "0")}`
    return sessionMonth === selectedMonth
  }) || []

  // Sort by date descending
  const sortedSessions = [...filteredSessions].sort(
    (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
  )

  // Calculate totals
  const totalSessions = sortedSessions.length
  const totalParticipants = sortedSessions.reduce(
    (sum, s) => sum + s._count.reservations,
    0
  )

  // Generate month options (last 12 months)
  const monthOptions = []
  for (let i = 0; i < 12; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const label = format(date, "MMMM yyyy", { locale: fr })
    monthOptions.push({ value, label })
  }

  // Export function
  const handleExport = () => {
    if (!selectedTeacher || sortedSessions.length === 0) return

    const headers = ["Date", "Heure", "Cours", "Participants"]
    const rows = sortedSessions.map((session) => [
      format(new Date(session.startAt), "dd/MM/yyyy"),
      format(new Date(session.startAt), "HH:mm") + " - " + format(new Date(session.endAt), "HH:mm"),
      session.classType.title,
      session._count.reservations.toString(),
    ])

    // Add totals row
    rows.push(["", "", "TOTAL", totalParticipants.toString()])
    rows.push(["", "", "Nombre de cours", totalSessions.toString()])

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.join(";")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${selectedTeacher.displayName}_${selectedMonth}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Statistiques Professeurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Professeur</label>
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un professeur" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <label className="text-sm font-medium mb-2 block">Mois</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTeacher && sortedSessions.length > 0 && (
            <div className="sm:self-end">
              <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        {selectedTeacher ? (
          <>
            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-tempo-taupe/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-tempo-bordeaux">{totalSessions}</div>
                <div className="text-sm text-muted-foreground">cours donnés</div>
              </div>
              <div className="bg-tempo-taupe/20 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-tempo-bordeaux">{totalParticipants}</div>
                <div className="text-sm text-muted-foreground">participants total</div>
              </div>
            </div>

            {/* Sessions table */}
            {sortedSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun cours sur cette période
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Horaire</th>
                      <th className="pb-3 font-medium">Cours</th>
                      <th className="pb-3 font-medium text-center">Participants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sortedSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-muted/50">
                        <td className="py-3 text-sm">
                          {format(new Date(session.startAt), "EEEE d MMMM", { locale: fr })}
                        </td>
                        <td className="py-3 text-sm">
                          {format(new Date(session.startAt), "HH:mm")} - {format(new Date(session.endAt), "HH:mm")}
                        </td>
                        <td className="py-3 text-sm font-medium">
                          {session.classType.title}
                        </td>
                        <td className="py-3 text-center">
                          <Badge variant={session._count.reservations > 0 ? "default" : "secondary"}>
                            <Users className="h-3 w-3 mr-1" />
                            {session._count.reservations}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Sélectionnez un professeur pour voir ses statistiques
          </div>
        )}
      </CardContent>
    </Card>
  )
}
