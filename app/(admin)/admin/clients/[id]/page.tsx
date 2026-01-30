import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { 
  User, Mail, Phone, Calendar, CreditCard, 
  ShoppingBag, Clock, Ban, ArrowLeft 
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ClientActions } from "@/components/admin/client-actions"
import { AdjustCreditsForm } from "@/components/admin/adjust-credits-form"

interface PageProps {
  params: { id: string }
}

export default async function AdminClientDetailPage({ params }: PageProps) {
  const session = await auth()
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const client = await db.user.findUnique({
    where: { id: params.id },
    include: {
      clientProfile: true,
      wallet: true,
      reservations: {
        include: {
          session: {
            include: {
              classType: true,
              teacher: true,
            },
          },
        },
        orderBy: { bookedAt: "desc" },
        take: 20,
      },
      purchases: {
        include: {
          product: true,
        },
        orderBy: { createdAt: "desc" },
      },
      creditLedger: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!client) {
    notFound()
  }

  const fullName = client.clientProfile 
    ? `${client.clientProfile.firstName} ${client.clientProfile.lastName}`
    : client.name || client.email

  const totalSpent = client.purchases
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + p.amountCents, 0) / 100

  const attendedCount = client.reservations.filter(r => r.status === "ATTENDED").length
  const noShowCount = client.reservations.filter(r => r.status === "NO_SHOW").length

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/clients">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>
        </Button>
      </div>

      {/* Client Info Card */}
      <Card className={client.isBlacklisted ? "border-red-300 bg-red-50" : ""}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                client.isBlacklisted 
                  ? "bg-red-200 text-red-700" 
                  : "bg-tempo-bordeaux text-tempo-creme"
              }`}>
                {client.clientProfile?.firstName?.charAt(0) || "?"}
                {client.clientProfile?.lastName?.charAt(0) || ""}
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {fullName}
                  {client.isBlacklisted && (
                    <Badge variant="destructive">
                      <Ban className="h-3 w-3 mr-1" />
                      Blacklisté
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-base">
                  Client depuis {format(client.createdAt, "MMMM yyyy", { locale: fr })}
                </CardDescription>
              </div>
            </div>
            
            {/* Actions */}
            <ClientActions 
              userId={client.id} 
              isBlacklisted={client.isBlacklisted}
              hasActiveReservations={client.reservations.some(r => r.status === "BOOKED")}
            />
          </div>
        </CardHeader>
        <CardContent>
          {client.isBlacklisted && client.blacklistReason && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              <strong>Raison du blacklist :</strong> {client.blacklistReason}
              <br />
              <span className="text-xs opacity-70">
                Blacklisté le {format(client.blacklistedAt!, "d MMM yyyy à HH:mm", { locale: fr })}
              </span>
            </div>
          )}
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Téléphone</p>
                <p className="text-sm font-medium">
                  {client.clientProfile?.phone || "Non renseigné"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Crédits</p>
                <p className="text-sm font-medium">{client.wallet?.creditsBalance || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total dépensé</p>
                <p className="text-sm font-medium">{totalSpent.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-tempo-bordeaux">
                {client.reservations.length}
              </p>
              <p className="text-sm text-muted-foreground">Réservations totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{attendedCount}</p>
              <p className="text-sm text-muted-foreground">Présences</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{noShowCount}</p>
              <p className="text-sm text-muted-foreground">No-shows</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Credit Adjustment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Ajuster les crédits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdjustCreditsForm 
              userId={client.id} 
              currentBalance={client.wallet?.creditsBalance || 0}
            />
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Achats récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.purchases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun achat
              </p>
            ) : (
              <div className="space-y-3">
                {client.purchases.slice(0, 5).map((purchase) => (
                  <div 
                    key={purchase.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{purchase.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(purchase.createdAt, "d MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {(purchase.amountCents / 100).toFixed(2)} €
                      </p>
                      <Badge 
                        variant={purchase.status === "PAID" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {purchase.status === "PAID" ? "Payé" : purchase.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reservations History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique des réservations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {client.reservations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune réservation
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Cours</th>
                    <th className="pb-2 font-medium hidden sm:table-cell">Professeur</th>
                    <th className="pb-2 font-medium text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {client.reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-muted/50">
                      <td className="py-2">
                        <p className="font-medium">
                          {format(reservation.session.startAt, "d MMM yyyy", { locale: fr })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(reservation.session.startAt, "HH:mm", { locale: fr })}
                        </p>
                      </td>
                      <td className="py-2">
                        {reservation.session.classType.title}
                      </td>
                      <td className="py-2 hidden sm:table-cell">
                        {reservation.session.teacher.displayName}
                      </td>
                      <td className="py-2 text-center">
                        <Badge 
                          variant={
                            reservation.status === "ATTENDED" ? "default" :
                            reservation.status === "NO_SHOW" ? "destructive" :
                            reservation.status === "CANCELLED" ? "secondary" :
                            "outline"
                          }
                          className="text-xs"
                        >
                          {reservation.status === "BOOKED" && "Réservé"}
                          {reservation.status === "ATTENDED" && "Présent"}
                          {reservation.status === "NO_SHOW" && "Absent"}
                          {reservation.status === "CANCELLED" && "Annulé"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historique des crédits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {client.creditLedger.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun mouvement
            </p>
          ) : (
            <div className="space-y-2">
              {client.creditLedger.map((entry) => (
                <div 
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {entry.reason === "PURCHASE" && "Achat"}
                      {entry.reason === "BOOKING" && "Réservation"}
                      {entry.reason === "CANCEL_REFUND" && "Remboursement annulation"}
                      {entry.reason === "ADMIN_ADJUST" && "Ajustement admin"}
                      {entry.reason === "EXPIRATION" && "Expiration"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(entry.createdAt, "d MMM yyyy HH:mm", { locale: fr })}
                      {entry.notes && ` • ${entry.notes}`}
                    </p>
                  </div>
                  <span className={`font-bold ${entry.delta >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {entry.delta >= 0 ? "+" : ""}{entry.delta}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
