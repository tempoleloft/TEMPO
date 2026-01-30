import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"

// Role-based route access - which roles can access which routes
const roleRoutes: Record<string, Role[]> = {
  "/app": ["CLIENT"], // Only clients go to /app
  "/teacher": ["TEACHER"],
  "/admin": ["ADMIN"],
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // Check if route requires authentication
  const isProtectedRoute = pathname.startsWith("/app") || 
                           pathname.startsWith("/teacher") || 
                           pathname.startsWith("/admin")

  // Redirect to login if not authenticated
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users to their appropriate dashboard
  if (isLoggedIn && isProtectedRoute) {
    const correctPath = getRedirectForRole(userRole)
    
    // If user is trying to access wrong dashboard, redirect to correct one
    if (userRole === "ADMIN" && !pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL(correctPath, req.url))
    }
    if (userRole === "TEACHER" && !pathname.startsWith("/teacher") && !pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL(correctPath, req.url))
    }
    if (userRole === "CLIENT" && !pathname.startsWith("/app")) {
      return NextResponse.redirect(new URL(correctPath, req.url))
    }
  }

  // Redirect logged-in users away from auth pages to their dashboard
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    const redirectPath = getRedirectForRole(userRole)
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  return NextResponse.next()
})

function getRedirectForRole(role: Role | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin"
    case "TEACHER":
      return "/teacher"
    case "CLIENT":
    default:
      return "/app"
  }
}

export const config = {
  matcher: [
    // Protected routes
    "/app/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    // Auth routes
    "/login",
    "/register",
  ],
}
