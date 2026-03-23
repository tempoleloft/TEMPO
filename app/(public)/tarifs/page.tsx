import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TarifsSection } from "@/components/tarifs-section"

export const dynamic = 'force-dynamic'

export default async function TarifsPage() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  })

  // Separate visible and hidden products
  const visibleProducts = products.filter(p => !p.isHidden)
  const hiddenProducts = products.filter(p => p.isHidden)

  return (
    <div>
      {/* Hero */}
      <section className="bg-tempo-bordeaux text-tempo-creme py-12 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">
            Nos Tarifs
          </h1>
          <p className="text-base sm:text-xl opacity-80 max-w-2xl mx-auto">
            Des formules adaptées à votre rythme de pratique. 
            Plus vous pratiquez, plus vous économisez.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <TarifsSection 
        visibleProducts={visibleProducts}
        hiddenProducts={hiddenProducts}
        isLoggedIn={isLoggedIn}
      />

      {/* FAQ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-tempo-taupe/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-tempo-bordeaux mb-8 sm:mb-12 text-center">
            Questions fréquentes
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-tempo-bordeaux mb-2">
                Puis-je utiliser mes crédits pour tous les cours ?
              </h3>
              <p className="text-muted-foreground text-sm">
                Oui, vos crédits sont valables pour tous nos cours : Yoga Vinyasa, 
                Yoga Hatha, Pilates Mat et Barre au Sol.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-tempo-bordeaux mb-2">
                Comment fonctionne l'annulation ?
              </h3>
              <p className="text-muted-foreground text-sm">
                Vous pouvez annuler gratuitement jusqu'à 12h avant le cours. 
                Votre crédit vous sera automatiquement restitué.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-tempo-bordeaux mb-2">
                Que se passe-t-il si ma carte expire ?
              </h3>
              <p className="text-muted-foreground text-sm">
                Les crédits non utilisés à l'expiration de votre carte sont perdus. 
                Nous vous envoyons un rappel 7 jours avant l'expiration.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-tempo-bordeaux mb-2">
                Proposez-vous un cours d'essai ?
              </h3>
              <p className="text-muted-foreground text-sm">
                Votre premier cours à l'unité fait office de cours découverte. 
                Profitez-en pour tester notre studio avant de vous engager.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-tempo-bordeaux text-tempo-creme">
        <div className="max-w-4xl mx-auto text-center">
          {isLoggedIn ? (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                Prêt à pratiquer ?
              </h2>
              <p className="text-base sm:text-xl opacity-80 mb-6 sm:mb-8">
                Achetez vos crédits et réservez votre prochain cours.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Button asChild size="lg" className="bg-tempo-creme text-tempo-bordeaux hover:bg-tempo-taupe w-full sm:w-auto">
                  <Link href="/app/paiements">Acheter des crédits</Link>
                </Button>
                <Button asChild size="lg" className="bg-transparent border-2 border-tempo-creme text-tempo-creme hover:bg-tempo-creme hover:text-tempo-bordeaux w-full sm:w-auto">
                  <Link href="/app/planning">Voir le planning</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                Prêt à commencer ?
              </h2>
              <p className="text-base sm:text-xl opacity-80 mb-6 sm:mb-8">
                Créez votre compte et réservez votre premier cours dès aujourd'hui.
              </p>
              <Button asChild size="lg" className="bg-tempo-creme text-tempo-bordeaux hover:bg-tempo-taupe w-full sm:w-auto">
                <Link href="/register">Créer mon compte</Link>
              </Button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
