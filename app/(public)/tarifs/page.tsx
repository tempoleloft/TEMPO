import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check } from "lucide-react"

export default async function TarifsPage() {
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div>
      {/* Hero */}
      <section className="bg-tempo-bordeaux text-tempo-creme py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Nos Tarifs
          </h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Des formules adaptées à votre rythme de pratique. 
            Plus vous pratiquez, plus vous économisez.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product, index) => {
              const pricePerClass = product.credits > 0 
                ? (product.priceCents / 100 / product.credits).toFixed(0)
                : (product.priceCents / 100).toFixed(0)
              
              const isPopular = index === 2 // Carte 10 cours

              return (
                <Card 
                  key={product.id} 
                  className={`relative ${isPopular ? "border-tempo-bordeaux border-2 shadow-lg" : ""}`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-tempo-bordeaux">
                      Meilleure offre
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-tempo-bordeaux">
                      {product.name}
                    </CardTitle>
                    <CardDescription>
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-tempo-bordeaux">
                        {(product.priceCents / 100).toFixed(0)}€
                      </span>
                    </div>
                    {product.credits > 1 && (
                      <p className="text-sm text-muted-foreground mb-6">
                        soit {pricePerClass}€ par cours
                      </p>
                    )}
                    <ul className="space-y-3 text-left">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        {product.credits} cours
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        Valable {product.validityDays} jours
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        Tous les cours inclus
                      </li>
                      {product.credits >= 10 && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          Meilleur rapport qualité/prix
                        </li>
                      )}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      asChild 
                      className={`w-full ${isPopular ? "bg-tempo-bordeaux hover:bg-tempo-noir" : ""}`}
                      variant={isPopular ? "default" : "outline"}
                    >
                      <Link href="/register">Acheter</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-tempo-taupe/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-tempo-bordeaux mb-12 text-center">
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
      <section className="py-20 px-6 bg-tempo-bordeaux text-tempo-creme">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl opacity-80 mb-8">
            Créez votre compte et réservez votre premier cours dès aujourd'hui.
          </p>
          <Button asChild size="lg" className="bg-tempo-creme text-tempo-bordeaux hover:bg-tempo-taupe">
            <Link href="/register">Créer mon compte</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
