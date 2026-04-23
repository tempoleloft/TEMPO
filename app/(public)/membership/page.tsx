import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MembershipPlansSection } from "@/components/membership-plans-section"
import { Crown, Star, Sparkles, Check, Gift, Calendar, CreditCard, Users } from "lucide-react"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Membership | Club Premium - Tempo Le Loft",
  description: "Rejoignez le club premium Tempo Le Loft. Abonnements mensuels avec crédits automatiques et tarifs préférentiels.",
}

export default async function MembershipPage() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  
  const [membershipPlans, userMembership] = await Promise.all([
    db.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    session?.user ? db.membership.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
    }) : null,
  ])

  return (
    <div>
      {/* Hero Premium */}
      <section className="relative bg-gradient-to-br from-tempo-bordeaux via-[#5a1a2a] to-tempo-noir text-tempo-creme py-20 sm:py-32 px-4 sm:px-6 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Crown className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-medium">Club Premium</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
            Rejoignez le <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Membership</span>
          </h1>
          
          <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Un engagement pour votre bien-être. Des crédits chaque mois, 
            des avantages exclusifs, une pratique régulière simplifiée.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Check className="h-4 w-4 text-green-400" />
              <span>Crédits automatiques</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Check className="h-4 w-4 text-green-400" />
              <span>Tarifs préférentiels</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Check className="h-4 w-4 text-green-400" />
              <span>Annulation flexible</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-tempo-taupe/30 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-tempo-bordeaux mb-4">
              Les avantages Membership
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Plus qu'un simple abonnement, une expérience premium pour votre pratique
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-tempo-taupe/30 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-tempo-bordeaux mb-2">Crédits automatiques</h3>
              <p className="text-sm text-muted-foreground">
                Vos crédits sont ajoutés automatiquement chaque mois, sans rien faire
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-tempo-taupe/30 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-tempo-bordeaux mb-2">Économies garanties</h3>
              <p className="text-sm text-muted-foreground">
                Jusqu'à 30% d'économie par rapport aux achats à l'unité
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-tempo-taupe/30 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-tempo-bordeaux mb-2">Crédits prolongés</h3>
              <p className="text-sm text-muted-foreground">
                Vos crédits restent valables 1 mois après la fin de votre abonnement
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-tempo-taupe/30 text-center">
              <div className="w-12 h-12 bg-tempo-bordeaux/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-tempo-bordeaux" />
              </div>
              <h3 className="font-semibold text-tempo-bordeaux mb-2">Communauté</h3>
              <p className="text-sm text-muted-foreground">
                Faites partie de notre communauté de pratiquants réguliers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      {membershipPlans.length > 0 ? (
        <MembershipPlansSection 
          plans={membershipPlans}
          isLoggedIn={isLoggedIn}
          hasActiveMembership={!!userMembership}
        />
      ) : (
        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Crown className="h-16 w-16 mx-auto text-tempo-taupe mb-6" />
            <h2 className="text-2xl font-bold text-tempo-bordeaux mb-4">
              Formules bientôt disponibles
            </h2>
            <p className="text-muted-foreground mb-6">
              Nos formules d'abonnement seront disponibles très prochainement. 
              En attendant, découvrez nos offres à l'unité.
            </p>
            <Button asChild className="bg-tempo-bordeaux hover:bg-tempo-noir">
              <Link href="/tarifs">Voir les tarifs</Link>
            </Button>
          </div>
        </section>
      )}

      {/* FAQ Membership */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-tempo-taupe/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-tempo-bordeaux mb-8 text-center">
            Questions sur le Membership
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-tempo-bordeaux mb-2">
                Comment fonctionne l'abonnement ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Chaque mois, vos crédits sont automatiquement ajoutés à votre compte. 
                Vous pouvez les utiliser pour réserver n'importe quel cours au studio. 
                Le prélèvement est automatique chaque mois.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-tempo-bordeaux mb-2">
                Puis-je annuler mon abonnement ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Oui, vous pouvez annuler à tout moment depuis votre espace client. 
                L'annulation prend effet à la fin de la période en cours. 
                Vos crédits restent utilisables jusqu'à leur date d'expiration.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-tempo-bordeaux mb-2">
                Que se passe-t-il si je n'utilise pas tous mes crédits ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Les crédits non utilisés sont reportés et cumulables pendant toute la durée 
                de votre abonnement. Après la fin de l'abonnement, vous avez 1 mois supplémentaire 
                pour utiliser vos crédits restants.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-tempo-bordeaux mb-2">
                Y a-t-il un engagement minimum ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Oui, chaque formule a une durée d'engagement minimum (indiquée sur la formule). 
                Cela nous permet de vous proposer des tarifs préférentiels. 
                Après cette période, vous pouvez annuler à tout moment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-tempo-bordeaux to-tempo-noir text-tempo-creme">
        <div className="max-w-4xl mx-auto text-center">
          <Crown className="h-12 w-12 mx-auto mb-6 text-amber-400" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Prêt à rejoindre le club ?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Commencez votre pratique régulière dès aujourd'hui avec nos formules membership.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              userMembership ? (
                <Button asChild size="lg" className="bg-tempo-creme text-tempo-bordeaux hover:bg-tempo-taupe">
                  <Link href="/app/compte">Mon abonnement</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-tempo-creme text-tempo-bordeaux hover:bg-tempo-taupe">
                  <a href="#plans">Choisir ma formule</a>
                </Button>
              )
            ) : (
              <>
                <Button asChild size="lg" className="bg-tempo-creme text-tempo-bordeaux hover:bg-tempo-taupe">
                  <Link href="/register">Créer mon compte</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-tempo-creme text-tempo-creme hover:bg-tempo-creme hover:text-tempo-bordeaux">
                  <Link href="/login">Se connecter</Link>
                </Button>
              </>
            )}
          </div>

          <p className="text-xs mt-8 opacity-70">
            Pas encore prêt ? <Link href="/tarifs" className="underline">Découvrez nos offres à l'unité</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
