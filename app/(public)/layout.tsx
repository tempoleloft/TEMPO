import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/layout/user-menu"
import { MobileNav } from "@/components/layout/mobile-nav"

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
      <nav className="sticky top-0 z-50 bg-tempo-bordeaux text-tempo-creme px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image 
              src="/logo-white.png" 
              alt="Tempo" 
              width={120} 
              height={40} 
              className="h-8 sm:h-10 w-auto"
              priority
            />
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
            <Link href="/membership" className="hover:opacity-70 transition-opacity flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
                <path d="M5 21h14"/>
              </svg>
              Membership
            </Link>
            <Link href="/cafe" className="hover:opacity-70 transition-opacity">
              Café
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
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
          {/* Mobile Menu */}
          <MobileNav 
            isLoggedIn={!!session} 
            dashboardLink={dashboardLink}
            userName={userName || session?.user?.email || undefined}
          />
        </div>
      </nav>
      
      {children}

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 bg-tempo-noir text-tempo-creme/80">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Image 
                src="/logo-white.png" 
                alt="Tempo" 
                width={140} 
                height={50} 
                className="h-12 w-auto mb-4"
              />
              <p className="text-sm opacity-70">Paris Marais</p>
            </div>
            <div>
              <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Studio</h5>
              <ul className="space-y-2 text-sm opacity-70">
                <li><Link href="/studio" className="hover:opacity-100">Notre espace</Link></li>
                <li><Link href="/cafe" className="hover:opacity-100">Le Café</Link></li>
                <li><Link href="/profs" className="hover:opacity-100">Professeurs</Link></li>
                <li><Link href="/planning" className="hover:opacity-100">Planning</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Infos</h5>
              <ul className="space-y-2 text-sm opacity-70">
                <li><Link href="/tarifs" className="hover:opacity-100">Tarifs</Link></li>
                <li><Link href="/membership" className="hover:opacity-100">Membership</Link></li>
                <li><Link href="/faq" className="hover:opacity-100">FAQ</Link></li>
                <li><Link href="/contact" className="hover:opacity-100">Contact</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h5>
              <p className="text-sm opacity-70">41 Rue du Temple</p>
              <p className="text-sm opacity-70">75004 Paris</p>
              <div className="flex flex-col gap-3 mt-4">
                <a 
                  href="mailto:contact@tempoleloft.com"
                  className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  contact@tempoleloft.com
                </a>
                <a 
                  href="https://www.instagram.com/tempo_leloft/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  @tempo_leloft
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-tempo-creme/10 pt-6 sm:pt-8 text-center text-xs sm:text-sm opacity-50">
            © 2026 Tempo – Le Loft. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
