import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Clock, Phone, Mail } from "lucide-react"

export default function StudioPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-tempo-bordeaux text-tempo-creme py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Notre Studio
          </h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Un espace chaleureux au cœur du Marais, dédié à votre bien-être 
            et à votre pratique du yoga et du pilates.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-tempo-bordeaux mb-6">
                A warm moment.
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Tempo – Le Loft est né d'une envie simple : créer un espace où 
                le mouvement rencontre le calme. Loin de l'agitation parisienne, 
                notre studio vous accueille dans une atmosphère apaisante et 
                contemporaine.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Ici, pas de compétition. Chacun avance à son rythme, guidé par 
                des professeurs passionnés et bienveillants. Que vous soyez 
                débutant ou pratiquant confirmé, vous trouverez votre place.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Notre philosophie : <strong className="text-tempo-bordeaux">slow is strong</strong>. 
                Nous croyons en une pratique profonde plutôt que rapide, en des 
                progrès durables plutôt qu'éphémères.
              </p>
            </div>
            <div className="bg-tempo-taupe/30 rounded-lg aspect-square flex items-center justify-center">
              <span className="text-6xl font-bold text-tempo-bordeaux/20">TEMPO</span>
            </div>
          </div>
        </div>
      </section>

      {/* Spaces */}
      <section className="py-20 px-6 bg-tempo-taupe/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-tempo-bordeaux mb-12 text-center">
            Nos espaces
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-tempo-bordeaux mb-4">
                Salle principale
              </h3>
              <p className="text-muted-foreground mb-4">
                Un espace lumineux de 80m² pouvant accueillir jusqu'à 14 personnes. 
                Parquet en bois, lumière naturelle et équipement premium pour vos 
                cours de yoga et pilates mat.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tapis et accessoires fournis</li>
                <li>• Vestiaires avec douches</li>
                <li>• Coin tisane</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-tempo-bordeaux mb-4">
                Espace détente
              </h3>
              <p className="text-muted-foreground mb-4">
                Un coin cosy pour vous accueillir avant et après vos cours.
                Profitez d un moment de calme dans une ambiance chaleureuse.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Coin tisane et infusions</li>
                <li>• Vestiaires avec douches</li>
                <li>• Casiers sécurisés</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-tempo-bordeaux mb-12 text-center">
            Nous trouver
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-tempo-bordeaux flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Adresse</h3>
                  <p className="text-muted-foreground">
                    41 Rue du Temple<br />
                    75004 Paris<br />
                    Métro Rambuteau (ligne 11)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-tempo-bordeaux flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Horaires</h3>
                  <p className="text-muted-foreground">
                    Lundi - Vendredi : 7h00 - 21h00<br />
                    Samedi : 8h00 - 22h00<br />
                    Dimanche : 8h00 - 20h00
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-tempo-bordeaux flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Téléphone</h3>
                  <p className="text-muted-foreground">06 34 39 65 79</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-tempo-bordeaux flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground">contact@tempoleloft.com</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg aspect-video overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.8749462776635!2d2.352242!3d48.861111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e1c5f5a5555%3A0x5555555555555555!2s41%20Rue%20du%20Temple%2C%2075004%20Paris!5e0!3m2!1sfr!2sfr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Tempo Le Loft - 41 Rue du Temple, Paris"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-tempo-bordeaux text-tempo-creme">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Envie de nous rejoindre ?
          </h2>
          <p className="text-xl opacity-80 mb-8">
            Découvrez notre planning et réservez votre premier cours.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-tempo-creme text-tempo-bordeaux hover:bg-tempo-taupe">
              <Link href="/planning">Voir le planning</Link>
            </Button>
            <Button asChild size="lg" className="bg-transparent border-2 border-tempo-creme text-tempo-creme hover:bg-tempo-creme hover:text-tempo-bordeaux">
              <Link href="/tarifs">Nos tarifs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
