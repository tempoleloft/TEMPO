"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  userName: string
  dashboardLink: string
  userImage?: string | null
}

export function UserMenu({ userName, dashboardLink, userImage }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ callbackUrl: "/" })
  }

  // Get initials for avatar
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-tempo-creme hover:bg-tempo-creme/10 hover:text-tempo-creme"
        >
          {userImage ? (
            <img 
              src={userImage} 
              alt={userName} 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-tempo-creme text-tempo-bordeaux flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
          )}
          <span className="hidden sm:inline max-w-[150px] truncate">
            {userName}
          </span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground">Connecté</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardLink} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Mon espace
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/profil" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Mon profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoading}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoading ? "Déconnexion..." : "Se déconnecter"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
