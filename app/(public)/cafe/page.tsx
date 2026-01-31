import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coffee, Wifi, Armchair, Clock, MapPin, Leaf } from "lucide-react"

export default function CafePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/cafe-home.png"
          alt="TEMPO Le Café"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-tempo-noir/60 via-tempo-noir/40 to-tempo-noir/80" />
        
        <div className="relative z-10 text-center text-tempo-creme px-4 max-w-4xl mx-auto">
          <Image
            src="/logo-cafe-white.png"
            alt="TEMPO Le Café"
            width={200}
            height={80}
            className="h-20 sm:h-24 w-auto mx-auto mb-8"
          />
          <p className="text-lg sm:text-xl md:text-2xl opacity-90 mb-6 leading-relaxed">
            Un espace chaleureux où savourer un moment de pause,
            <br className="hidden sm:block" />
            avant ou après votre pratique.
          </p>
          <p className="text-sm sm:text-base uppercase tracking-[0.2em] opacity-70">
            Café • Coworking • Détente
          </p>
        </div>
      </section>

      {/* Concept Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-tempo-creme">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-tempo-bordeaux mb-4">
              Plus qu'un café
            </h2>
            <p className="text-tempo-noir/70 max-w-2xl mx-auto text-base sm:text-lg">
              TEMPO Le Café est un prolongement naturel du studio. 
              Un lieu où l'on prend le temps, où l'on se retrouve, 
              où l'on travaille dans une ambiance apaisante.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-tempo-taupe/30 flex items-center justify-center mx-auto mb-4">
                  <Coffee className="h-7 w-7 text-tempo-bordeaux" />
                </div>
                <h3 className="text-xl font-semibold text-tempo-bordeaux mb-2">
                  Café de spécialité
                </h3>
                <p className="text-tempo-noir/60 text-sm">
                  Grains torréfiés localement, préparés avec soin par nos baristas passionnés.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-tempo-taupe/30 flex items-center justify-center mx-auto mb-4">
                  <Armchair className="h-7 w-7 text-tempo-bordeaux" />
                </div>
                <h3 className="text-xl font-semibold text-tempo-bordeaux mb-2">
                  Ambiance cosy
                </h3>
                <p className="text-tempo-noir/60 text-sm">
                  Canapés moelleux, lumière tamisée et musique douce pour un moment de détente.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-tempo-taupe/30 flex items-center justify-center mx-auto mb-4">
                  <Wifi className="h-7 w-7 text-tempo-bordeaux" />
                </div>
                <h3 className="text-xl font-semibold text-tempo-bordeaux mb-2">
                  Espace coworking
                </h3>
                <p className="text-tempo-noir/60 text-sm">
                  WiFi haut débit, prises partout et ambiance propice à la concentration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-tempo-taupe/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-tempo-bordeaux mb-4">
              Notre carte
            </h2>
            <p className="text-tempo-noir/70">
              Simple, de qualité, fait maison.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            {/* Boissons */}
            <div>
              <h3 className="text-xl font-semibold text-tempo-bordeaux mb-6 flex items-center gap-2">
                <Coffee className="h-5 w-5" />
                Boissons
              </h3>
              <div className="space-y-4">
                <MenuItem name="Espresso" price="2,50" />
                <MenuItem name="Americano" price="3,00" />
                <MenuItem name="Flat White" price="4,50" />
                <MenuItem name="Latte" price="4,50" />
                <MenuItem name="Cappuccino" price="4,50" />
                <MenuItem name="Matcha Latte" price="5,00" description="Matcha bio du Japon" />
                <MenuItem name="Golden Latte" price="5,00" description="Curcuma, gingembre, lait d'avoine" />
                <MenuItem name="Chai Latte" price="4,50" />
                <MenuItem name="Chocolat chaud" price="4,00" />
                <MenuItem name="Thé bio" price="3,50" description="Sélection de thés en vrac" />
                <MenuItem name="Jus frais" price="5,50" description="Orange, pomme-gingembre, vert detox" />
              </div>
            </div>

            {/* À manger */}
            <div>
              <h3 className="text-xl font-semibold text-tempo-bordeaux mb-6 flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                À grignoter
              </h3>
              <div className="space-y-4">
                <MenuItem name="Avocado Toast" price="9,00" description="Pain au levain, avocat, œuf poché" />
                <MenuItem name="Granola Bowl" price="8,00" description="Yaourt, granola maison, fruits frais" />
                <MenuItem name="Banana Bread" price="4,00" description="Fait maison, sans gluten disponible" />
                <MenuItem name="Energy Balls" price="3,00" description="Dattes, cacao, noisettes (x3)" />
                <MenuItem name="Cookie" price="3,50" description="Chocolat noir ou avoine-raisins" />
                <MenuItem name="Tartine du jour" price="8,50" description="Selon l'inspiration du chef" />
                <MenuItem name="Salade healthy" price="12,00" description="Quinoa, légumes de saison, graines" />
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-tempo-noir/50">
              Options végétariennes, vegan et sans gluten disponibles.
              <br />
              Demandez nos alternatives lait d'avoine, amande ou soja.
            </p>
          </div>
        </div>
      </section>

      {/* Horaires & Infos */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-tempo-bordeaux text-tempo-creme">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <Clock className="h-6 w-6" />
                Horaires
              </h3>
              <div className="space-y-3 opacity-90">
                <div className="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span>7h30 - 19h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span>9h00 - 18h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span>9h00 - 15h00</span>
                </div>
              </div>
              <p className="mt-6 text-sm opacity-70">
                Ouvert aux membres du studio et au public.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <MapPin className="h-6 w-6" />
                Nous trouver
              </h3>
              <div className="space-y-2 opacity-90">
                <p>41 Rue du Temple</p>
                <p>75004 Paris</p>
                <p className="text-sm opacity-70 mt-4">
                  Métro Hôtel de Ville (L1, L11)
                  <br />
                  Métro Rambuteau (L11)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-tempo-creme">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-tempo-bordeaux mb-4">
            Venez comme vous êtes
          </h2>
          <p className="text-tempo-noir/70 mb-8 max-w-xl mx-auto">
            Que vous veniez de terminer votre cours de yoga, 
            que vous cherchiez un endroit calme pour travailler, 
            ou simplement pour un bon café — vous êtes les bienvenus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-tempo-bordeaux hover:bg-tempo-noir">
              <Link href="/planning">Voir le planning des cours</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-tempo-bordeaux text-tempo-bordeaux hover:bg-tempo-bordeaux hover:text-tempo-creme">
              <Link href="/studio">Découvrir le studio</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

// Composant pour les items du menu
function MenuItem({ 
  name, 
  price, 
  description 
}: { 
  name: string
  price: string
  description?: string 
}) {
  return (
    <div className="flex justify-between items-start gap-4 pb-3 border-b border-tempo-taupe/30 last:border-0">
      <div>
        <p className="font-medium text-tempo-noir">{name}</p>
        {description && (
          <p className="text-sm text-tempo-noir/50 mt-0.5">{description}</p>
        )}
      </div>
      <span className="font-semibold text-tempo-bordeaux whitespace-nowrap">{price}€</span>
    </div>
  )
}
