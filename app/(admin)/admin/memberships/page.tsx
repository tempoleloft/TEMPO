import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Crown, Plus, Users, CreditCard, Calendar, Download } from "lucide-react"
import Link from "next/link"
import { CreateMembershipPlanDialog } from "@/components/admin/create-membership-plan-dialog"
import { MembershipPlanCard } from "@/components/admin/membership-plan-card"
import { ExportMembersButton } from "@/components/admin/export-members-button"

export const dynamic = 'force-dynamic'

export default async function AdminMembershipsPage() {
  const session = await auth()
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const [plans, memberships, stats] = await Promise.all([
    db.membershipPlan.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { memberships: { where: { status: "ACTIVE" } } }
        }
      }
    }),
    db.membership.findMany({
      include: {
        user: {
          include: {
            clientProfile: true,
          }
        },
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    // Stats
    Promise.all([
      db.membership.count({ where: { status: "ACTIVE" } }),
      db.membership.count({ where: { status: "CANCELLED", cancelAtPeriodEnd: true } }),
      db.membership.aggregate({
        where: { status: "ACTIVE" },
        _sum: { totalCreditsGranted: true }
      }),
    ])
  ])

  const [activeCount, cancellingCount, creditsStats] = stats
  const totalCreditsGranted = creditsStats._sum.totalCreditsGranted || 0

  const activeMemberships = memberships.filter(m => m.status === "ACTIVE")
  const cancelledMemberships = memberships.filter(m => m.status === "CANCELLED" || m.status === "EXPIRED")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-tempo-bordeaux flex items-center gap-2">
            <Crown className="h-8 w-8" />
            Memberships
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos abonnements et vos membres
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-tempo-bordeaux" />
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Membres actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{cancellingCount}</p>
                <p className="text-sm text-muted-foreground">Fin à venir</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalCreditsGranted}</p>
                <p className="text-sm text-muted-foreground">Crédits distribués</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{plans.filter(p => p.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Formules actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Formules d'abonnement</TabsTrigger>
          <TabsTrigger value="members">Membres ({memberships.length})</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-end">
            <CreateMembershipPlanDialog />
          </div>

          {plans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Aucune formule créée</h3>
                <p className="text-muted-foreground mb-4">
                  Créez votre première formule d'abonnement pour commencer à recruter des membres.
                </p>
                <CreateMembershipPlanDialog />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <MembershipPlanCard key={plan.id} plan={plan} membersCount={plan._count.memberships} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="flex justify-end">
            <ExportMembersButton />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liste des membres</CardTitle>
              <CardDescription>
                {activeCount} membre{activeCount > 1 ? "s" : ""} actif{activeCount > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {memberships.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun membre pour le moment</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Membre</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Formule</th>
                        <th className="pb-3 font-medium">Adhésion</th>
                        <th className="pb-3 font-medium">Fin engagement</th>
                        <th className="pb-3 font-medium">Renouvellement</th>
                        <th className="pb-3 font-medium text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {memberships.map((membership) => (
                        <tr key={membership.id} className="hover:bg-muted/50">
                          <td className="py-3">
                            <Link 
                              href={`/admin/clients/${membership.userId}`}
                              className="font-medium hover:text-tempo-bordeaux"
                            >
                              {membership.user.clientProfile?.firstName} {membership.user.clientProfile?.lastName}
                            </Link>
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">
                            {membership.user.email}
                          </td>
                          <td className="py-3">
                            <Badge variant="outline">{membership.plan.name}</Badge>
                          </td>
                          <td className="py-3 text-sm">
                            {format(membership.startDate, "d MMM yyyy", { locale: fr })}
                          </td>
                          <td className="py-3 text-sm">
                            {format(membership.commitmentEndDate, "d MMM yyyy", { locale: fr })}
                          </td>
                          <td className="py-3 text-sm">
                            {membership.plan.renewalType === "AUTO" ? (
                              membership.cancelAtPeriodEnd ? (
                                <span className="text-amber-600">Annulé le {format(membership.currentPeriodEnd, "d MMM", { locale: fr })}</span>
                              ) : (
                                format(membership.currentPeriodEnd, "d MMM yyyy", { locale: fr })
                              )
                            ) : (
                              <span className="text-muted-foreground">Durée fixe</span>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            {membership.status === "ACTIVE" ? (
                              membership.cancelAtPeriodEnd ? (
                                <Badge variant="outline" className="text-amber-600 border-amber-300">
                                  Fin prévue
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-green-600 border-green-300">
                                  Actif
                                </Badge>
                              )
                            ) : membership.status === "CANCELLED" ? (
                              <Badge variant="outline" className="text-red-600 border-red-300">
                                Annulé
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Expiré</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
