import { MapPin, Clock, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-tempo-bordeaux text-tempo-creme py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Contact</h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Une question ? N'hésitez pas à nous contacter.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-tempo-bordeaux flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Adresse</h3>
                  <p className="text-muted-foreground">
                    41 Rue du Temple<br />
                    75004 Paris
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sous le porche, 1ère porte en bois à gauche<br />
                    2ème étage
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
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
                  <p className="text-muted-foreground">
                    <a href="tel:0634396579" className="hover:text-tempo-bordeaux">
                      06 34 39 65 79
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-tempo-bordeaux flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:contact@tempoleloft.com" className="hover:text-tempo-bordeaux">
                      contact@tempoleloft.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-start gap-4">
                <svg className="h-6 w-6 text-tempo-bordeaux flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <div>
                  <h3 className="font-semibold mb-1">Instagram</h3>
                  <p className="text-muted-foreground">
                    <a href="https://www.instagram.com/tempo_leloft/" target="_blank" rel="noopener noreferrer" className="hover:text-tempo-bordeaux">
                      @tempo_leloft
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-lg aspect-square overflow-hidden">
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
      <section className="py-20 px-6 bg-tempo-taupe/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-tempo-bordeaux mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-muted-foreground mb-8">
            Consultez notre planning et réservez votre premier cours.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-tempo-bordeaux text-tempo-creme hover:bg-tempo-noir">
              <Link href="/planning">Voir le planning</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-tempo-bordeaux text-tempo-bordeaux hover:bg-tempo-bordeaux hover:text-tempo-creme">
              <Link href="/tarifs">Nos tarifs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
