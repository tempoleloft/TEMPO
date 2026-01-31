"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, Users, Calendar, CreditCard, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  isLoggedIn: boolean
  dashboardLink?: string
  userName?: string
}

const publicLinks = [
  { href: "/studio", label: "Studio", icon: Home },
  { href: "/profs", label: "Professeurs", icon: Users },
  { href: "/planning", label: "Planning", icon: Calendar },
  { href: "/tarifs", label: "Tarifs", icon: CreditCard },
]

export function MobileNav({ isLoggedIn, dashboardLink, userName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-tempo-creme hover:bg-tempo-bordeaux/80"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        "fixed top-0 right-0 z-50 h-screen w-72 bg-tempo-bordeaux text-tempo-creme transform transition-transform duration-300 ease-in-out shadow-2xl",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-tempo-creme/20">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
            >
              <Image 
                src="/logo-white.png" 
                alt="Tempo" 
                width={100} 
                height={35} 
                className="h-8 w-auto"
              />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-tempo-creme hover:bg-tempo-bordeaux/80"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {publicLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-tempo-creme text-tempo-bordeaux" 
                      : "hover:bg-tempo-creme/10"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-tempo-creme/20">
            {isLoggedIn ? (
              <div className="space-y-3">
                {userName && (
                  <p className="text-sm opacity-70 truncate">{userName}</p>
                )}
                <Link
                  href={dashboardLink || "/app"}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-tempo-creme text-tempo-bordeaux font-medium"
                >
                  <User className="h-5 w-5" />
                  Mon espace
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-tempo-creme hover:bg-tempo-creme/10"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-center rounded-lg border border-tempo-creme/30 hover:bg-tempo-creme/10 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-center rounded-lg bg-tempo-creme text-tempo-bordeaux font-medium hover:bg-tempo-taupe transition-colors"
                >
                  Rejoindre
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
