import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Search, User, CreditCard, Calendar } from "lucide-react"
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
      reservations: {
        where: { status: "BOOKED" },
      },
      purchases: {
        where: { status: "PAID" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tempo-bordeaux">Clients</h1>
          <p className="text-muted-foreground mt-1">
            {clients.length} client{clients.length > 1 ? "s" : ""} enregistré{clients.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search */}
      <form className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Rechercher par nom ou email..."
            defaultValue={query}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">Rechercher</Button>
        {query && (
          <Button asChild variant="ghost">
            <Link href="/admin/clients">Effacer</Link>
          </Button>
        )}
      </form>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun client trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-tempo-taupe/10 hover:bg-tempo-taupe/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-tempo-bordeaux text-tempo-creme flex items-center justify-center font-semibold">
                      {client.clientProfile?.firstName?.charAt(0) || "?"}
                      {client.clientProfile?.lastName?.charAt(0) || ""}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {client.clientProfile?.firstName} {client.clientProfile?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {client.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Crédits</p>
                      <Badge variant="secondary" className="mt-1">
                        {client.wallet?.creditsBalance || 0}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Réservations</p>
                      <p className="font-semibold">{client.reservations.length}</p>
                    </div>
                    
                    <div className="text-right w-32">
                      <p className="text-xs text-muted-foreground">Inscrit le</p>
                      <p className="text-sm">
                        {format(client.createdAt, "d MMM yyyy", { locale: fr })}
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
