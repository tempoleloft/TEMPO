import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-tempo-bordeaux text-tempo-creme">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            TEMPO
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/studio" className="hover:opacity-70 transition-opacity">
              Studio
            </Link>
            <Link href="/profs" className="hover:opacity-70 transition-opacity">
              Professeurs
            </Link>
            <Link href="/planning" className="hover:opacity-70 transition-opacity">
              Planning
            </Link>
            <Link href="/tarifs" className="hover:opacity-70 transition-opacity">
              Tarifs
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm hover:opacity-70 transition-opacity">
              Connexion
            </Link>
            <Button 
              asChild
              className="bg-tempo-creme text-tempo-bordeaux hover:bg-tempo-taupe"
            >
              <Link href="/register">Rejoindre</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <p className="text-sm tracking-[0.3em] uppercase opacity-70">
            Yoga & Pilates • Paris Marais
          </p>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none">
            YOUR PACE.
            <br />
            YOUR TEMPO.
          </h1>
          
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto leading-relaxed">
            Un studio où le mouvement rencontre le calme. 
            Yoga Vinyasa, Hatha, Pilates Mat et Reformer 
            dans un loft chaleureux au cœur du Marais.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              asChild
              size="lg"
              className="bg-tempo-creme text-tempo-bordeaux hover:bg-tempo-taupe px-8 py-6 text-base"
            >
              <Link href="/planning">Voir le planning</Link>
            </Button>
            <Button 
              asChild
              size="lg"
              className="bg-transparent border-2 border-tempo-creme text-tempo-creme hover:bg-tempo-creme hover:text-tempo-bordeaux px-8 py-6 text-base transition-all"
            >
              <Link href="/studio">Découvrir le studio</Link>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-50">
          <div className="w-[1px] h-16 bg-tempo-creme/50 animate-pulse" />
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6 bg-tempo-creme text-tempo-noir">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Slow is strong.</h3>
              <p className="opacity-70 leading-relaxed">
                Ici, on ne court pas. On prend le temps de construire 
                une pratique solide, à son propre rythme.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Not faster. Just deeper.</h3>
              <p className="opacity-70 leading-relaxed">
                Chaque mouvement compte. On privilégie la qualité, 
                la conscience corporelle et la connexion.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Build with balance.</h3>
              <p className="opacity-70 leading-relaxed">
                Force et souplesse. Effort et repos. 
                Un équilibre qui se construit session après session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Classes Preview */}
      <section className="py-24 px-6 bg-tempo-taupe/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-tempo-bordeaux mb-4">
              Nos disciplines
            </h2>
            <p className="text-tempo-noir/70 max-w-xl mx-auto">
              Des cours adaptés à tous les niveaux, encadrés par des professeurs passionnés.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Yoga Vinyasa", desc: "Flow dynamique" },
              { name: "Yoga Hatha", desc: "Douceur & précision" },
              { name: "Pilates Mat", desc: "Renforcement profond" },
              { name: "Pilates Reformer", desc: "Travail ciblé" },
            ].map((discipline) => (
              <div 
                key={discipline.name}
                className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-tempo-bordeaux mb-2">
                  {discipline.name}
                </h3>
                <p className="text-tempo-noir/60 text-sm">
                  {discipline.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              asChild
              className="bg-tempo-bordeaux text-tempo-creme hover:bg-tempo-noir"
            >
              <Link href="/planning">Réserver un cours</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-tempo-bordeaux text-tempo-creme">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            A warm moment.
          </h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Rejoignez notre communauté et découvrez un espace 
            où prendre soin de soi devient un rituel quotidien.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              asChild
              size="lg"
              className="bg-tempo-creme text-tempo-bordeaux hover:bg-tempo-taupe"
            >
              <Link href="/register">Créer mon compte</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-tempo-noir text-tempo-creme/80">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-tempo-creme font-bold text-xl mb-4">TEMPO</h4>
              <p className="text-sm opacity-70">Le Loft</p>
              <p className="text-sm opacity-70">Paris Marais</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Studio</h5>
              <ul className="space-y-2 text-sm opacity-70">
                <li><Link href="/studio" className="hover:opacity-100">Notre espace</Link></li>
                <li><Link href="/profs" className="hover:opacity-100">Professeurs</Link></li>
                <li><Link href="/planning" className="hover:opacity-100">Planning</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Infos</h5>
              <ul className="space-y-2 text-sm opacity-70">
                <li><Link href="/tarifs" className="hover:opacity-100">Tarifs</Link></li>
                <li><Link href="/faq" className="hover:opacity-100">FAQ</Link></li>
                <li><Link href="/contact" className="hover:opacity-100">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <p className="text-sm opacity-70">12 Rue du Temple</p>
              <p className="text-sm opacity-70">75004 Paris</p>
              <p className="text-sm opacity-70 mt-2">hello@tempo-leloft.com</p>
            </div>
          </div>
          <div className="border-t border-tempo-creme/10 pt-8 text-center text-sm opacity-50">
            © 2026 Tempo – Le Loft. Tous droits réservés.
          </div>
        </div>
      </footer>
    </main>
  )
}
