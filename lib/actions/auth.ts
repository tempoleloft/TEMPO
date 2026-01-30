"use server"

import { hash } from "bcryptjs"
import { z } from "zod"
import { signIn } from "@/lib/auth"
import { db } from "@/lib/db"
import { AuthError } from "next-auth"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email"
import { nanoid } from "nanoid"

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
  firstName: z.string().min(2, "Le prénom doit faire au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  phone: z.string().min(10, "Le numéro de téléphone est requis"),
})

export type RegisterInput = z.infer<typeof registerSchema>

export async function registerUser(data: RegisterInput) {
  try {
    const parsed = registerSchema.safeParse(data)
    
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.errors[0]?.message || "Données invalides" 
      }
    }

    const { email, password, firstName, lastName, phone } = parsed.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return { success: false, error: "Un compte existe déjà avec cet email" }
    }

    // Hash password
    const passwordHash = await hash(password, 12)

    // Generate verification token
    const verificationToken = nanoid(32)

    // Create user with client profile and wallet
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: "CLIENT",
        emailVerified: null, // Not verified yet
        clientProfile: {
          create: {
            firstName,
            lastName,
            phone,
          },
        },
        wallet: {
          create: {
            creditsBalance: 0,
          },
        },
      },
    })

    // Create verification token
    await db.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // Send verification email
    await sendVerificationEmail(email, verificationToken, firstName)

    return { success: true, message: "Compte créé ! Vérifiez votre email pour activer votre compte." }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Une erreur est survenue lors de l'inscription" }
  }
}

export async function loginUser(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Email ou mot de passe incorrect" }
        default:
          return { success: false, error: "Une erreur est survenue" }
      }
    }
    throw error
  }
}

export async function verifyEmail(token: string) {
  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
      include: {
        // We need to find the user by email
      },
    })

    if (!verificationToken) {
      return { success: false, error: "Token invalide" }
    }

    if (verificationToken.expires < new Date()) {
      await db.verificationToken.delete({
        where: { token },
      })
      return { success: false, error: "Token expiré" }
    }

    // Update user emailVerified
    await db.user.update({
      where: { email: verificationToken.identifier },
      data: {
        emailVerified: new Date(),
      },
    })

    // Delete verification token
    await db.verificationToken.delete({
      where: { token },
    })

    return { success: true }
  } catch (error) {
    console.error("Verify email error:", error)
    return { success: false, error: "Erreur lors de la vérification" }
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Don't reveal if user exists for security
      return { success: true, message: "Si cet email existe, un lien de réinitialisation a été envoyé." }
    }

    // Generate reset token
    const resetToken = nanoid(32)

    // Delete old tokens
    await db.passwordResetToken.deleteMany({
      where: { userId: user.id },
    })

    // Create new token
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    // Send email
    await sendPasswordResetEmail(email, resetToken)

    return { success: true, message: "Si cet email existe, un lien de réinitialisation a été envoyé." }
  } catch (error) {
    console.error("Password reset request error:", error)
    return { success: false, error: "Erreur lors de la demande de réinitialisation" }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (newPassword.length < 6) {
      return { success: false, error: "Le mot de passe doit faire au moins 6 caractères" }
    }

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken) {
      return { success: false, error: "Token invalide" }
    }

    if (resetToken.expires < new Date()) {
      await db.passwordResetToken.delete({
        where: { token },
      })
      return { success: false, error: "Token expiré" }
    }

    // Hash new password
    const passwordHash = await hash(newPassword, 12)

    // Update user password
    await db.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
      },
    })

    // Delete reset token
    await db.passwordResetToken.delete({
      where: { token },
    })

    return { success: true, message: "Mot de passe réinitialisé avec succès" }
  } catch (error) {
    console.error("Reset password error:", error)
    return { success: false, error: "Erreur lors de la réinitialisation" }
  }
}
