import { redirect } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, TrendingUp, Calendar, UserCheck, ExternalLink } from "lucide-react"

export default async function WalkInsPage({
  searchParams,
}: {
  searchParams: { search?: string; view?: string }
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const search = searchParams.search || ""
  const view = searchParams.view || "all"

  const walkIns = await db.walkInParticipant.findMany({
    where: {
      status: { not: "CANCELLED" },
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      session: {
        include: {
          classType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  })

  // Stats by source
  const sourceStats = walkIns.reduce(
    (acc, w) => {
      acc[w.source] = (acc[w.source] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Group by unique person for client-centric view
  const clientMap = new Map<string, {
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    visits: Array<{
      id: string
      sessionId: string
      sessionTitle: string
      sessionDate: Date
      source: string
      status: string
      numeroReservation: string | null
    }>
    sources: Set<string>
    firstVisit: Date
    lastVisit: Date
  }>()

  walkIns.forEach((w) => {
    const key = `${w.firstName.toLowerCase().trim()}-${w.lastName.toLowerCase().trim()}-${w.email?.toLowerCase().trim() || "no-email"}`
    
    if (!clientMap.has(key)) {
      clientMap.set(key, {
        firstName: w.firstName,
        lastName: w.lastName,
        email: w.email,
        phone: w.phone,
        visits: [],
        sources: new Set(),
        firstVisit: w.session.startAt,
        lastVisit: w.session.startAt,
      })
    }
    
    const client = clientMap.get(key)!
    client.visits.push({
      id: w.id,
      sessionId: w.sessionId,
      sessionTitle: w.session.classType?.title || "Cours",
      sessionDate: w.session.startAt,
      source: w.source,
      status: w.status,
      numeroReservation: w.numeroReservation,
    })
    client.sources.add(w.source)
    if (w.phone && !client.phone) client.phone = w.phone
    if (w.email && !client.email) client.email = w.email
    if (w.session.startAt < client.firstVisit) client.firstVisit = w.session.startAt
    if (w.session.startAt > client.lastVisit) client.lastVisit = w.session.startAt
  })

  // Convert to array and sort by visit count
  const clients = Array.from(clientMap.values()).sort((a, b) => b.visits.length - a.visits.length)
  
  // Stats
  const totalClients = clients.length
  const returningClients = clients.filter(c => c.visits.length > 1).length
  const avgVisitsPerClient = totalClients > 0 ? (walkIns.length / totalClients).toFixed(1) : "0"
  
  // This month's walk-ins
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)
  const thisMonthWalkIns = walkIns.filter(w => w.session.startAt >= thisMonth)

  const sourceLabels: Record<string, string> = {
    CLASSPASS: "ClassPass",
    GYMLIB: "Gymlib",
    LASTSPOT: "Lastspot",
    WALK_IN: "Walk-in",
    INSTAGRAM: "Instagram",
    WORD_OF_MOUTH: "Bouche à oreille",
    PARTNERSHIP: "Partenariat",
    EVENT: "Événement",
    OTHER: "Autre",
  }

  const sourceColors: Record<string, string> = {
    CLASSPASS: "bg-purple-100 text-purple-800 border-purple-200",
    GYMLIB: "bg-blue-100 text-blue-800 border-blue-200",
    LASTSPOT: "bg-orange-100 text-orange-800 border-orange-200",
    WALK_IN: "bg-green-100 text-green-800 border-green-200",
    INSTAGRAM: "bg-pink-100 text-pink-800 border-pink-200",
    WORD_OF_MOUTH: "bg-yellow-100 text-yellow-800 border-yellow-200",
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <DashboardNav role="ADMIN" userName={session.user.email || ""} />

      <main className="md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Ajouts manuels</h1>
            <p className="text-muted-foreground">
              Suivi des participants via ClassPass, Gymlib et autres plateformes
            </p>
          </div>

          {/* Stats principales */}
          <div className="grid gap-4 md:grid-cols-5 mb-8">
            <Card className="bg-gradient-to-br from-tempo-bordeaux to-tempo-bordeaux/80 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{walkIns.length}</div>
                <p className="text-xs opacity-75 mt-1">{thisMonthWalkIns.length} ce mois-ci</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Clients uniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground mt-1">{returningClients} récurrents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Moy. visites/client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgVisitsPerClient}</div>
                <p className="text-xs text-muted-foreground mt-1">visites en moyenne</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                  ClassPass
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700">{sourceStats["CLASSPASS"] || 0}</div>
                <p className="text-xs text-purple-600 mt-1">
                  {((sourceStats["CLASSPASS"] || 0) / walkIns.length * 100).toFixed(0)}% du total
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  Gymlib
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">{sourceStats["GYMLIB"] || 0}</div>
                <p className="text-xs text-blue-600 mt-1">
                  {((sourceStats["GYMLIB"] || 0) / walkIns.length * 100).toFixed(0)}% du total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats par plateforme */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Répartition par plateforme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(sourceStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([source, count]) => (
                    <div
                      key={source}
                      className={`px-4 py-2 rounded-lg border ${sourceColors[source] || "bg-gray-100 text-gray-800 border-gray-200"}`}
                    >
                      <span className="font-semibold">{sourceLabels[source] || source}</span>
                      <span className="ml-2 opacity-75">{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <form method="GET" className="flex gap-4">
                <input type="hidden" name="view" value={view} />
                <Input
                  name="search"
                  placeholder="Rechercher par nom, prénom ou email..."
                  defaultValue={search}
                  className="max-w-md"
                />
                <Button type="submit" className="bg-tempo-bordeaux hover:bg-tempo-bordeaux/90">
                  Rechercher
                </Button>
                {search && (
                  <Button variant="outline" asChild>
                    <a href={`/admin/walk-ins?view=${view}`}>Effacer</a>
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Tabs pour les vues */}
          <Tabs defaultValue={view} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all" asChild>
                <a href={`/admin/walk-ins?view=all${search ? `&search=${search}` : ""}`}>
                  Toutes les réservations
                </a>
              </TabsTrigger>
              <TabsTrigger value="clients" asChild>
                <a href={`/admin/walk-ins?view=clients${search ? `&search=${search}` : ""}`}>
                  Par client ({totalClients})
                </a>
              </TabsTrigger>
              <TabsTrigger value="recurring" asChild>
                <a href={`/admin/walk-ins?view=recurring${search ? `&search=${search}` : ""}`}>
                  Clients récurrents ({returningClients})
                </a>
              </TabsTrigger>
            </TabsList>

            {/* Vue toutes les réservations */}
            <TabsContent value="all">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Cours</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Visites</TableHead>
                        <TableHead>N° réservation</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {walkIns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Aucun participant trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        walkIns.slice(0, 100).map((walkIn) => {
                          const key = `${walkIn.firstName.toLowerCase().trim()}-${walkIn.lastName.toLowerCase().trim()}-${walkIn.email?.toLowerCase().trim() || "no-email"}`
                          const client = clientMap.get(key)
                          const visits = client?.visits.length || 1

                          return (
                            <TableRow key={walkIn.id}>
                              <TableCell className="font-medium">
                                {walkIn.firstName} {walkIn.lastName}
                              </TableCell>
                              <TableCell>{walkIn.session.classType?.title || "—"}</TableCell>
                              <TableCell className="text-sm">
                                {format(new Date(walkIn.session.startAt), "dd MMM yyyy", { locale: fr })}
                                <br />
                                <span className="text-muted-foreground">
                                  {format(new Date(walkIn.session.startAt), "HH:mm")}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={sourceColors[walkIn.source] || "bg-gray-100"}>
                                  {sourceLabels[walkIn.source] || walkIn.source}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                {walkIn.email || "—"}
                              </TableCell>
                              <TableCell>
                                {visits > 1 ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {visits} visites
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">1</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground font-mono">
                                {walkIn.numeroReservation
                                  ? walkIn.numeroReservation.substring(0, 10) + "..."
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/admin/session/${walkIn.sessionId}`}>
                                    <ExternalLink className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vue par client */}
            <TabsContent value="clients">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Email / Téléphone</TableHead>
                        <TableHead>Plateformes</TableHead>
                        <TableHead>Nb visites</TableHead>
                        <TableHead>Première visite</TableHead>
                        <TableHead>Dernière visite</TableHead>
                        <TableHead>Dernier cours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Aucun client trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        clients.map((client, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {client.firstName} {client.lastName}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="text-muted-foreground">{client.email || "—"}</div>
                              {client.phone && <div className="text-xs">{client.phone}</div>}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {Array.from(client.sources).map((source) => (
                                  <Badge key={source} variant="outline" className={`text-xs ${sourceColors[source] || ""}`}>
                                    {sourceLabels[source] || source}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={client.visits.length > 2 ? "default" : "outline"}
                                className={client.visits.length > 2 ? "bg-green-600" : ""}
                              >
                                {client.visits.length} visite{client.visits.length > 1 ? "s" : ""}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(client.firstVisit, "dd MMM yyyy", { locale: fr })}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(client.lastVisit, "dd MMM yyyy", { locale: fr })}
                            </TableCell>
                            <TableCell className="text-sm">
                              {client.visits[0]?.sessionTitle || "—"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vue clients récurrents */}
            <TabsContent value="recurring">
              <Card>
                <CardHeader>
                  <CardTitle>Clients récurrents</CardTitle>
                  <CardDescription>
                    Clients avec 2+ visites - potentiels futurs abonnés directs
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Plateformes</TableHead>
                        <TableHead>Nb visites</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead>Cours suivis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.filter(c => c.visits.length > 1).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Aucun client récurrent trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        clients
                          .filter((c) => c.visits.length > 1)
                          .map((client, index) => {
                            const uniqueCourses = [...new Set(client.visits.map(v => v.sessionTitle))]
                            return (
                              <TableRow key={index} className="bg-green-50/30">
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {client.firstName} {client.lastName}
                                    {client.visits.length >= 5 && (
                                      <Badge className="bg-yellow-500 text-white text-xs">VIP</Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                  <div>{client.email || "Pas d'email"}</div>
                                  {client.phone && <div className="text-muted-foreground">{client.phone}</div>}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {Array.from(client.sources).map((source) => (
                                      <Badge key={source} variant="outline" className={`text-xs ${sourceColors[source] || ""}`}>
                                        {sourceLabels[source] || source}
                                      </Badge>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-green-600 text-white">
                                    {client.visits.length} visites
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {format(client.firstVisit, "dd/MM/yy", { locale: fr })} → {format(client.lastVisit, "dd/MM/yy", { locale: fr })}
                                </TableCell>
                                <TableCell className="text-sm max-w-[200px]">
                                  {uniqueCourses.slice(0, 3).join(", ")}
                                  {uniqueCourses.length > 3 && ` +${uniqueCourses.length - 3}`}
                                </TableCell>
                              </TableRow>
                            )
                          })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
