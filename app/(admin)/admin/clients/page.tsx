import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Search, User, Eye, Ban, Download, ChevronLeft, ChevronRight, Crown } from "lucide-react"
import Link from "next/link"
import { CreateClientDialog } from "@/components/admin/create-client-dialog"
import { ExportClientsButton } from "@/components/admin/export-clients-button"

interface PageProps {
  searchParams: { q?: string; page?: string }
}

const CLIENTS_PER_PAGE = 50

export default async function AdminClientsPage({ searchParams }: PageProps) {
  const query = searchParams.q || ""
  const currentPage = parseInt(searchParams.page || "1")
  const skip = (currentPage - 1) * CLIENTS_PER_PAGE

  const whereClause = {
    role: "CLIENT" as const,
    OR: query ? [
      { email: { contains: query, mode: "insensitive" as const } },
      { clientProfile: { firstName: { contains: query, mode: "insensitive" as const } } },
      { clientProfile: { lastName: { contains: query, mode: "insensitive" as const } } },
    ] : undefined,
  }

  const [clients, totalClients, blacklistedCount, membersCount] = await Promise.all([
    db.user.findMany({
      where: whereClause,
      include: {
        clientProfile: true,
        wallet: true,
        memberships: {
          where: { status: "ACTIVE" },
          take: 1,
          include: { plan: true },
        },
        _count: {
          select: {
            reservations: true,
            purchases: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: CLIENTS_PER_PAGE,
    }),
    db.user.count({ where: whereClause }),
    db.user.count({ where: { ...whereClause, isBlacklisted: true } }),
    db.membership.count({ where: { status: "ACTIVE" } }),
  ])

  const totalPages = Math.ceil(totalClients / CLIENTS_PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-tempo-bordeaux">Clients</h1>
          <p className="text-muted-foreground mt-1">
            {totalClients} client{totalClients > 1 ? "s" : ""} enregistré{totalClients > 1 ? "s" : ""}
            {membersCount > 0 && (
              <span className="text-purple-600 ml-2">
                • {membersCount} membre{membersCount > 1 ? "s" : ""}
              </span>
            )}
            {blacklistedCount > 0 && (
              <span className="text-red-600 ml-2">
                • {blacklistedCount} blacklisté{blacklistedCount > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportClientsButton />
          <CreateClientDialog />
        </div>
      </div>

      {/* Search */}
      <form className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Rechercher par nom ou email..."
            defaultValue={query}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="outline">Rechercher</Button>
          {query && (
            <Button asChild variant="ghost">
              <Link href="/admin/clients">Effacer</Link>
            </Button>
          )}
        </div>
      </form>

      {/* Clients List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Liste des clients</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun client trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium text-center hidden sm:table-cell">Crédits</th>
                    <th className="pb-3 font-medium text-center hidden md:table-cell">Réservations</th>
                    <th className="pb-3 font-medium text-center hidden md:table-cell">Membre</th>
                    <th className="pb-3 font-medium hidden lg:table-cell">Inscrit le</th>
                    <th className="pb-3 font-medium text-center">Statut</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clients.map((client) => (
                    <tr 
                      key={client.id}
                      className={`hover:bg-muted/50 ${client.isBlacklisted ? "bg-red-50" : ""}`}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                            client.isBlacklisted 
                              ? "bg-red-100 text-red-700" 
                              : "bg-tempo-bordeaux text-tempo-creme"
                          }`}>
                            {client.clientProfile?.firstName?.charAt(0)?.toUpperCase() || 
                             client.name?.split(" ")[0]?.charAt(0)?.toUpperCase() || "?"}
                            {client.clientProfile?.lastName?.charAt(0)?.toUpperCase() || 
                             client.name?.split(" ")[1]?.charAt(0)?.toUpperCase() || ""}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {client.clientProfile?.firstName || ""} {client.clientProfile?.lastName || ""}
                              {!client.clientProfile?.firstName && client.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {client.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center hidden sm:table-cell">
                        <Badge variant="secondary">
                          {client.wallet?.creditsBalance || 0}
                        </Badge>
                      </td>
                      <td className="py-3 text-center hidden md:table-cell">
                        {client._count.reservations}
                      </td>
                      <td className="py-3 text-center hidden md:table-cell">
                        {client.memberships && client.memberships.length > 0 ? (
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                            <Crown className="h-3 w-3 mr-1" />
                            {client.memberships[0].plan.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground hidden lg:table-cell">
                        {format(client.createdAt, "d MMM yyyy", { locale: fr })}
                      </td>
                      <td className="py-3 text-center">
                        {client.isBlacklisted ? (
                          <Badge variant="destructive" className="text-xs">
                            <Ban className="h-3 w-3 mr-1" />
                            Blacklisté
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                            Actif
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/clients/${client.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages} ({totalClients} clients)
              </p>
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                >
                  <Link href={`/admin/clients?page=${currentPage - 1}${query ? `&q=${query}` : ""}`}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                >
                  <Link href={`/admin/clients?page=${currentPage + 1}${query ? `&q=${query}` : ""}`}>
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
