import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

import { db } from "@/lib/db"
import { Role } from "@prisma/client"

// Extend the built-in session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: Role
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: Role
  }
}

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
})

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db) as NextAuthConfig["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        
        if (!parsed.success) {
          return null
        }

        const { email, password } = parsed.data

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            role: true,
            emailVerified: true,
          },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Veuillez vérifier votre email avant de vous connecter")
        }

        const isPasswordValid = await compare(password, user.passwordHash)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to appropriate dashboard based on role after login
      if (url.startsWith(baseUrl)) {
        return url
      }
      return baseUrl
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Helper to get current user from server components
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

// Helper to check if user has required role
export function hasRole(userRole: Role | undefined, requiredRoles: Role[]): boolean {
  if (!userRole) return false
  return requiredRoles.includes(userRole)
}

// Role-based redirect paths
export function getRedirectPath(role: Role): string {
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
