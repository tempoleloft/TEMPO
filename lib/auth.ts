import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
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
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    // Email/Password
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
    async signIn({ user, account, profile }) {
      // For Google OAuth, create client profile if it doesn't exist
      if (account?.provider === "google") {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
          include: { clientProfile: true, wallet: true },
        })

        if (existingUser) {
          // User exists, check if they need a client profile
          if (!existingUser.clientProfile) {
            // Extract name from profile
            const firstName = (profile as { given_name?: string })?.given_name || user.name?.split(" ")[0] || ""
            const lastName = (profile as { family_name?: string })?.family_name || user.name?.split(" ").slice(1).join(" ") || ""
            
            await db.clientProfile.create({
              data: {
                userId: existingUser.id,
                firstName,
                lastName,
                phone: "", // Will need to be filled later
              },
            })
          }
          if (!existingUser.wallet) {
            await db.wallet.create({
              data: {
                userId: existingUser.id,
                creditsBalance: 0,
              },
            })
          }
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // For OAuth, fetch the role from the database
        if (account?.provider === "google") {
          const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          })
          token.role = dbUser?.role || "CLIENT"
        } else {
          token.role = user.role
        }
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
      // If the URL is the base URL (home page), redirect to dashboard
      if (url === baseUrl || url === baseUrl + "/") {
        return `${baseUrl}/app`
      }
      // Allow callback URLs within the app
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Default to client dashboard
      return `${baseUrl}/app`
    },
  },
  events: {
    async createUser({ user }) {
      // When a new user is created via OAuth, set them as CLIENT and create wallet
      await db.user.update({
        where: { id: user.id },
        data: { role: "CLIENT" },
      })
      
      // Create wallet if it doesn't exist
      const existingWallet = await db.wallet.findUnique({
        where: { userId: user.id },
      })
      if (!existingWallet) {
        await db.wallet.create({
          data: {
            userId: user.id,
            creditsBalance: 0,
          },
        })
      }
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
