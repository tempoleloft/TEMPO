"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  Calendar, 
  CreditCard, 
  Home, 
  LogOut, 
  Settings, 
  User, 
  Users,
  LayoutGrid,
  BookOpen,
  Menu,
  X
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Role } from "@prisma/client"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const clientNav: NavItem[] = [
  { title: "Tableau de bord", href: "/app", icon: <Home className="h-4 w-4" /> },
  { title: "Planning", href: "/app/planning", icon: <Calendar className="h-4 w-4" /> },
  { title: "Mes réservations", href: "/app/reservations", icon: <BookOpen className="h-4 w-4" /> },
  { title: "Acheter des cours", href: "/app/paiements", icon: <CreditCard className="h-4 w-4" /> },
  { title: "Mon compte", href: "/app/compte", icon: <User className="h-4 w-4" /> },
]

const teacherNav: NavItem[] = [
  { title: "Tableau de bord", href: "/teacher", icon: <Home className="h-4 w-4" /> },
  { title: "Mon planning", href: "/teacher/planning", icon: <Calendar className="h-4 w-4" /> },
]

const adminNav: NavItem[] = [
  { title: "Tableau de bord", href: "/admin", icon: <Home className="h-4 w-4" /> },
  { title: "Planning", href: "/admin/planning", icon: <Calendar className="h-4 w-4" /> },
  { title: "Clients", href: "/admin/clients", icon: <Users className="h-4 w-4" /> },
  { title: "Professeurs", href: "/admin/profs", icon: <User className="h-4 w-4" /> },
  { title: "Produits", href: "/admin/produits", icon: <LayoutGrid className="h-4 w-4" /> },
  { title: "Paramètres", href: "/admin/settings", icon: <Settings className="h-4 w-4" /> },
]

interface DashboardNavProps {
  role: Role
  userName?: string
}

export function DashboardNav({ role, userName }: DashboardNavProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = role === "ADMIN" 
    ? adminNav 
    : role === "TEACHER" 
    ? teacherNav 
    : clientNav

  const roleLabel = role === "ADMIN" ? "Administration" : role === "TEACHER" ? "Espace Prof" : "Mon Espace"

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/">
            <Image 
              src="/logo-dark.jpg" 
              alt="Tempo" 
              width={100} 
              height={35} 
              className="h-8 w-auto"
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r transform transition-transform duration-300 ease-in-out md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <div>
              <Link href="/">
                <Image 
                  src="/logo-dark.jpg" 
                  alt="Tempo" 
                  width={100} 
                  height={35} 
                  className="h-8 w-auto"
                />
              </Link>
              <p className="text-xs text-muted-foreground mt-1">{roleLabel}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-tempo-bordeaux text-white"
                    : "text-muted-foreground hover:bg-tempo-taupe/30 hover:text-tempo-bordeaux"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            {userName && (
              <p className="text-sm font-medium mb-2 truncate">{userName}</p>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-tempo-bordeaux"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b px-6 py-4">
            <Link href="/">
              <Image 
                src="/logo-dark.jpg" 
                alt="Tempo" 
                width={120} 
                height={40} 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-xs text-muted-foreground mt-1">{roleLabel}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-tempo-bordeaux text-white"
                    : "text-muted-foreground hover:bg-tempo-taupe/30 hover:text-tempo-bordeaux"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            {userName && (
              <p className="text-sm font-medium mb-2 truncate">{userName}</p>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-tempo-bordeaux"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
