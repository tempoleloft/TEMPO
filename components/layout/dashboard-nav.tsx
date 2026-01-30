"use client"

import Link from "next/link"
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
  BookOpen
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

  const navItems = role === "ADMIN" 
    ? adminNav 
    : role === "TEACHER" 
    ? teacherNav 
    : clientNav

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b px-6 py-4">
          <Link href="/" className="text-xl font-bold text-tempo-bordeaux">
            TEMPO
          </Link>
          <p className="text-xs text-muted-foreground mt-1">
            {role === "ADMIN" ? "Administration" : role === "TEACHER" ? "Espace Prof" : "Mon Espace"}
          </p>
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
  )
}
