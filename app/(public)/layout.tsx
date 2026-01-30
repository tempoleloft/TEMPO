import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/layout/user-menu"

export const dynamic = 'force-dynamic'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  // Fetch user profile if logged in
  let userName = session?.user?.name || null
  if (session?.user?.id && !userName) {
    const profile = await db.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { firstName: true, lastName: true },
    })
    if (profile) {
      userName = `${profile.firstName} ${profile.lastName}`
    }
  }
  
  const dashboardLink = session?.user?.role === "ADMIN" 
    ? "/admin" 
    : session?.user?.role === "TEACHER" 
    ? "/teacher" 
    : "/app"

  return (
    <div className="min-h-screen bg-tempo-creme">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-tempo-bordeaux text-tempo-creme px-6 py-4">
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
            {session ? (
              <UserMenu 
                userName={userName || session.user.email || "Mon compte"} 
                dashboardLink={dashboardLink}
                userImage={session.user.image}
              />
            ) : (
              <>
                <Link href="/login" className="text-sm hover:opacity-70 transition-opacity">
                  Connexion
                </Link>
                <Button 
                  asChild
                  className="bg-tempo-creme text-tempo-bordeaux hover:bg-tempo-taupe"
                >
                  <Link href="/register">Rejoindre</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
      
      {children}

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
    </div>
  )
}
