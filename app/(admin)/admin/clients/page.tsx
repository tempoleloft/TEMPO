import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Search, User, Eye, Ban } from "lucide-react"
import Link from "next/link"

interface PageProps {
  searchParams: { q?: string }
}

export default async function AdminClientsPage({ searchParams }: PageProps) {
  const query = searchParams.q || ""

  const clients = await db.user.findMany({
    where: {
      role: "CLIENT",
      OR: query ? [
        { email: { contains: query, mode: "insensitive" } },
        { clientProfile: { firstName: { contains: query, mode: "insensitive" } } },
        { clientProfile: { lastName: { contains: query, mode: "insensitive" } } },
      ] : undefined,
    },
    include: {
      clientProfile: true,
      wallet: true,
      reservations: true,
      purchases: {
        where: { status: "PAID" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const totalClients = clients.length
  const blacklistedCount = clients.filter(c => c.isBlacklisted).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-tempo-bordeaux">Clients</h1>
        <p className="text-muted-foreground mt-1">
          {totalClients} client{totalClients > 1 ? "s" : ""} enregistré{totalClients > 1 ? "s" : ""}
          {blacklistedCount > 0 && (
            <span className="text-red-600 ml-2">
              ({blacklistedCount} blacklisté{blacklistedCount > 1 ? "s" : ""})
            </span>
          )}
        </p>
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
                            {client.clientProfile?.firstName?.charAt(0) || "?"}
                            {client.clientProfile?.lastName?.charAt(0) || ""}
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
                        {client.reservations.length}
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
        </CardContent>
      </Card>
    </div>
  )
}
