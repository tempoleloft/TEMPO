"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { addMinutes } from "date-fns"
import { sendClassCancellationEmail } from "@/lib/email"

// ============================================================================
// CREATE SESSION (COURS)
// ============================================================================

const createSessionSchema = z.object({
  classTypeId: z.string().min(1, "Type de cours requis"),
  teacherId: z.string().min(1, "Professeur requis"),
  date: z.string().min(1, "Date requise"),
  time: z.string().min(1, "Heure requise"),
  capacity: z.number().min(1, "Capacité minimum 1").max(50, "Capacité maximum 50"),
  location: z.string().optional(),
  durationMin: z.number().min(15, "Durée minimum 15 min").max(180, "Durée maximum 180 min").optional(),
  level: z.string().optional(),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>

export async function createSession(data: CreateSessionInput) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const parsed = createSessionSchema.safeParse(data)
    
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.errors[0]?.message || "Données invalides" 
      }
    }

    const { classTypeId, teacherId, date, time, capacity, location, durationMin: customDuration, level } = parsed.data

    // Get class type for default duration
    const classType = await db.classType.findUnique({
      where: { id: classTypeId },
    })

    if (!classType) {
      return { success: false, error: "Type de cours non trouvé" }
    }

    // Use custom duration if provided, otherwise use class type default
    const duration = customDuration || classType.durationMin

    // Combine date and time
    const startAt = new Date(`${date}T${time}:00`)
    const endAt = addMinutes(startAt, duration)

    // Check for conflicts
    const conflict = await db.session.findFirst({
      where: {
        teacherId,
        status: "SCHEDULED",
        OR: [
          {
            startAt: { lte: startAt },
            endAt: { gt: startAt },
          },
          {
            startAt: { lt: endAt },
            endAt: { gte: endAt },
          },
        ],
      },
    })

    if (conflict) {
      return { success: false, error: "Ce professeur a déjà un cours à cet horaire" }
    }

    // Create session
    await db.session.create({
      data: {
        classTypeId,
        teacherId,
        startAt,
        endAt,
        capacity,
        location: location || null,
        level: level || null,
        status: "SCHEDULED",
        createdById: session.user.id,
      },
    })

    revalidatePath("/admin/planning")
    revalidatePath("/planning")
    revalidatePath("/teacher")
    
    return { success: true }
  } catch (error) {
    console.error("Create session error:", error)
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
    return { success: false, error: `Erreur: ${errorMessage}` }
  }
}

// ============================================================================
// UPDATE SESSION
// ============================================================================

const updateSessionSchema = z.object({
  classTypeId: z.string().min(1, "Type de cours requis"),
  date: z.string().min(1, "Date requise"),
  time: z.string().min(1, "Heure de début requise"),
  endTime: z.string().min(1, "Heure de fin requise"),
  capacity: z.number().min(1, "Capacité minimum 1").max(50, "Capacité maximum 50"),
  location: z.string().nullable(),
  level: z.string().nullable().optional(),
})

export async function updateSession(sessionId: string, data: z.infer<typeof updateSessionSchema>) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const parsed = updateSessionSchema.safeParse(data)
    
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.errors[0]?.message || "Données invalides" 
      }
    }

    const { classTypeId, date, time, endTime, capacity, location, level } = parsed.data

    // Check if session exists
    const existingSession = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        reservations: {
          where: { status: "BOOKED" },
        },
      },
    })

    if (!existingSession) {
      return { success: false, error: "Session non trouvée" }
    }

    // Check if class type exists
    const classType = await db.classType.findUnique({
      where: { id: classTypeId },
    })

    if (!classType) {
      return { success: false, error: "Type de cours non trouvé" }
    }

    // Check capacity isn't less than current reservations
    if (capacity < existingSession.reservations.length) {
      return { 
        success: false, 
        error: `La capacité ne peut pas être inférieure au nombre de réservations (${existingSession.reservations.length})` 
      }
    }

    // Combine date and times
    const startAt = new Date(`${date}T${time}:00`)
    const endAt = new Date(`${date}T${endTime}:00`)

    // Validate end time is after start time
    if (endAt <= startAt) {
      return { success: false, error: "L'heure de fin doit être après l'heure de début" }
    }

    // Update session
    await db.session.update({
      where: { id: sessionId },
      data: {
        classTypeId,
        startAt,
        endAt,
        capacity,
        location,
        level: level || null,
      },
    })

    revalidatePath(`/admin/session/${sessionId}`)
    revalidatePath("/admin/planning")
    revalidatePath("/planning")
    revalidatePath("/app/planning")
    
    return { success: true }
  } catch (error) {
    console.error("Update session error:", error)
    return { success: false, error: "Erreur lors de la modification du cours" }
  }
}

// ============================================================================
// CANCEL SESSION
// ============================================================================

export async function cancelSession(sessionId: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    // Get session with reservations first (outside transaction for read)
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        classType: true,
        teacher: true,
        reservations: {
          where: { status: { in: ["BOOKED", "ATTENDED"] } },
          include: {
            user: {
              include: {
                clientProfile: true,
                wallet: true,
              },
            },
          },
        },
      },
    })

    if (!session) {
      return { success: false, error: "Cours non trouvé" }
    }

    if (session.status === "CANCELLED") {
      return { success: false, error: "Ce cours est déjà annulé" }
    }

    // Prepare email data before transaction
    const emailData: { email: string; firstName: string }[] = []
    
    for (const reservation of session.reservations) {
      emailData.push({
        email: reservation.user.email,
        firstName: reservation.user.clientProfile?.firstName || "Client",
      })
    }

    // Use a transaction to ensure all database operations succeed or fail together
    await db.$transaction(async (tx) => {
      // First, update session status to CANCELLED
      await tx.session.update({
        where: { id: sessionId },
        data: { status: "CANCELLED" },
      })

      // Then process each reservation
      for (const reservation of session.reservations) {
        // Update reservation status
        await tx.reservation.update({
          where: { id: reservation.id },
          data: { status: "CANCELLED" },
        })

        // Create wallet if doesn't exist, then refund
        let walletId = reservation.user.wallet?.id
        
        if (!walletId) {
          const newWallet = await tx.wallet.create({
            data: {
              userId: reservation.user.id,
              creditsBalance: 1, // Start with the refunded credit
            },
          })
          walletId = newWallet.id
        } else {
          // Increment existing wallet
          await tx.wallet.update({
            where: { id: walletId },
            data: { creditsBalance: { increment: 1 } },
          })
        }

        // Log the refund
        await tx.creditLedger.create({
          data: {
            userId: reservation.user.id,
            delta: 1,
            reason: "CANCEL_REFUND",
            notes: `Remboursement - Cours annulé: ${session.classType.title}`,
          },
        })
      }
    })

    // Send emails AFTER transaction succeeds (outside transaction)
    for (const data of emailData) {
      sendClassCancellationEmail(
        data.email,
        data.firstName,
        session.classType.title,
        session.teacher.displayName,
        session.startAt
      ).catch((err) => {
        console.error("Error sending cancellation email:", err)
      })
    }

    revalidatePath("/admin/planning")
    revalidatePath(`/admin/session/${sessionId}`)
    revalidatePath("/planning")
    revalidatePath("/teacher")
    
    return { 
      success: true, 
      refundedCount: session.reservations.length,
    }
  } catch (error) {
    console.error("Cancel session error:", error)
    // Return more details for debugging
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: `Erreur: ${errorMessage}` }
  }
}

// ============================================================================
// CREATE CLASS TYPE
// ============================================================================

const createClassTypeSchema = z.object({
  title: z.string().min(1, "Nom requis").max(100, "Nom trop long"),
  description: z.string().optional(),
  durationMin: z.number().min(15, "Durée minimum 15 min").max(180, "Durée maximum 180 min"),
  level: z.string().optional(),
})

export type CreateClassTypeInput = z.infer<typeof createClassTypeSchema>

export async function createClassType(data: CreateClassTypeInput) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const parsed = createClassTypeSchema.safeParse(data)
    
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.errors[0]?.message || "Données invalides" 
      }
    }

    const { title, description, durationMin, level } = parsed.data

    // Check if class type with same title exists
    const existing = await db.classType.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
    })

    if (existing) {
      return { success: false, error: "Un type de cours avec ce nom existe déjà" }
    }

    // Create class type
    const classType = await db.classType.create({
      data: {
        title,
        description: description || null,
        durationMin,
        level: level || null,
      },
    })

    return { success: true, classTypeId: classType.id }
  } catch (error) {
    console.error("Create class type error:", error)
    return { success: false, error: "Erreur lors de la création du type de cours" }
  }
}

// ============================================================================
// CREATE TEACHER
// ============================================================================

const createTeacherSchema = z.object({
  email: z.string().email("Email invalide"),
  displayName: z.string().min(2, "Nom requis"),
  bio: z.string().optional(),
  specialties: z.array(z.string()).min(1, "Au moins une spécialité"),
  sendWelcomeEmail: z.boolean().optional().default(true),
})

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>

export async function createTeacher(data: CreateTeacherInput) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const parsed = createTeacherSchema.safeParse(data)
    
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.errors[0]?.message || "Données invalides" 
      }
    }

    const { email, displayName, bio, specialties, sendWelcomeEmail } = parsed.data

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return { success: false, error: "Un compte existe déjà avec cet email" }
    }

    // Generate a random temporary password (will be replaced when teacher sets their own)
    const tempPassword = crypto.randomUUID()
    const passwordHash = await hash(tempPassword, 12)

    // Create user with teacher profile
    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: "TEACHER",
        emailVerified: new Date(),
        teacherProfile: {
          create: {
            displayName,
            bio: bio || null,
            specialties,
          },
        },
        wallet: {
          create: {
            creditsBalance: 0,
          },
        },
      },
    })

    // Send welcome email with password setup link
    if (sendWelcomeEmail) {
      // Create password reset token (24h validity)
      const resetToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      
      await db.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: newUser.id,
          expiresAt,
        },
      })

      // Import and send welcome email
      const { sendTeacherWelcomeEmail } = await import("@/lib/email")
      await sendTeacherWelcomeEmail(email.toLowerCase(), resetToken, displayName)
    }

    revalidatePath("/admin/profs")
    
    return { success: true, emailSent: sendWelcomeEmail }
  } catch (error) {
    console.error("Create teacher error:", error)
    return { success: false, error: "Erreur lors de la création du professeur" }
  }
}

// ============================================================================
// DELETE SESSION
// ============================================================================

export async function deleteSession(sessionId: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    // Check if session has reservations
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        reservations: {
          where: { status: "BOOKED" },
        },
      },
    })

    if (!session) {
      return { success: false, error: "Cours non trouvé" }
    }

    if (session.reservations.length > 0) {
      // Cancel instead of delete if there are reservations
      await db.session.update({
        where: { id: sessionId },
        data: { status: "CANCELLED" },
      })
      return { success: true, cancelled: true }
    }

    // Delete if no reservations
    await db.session.delete({
      where: { id: sessionId },
    })

    revalidatePath("/admin/planning")
    revalidatePath("/planning")
    
    return { success: true }
  } catch (error) {
    console.error("Delete session error:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

// ============================================================================
// ADJUST CREDITS
// ============================================================================

export async function adjustCredits(userId: string, delta: number, notes: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    await db.$transaction(async (tx) => {
      // Update wallet
      await tx.wallet.update({
        where: { userId },
        data: {
          creditsBalance: { increment: delta },
        },
      })

      // Create ledger entry
      await tx.creditLedger.create({
        data: {
          userId,
          delta,
          reason: "ADMIN_ADJUST",
          refType: "Admin",
          notes,
        },
      })
    })

    revalidatePath("/admin/clients")
    
    return { success: true }
  } catch (error) {
    console.error("Adjust credits error:", error)
    return { success: false, error: "Erreur lors de l'ajustement" }
  }
}

// ============================================================================
// ATTENDANCE (ÉMARGEMENT)
// ============================================================================

export async function markAttendance(
  reservationId: string,
  status: "ATTENDED" | "NO_SHOW"
) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
      include: {
        session: true,
        user: {
          include: { clientProfile: true },
        },
      },
    })

    if (!reservation) {
      return { success: false, error: "Réservation non trouvée" }
    }

    if (reservation.status !== "BOOKED" && reservation.status !== "ATTENDED" && reservation.status !== "NO_SHOW") {
      return { success: false, error: "Cette réservation ne peut pas être modifiée" }
    }

    await db.reservation.update({
      where: { id: reservationId },
      data: {
        status,
        attendedAt: status === "ATTENDED" ? new Date() : null,
      },
    })

    revalidatePath(`/admin/session/${reservation.sessionId}`)
    
    const clientName = reservation.user.clientProfile
      ? `${reservation.user.clientProfile.firstName} ${reservation.user.clientProfile.lastName}`
      : reservation.user.email

    return { 
      success: true, 
      message: status === "ATTENDED" 
        ? `${clientName} marqué(e) présent(e)` 
        : `${clientName} marqué(e) absent(e)`,
    }
  } catch (error) {
    console.error("Mark attendance error:", error)
    return { success: false, error: "Erreur lors de l'émargement" }
  }
}

// ============================================================================
// PRODUCTS (PRODUITS)
// ============================================================================

const createProductSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  description: z.string().optional(),
  kind: z.enum(["SINGLE", "PACK", "MERCH"]),
  priceCents: z.number().int().min(100, "Prix minimum 1€"),
  credits: z.number().int().min(0, "Crédits invalides"), // 0 allowed for MERCH
  validityDays: z.number().int().min(0).optional(), // 0 or null for MERCH
  imageUrl: z.string().url().optional().or(z.literal("")), // Optional image URL
  sortOrder: z.number().int().optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>

export async function createProduct(data: CreateProductInput) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const parsed = createProductSchema.safeParse(data)
    
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.errors[0]?.message || "Données invalides" 
      }
    }

    const { name, description, kind, priceCents, credits, validityDays, imageUrl, sortOrder } = parsed.data

    // Get next sort order if not provided
    let finalSortOrder = sortOrder
    if (finalSortOrder === undefined) {
      const lastProduct = await db.product.findFirst({
        orderBy: { sortOrder: "desc" },
      })
      finalSortOrder = (lastProduct?.sortOrder || 0) + 1
    }

    await db.product.create({
      data: {
        name,
        description: description || null,
        kind,
        priceCents,
        credits: kind === "MERCH" ? 0 : credits, // No credits for merch
        validityDays: kind === "MERCH" ? null : validityDays, // No validity for merch
        imageUrl: imageUrl || null,
        sortOrder: finalSortOrder,
        active: true,
      },
    })

    revalidatePath("/admin/produits")
    revalidatePath("/app/paiements")
    revalidatePath("/tarifs")
    
    return { success: true }
  } catch (error) {
    console.error("Create product error:", error)
    return { success: false, error: "Erreur lors de la création du produit" }
  }
}

export async function updateProduct(
  productId: string,
  data: Partial<CreateProductInput> & { active?: boolean }
) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return { success: false, error: "Produit non trouvé" }
    }

    await db.product.update({
      where: { id: productId },
      data: {
        ...data,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        credits: data.kind === "MERCH" ? 0 : data.credits,
        validityDays: data.kind === "MERCH" ? null : data.validityDays,
      },
    })

    revalidatePath("/admin/produits")
    revalidatePath("/app/paiements")
    revalidatePath("/tarifs")
    
    return { success: true }
  } catch (error) {
    console.error("Update product error:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function toggleProductActive(productId: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return { success: false, error: "Produit non trouvé" }
    }

    await db.product.update({
      where: { id: productId },
      data: {
        active: !product.active,
      },
    })

    revalidatePath("/admin/produits")
    revalidatePath("/app/paiements")
    revalidatePath("/tarifs")
    
    return { success: true, active: !product.active }
  } catch (error) {
    console.error("Toggle product error:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function toggleProductFeatured(productId: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return { success: false, error: "Produit non trouvé" }
    }

    // If we're setting this product as featured, unfeatured all others first
    if (!product.featured) {
      await db.product.updateMany({
        where: { featured: true },
        data: { featured: false },
      })
    }

    await db.product.update({
      where: { id: productId },
      data: {
        featured: !product.featured,
      },
    })

    revalidatePath("/admin/produits")
    revalidatePath("/app/paiements")
    revalidatePath("/tarifs")
    
    return { success: true, featured: !product.featured }
  } catch (error) {
    console.error("Toggle product featured error:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function deleteProduct(productId: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { purchases: { take: 1 } },
    })

    if (!product) {
      return { success: false, error: "Produit non trouvé" }
    }

    // Check if product has purchases
    if (product.purchases.length > 0) {
      return { 
        success: false, 
        error: "Ce produit a des achats associés. Désactivez-le plutôt que de le supprimer." 
      }
    }

    await db.product.delete({
      where: { id: productId },
    })

    revalidatePath("/admin/produits")
    revalidatePath("/app/paiements")
    revalidatePath("/tarifs")
    
    return { success: true }
  } catch (error) {
    console.error("Delete product error:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

// ============================================================================
// CLIENT MANAGEMENT (Gestion des clients)
// ============================================================================

export async function blacklistClient(userId: string, reason: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: "Client non trouvé" }
    }

    if (user.role === "ADMIN") {
      return { success: false, error: "Impossible de blacklister un administrateur" }
    }

    await db.user.update({
      where: { id: userId },
      data: {
        isBlacklisted: true,
        blacklistedAt: new Date(),
        blacklistReason: reason || "Non spécifié",
      },
    })

    revalidatePath("/admin/clients")
    revalidatePath(`/admin/clients/${userId}`)
    
    return { success: true }
  } catch (error) {
    console.error("Blacklist client error:", error)
    return { success: false, error: "Erreur lors du blacklist" }
  }
}

export async function unblacklistClient(userId: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        isBlacklisted: false,
        blacklistedAt: null,
        blacklistReason: null,
      },
    })

    revalidatePath("/admin/clients")
    revalidatePath(`/admin/clients/${userId}`)
    
    return { success: true }
  } catch (error) {
    console.error("Unblacklist client error:", error)
    return { success: false, error: "Erreur lors du déblacklist" }
  }
}

export async function deleteClient(userId: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        reservations: { where: { status: "BOOKED" } },
      },
    })

    if (!user) {
      return { success: false, error: "Client non trouvé" }
    }

    if (user.role === "ADMIN") {
      return { success: false, error: "Impossible de supprimer un administrateur" }
    }

    if (user.reservations.length > 0) {
      return { success: false, error: "Ce client a des réservations actives. Annulez-les d'abord." }
    }

    // Delete user (cascade will handle related records)
    await db.user.delete({
      where: { id: userId },
    })

    revalidatePath("/admin/clients")
    
    return { success: true }
  } catch (error) {
    console.error("Delete client error:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

// ============================================================================
// SETTINGS (PARAMÈTRES)
// ============================================================================

export async function getSettings() {
  // Get or create default settings
  let settings = await db.settings.findUnique({
    where: { id: "default" },
  })

  if (!settings) {
    settings = await db.settings.create({
      data: { id: "default" },
    })
  }

  return settings
}

const updateSettingsSchema = z.object({
  cancelHoursBefore: z.number().int().min(0).max(72).optional(),
  maxWaitlistSize: z.number().int().min(0).max(10).optional(),
  defaultCapacity: z.number().int().min(1).max(50).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderHoursBefore: z.number().int().min(1).max(72).optional(),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>

export async function updateSettings(data: UpdateSettingsInput) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const parsed = updateSettingsSchema.safeParse(data)
    
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.errors[0]?.message || "Données invalides" 
      }
    }

    // Upsert settings
    await db.settings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ...parsed.data,
      },
      update: parsed.data,
    })

    revalidatePath("/admin/settings")
    
    return { success: true }
  } catch (error) {
    console.error("Update settings error:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

// ============================================================================
// CREATE ADMIN
// ============================================================================

const createAdminSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe minimum 6 caractères"),
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
})

export type CreateAdminInput = z.infer<typeof createAdminSchema>

export async function createAdmin(data: CreateAdminInput) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const parsed = createAdminSchema.safeParse(data)
    
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.errors[0]?.message || "Données invalides" 
      }
    }

    const { email, password, firstName, lastName } = parsed.data

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return { success: false, error: "Un compte existe déjà avec cet email" }
    }

    // Hash password
    const passwordHash = await hash(password, 12)

    // Create admin user
    await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: "ADMIN",
        emailVerified: new Date(),
        clientProfile: {
          create: {
            firstName,
            lastName,
            phone: "",
          },
        },
        wallet: {
          create: {
            creditsBalance: 0,
          },
        },
      },
    })

    revalidatePath("/admin/settings")
    
    return { success: true }
  } catch (error) {
    console.error("Create admin error:", error)
    return { success: false, error: "Erreur lors de la création de l'administrateur" }
  }
}

// ============================================================================
// GET ADMINS LIST
// ============================================================================

export async function getAdmins() {
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      email: true,
      createdAt: true,
      clientProfile: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return admins
}

// Reset attendance back to BOOKED
export async function resetAttendance(reservationId: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
    })

    if (!reservation) {
      return { success: false, error: "Réservation non trouvée" }
    }

    await db.reservation.update({
      where: { id: reservationId },
      data: {
        status: "BOOKED",
        attendedAt: null,
      },
    })

    revalidatePath(`/admin/session/${reservation.sessionId}`)
    
    return { success: true }
  } catch (error) {
    console.error("Reset attendance error:", error)
    return { success: false, error: "Erreur lors de la réinitialisation" }
  }
}

// ============================================================================
// CAFE MENU MANAGEMENT
// ============================================================================

export async function getCafeMenuItems() {
  try {
    const items = await db.cafeMenuItem.findMany({
      orderBy: [
        { category: "asc" },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    })
    
    return { success: true, items }
  } catch (error) {
    console.error("Get cafe menu items error:", error)
    return { success: false, error: "Erreur lors du chargement de la carte" }
  }
}

export async function getActiveCafeMenuItems() {
  try {
    const items = await db.cafeMenuItem.findMany({
      where: { isActive: true },
      orderBy: [
        { category: "asc" },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    })
    
    return { success: true, items }
  } catch (error) {
    console.error("Get active cafe menu items error:", error)
    return { success: false, error: "Erreur lors du chargement de la carte" }
  }
}

export async function createCafeMenuItem(data: {
  name: string
  price: number
  description: string | null
  category: string
}) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    // Get max sortOrder for this category
    const maxSort = await db.cafeMenuItem.findFirst({
      where: { category: data.category },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    })

    const item = await db.cafeMenuItem.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        category: data.category,
        sortOrder: (maxSort?.sortOrder ?? 0) + 1,
      },
    })

    revalidatePath("/admin/cafe")
    revalidatePath("/cafe")
    
    return { success: true, item }
  } catch (error) {
    console.error("Create cafe menu item error:", error)
    return { success: false, error: "Erreur lors de la création" }
  }
}

export async function updateCafeMenuItem(id: string, data: {
  name?: string
  price?: number
  description?: string | null
  sortOrder?: number
}) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const item = await db.cafeMenuItem.update({
      where: { id },
      data,
    })

    revalidatePath("/admin/cafe")
    revalidatePath("/cafe")
    
    return { success: true, item }
  } catch (error) {
    console.error("Update cafe menu item error:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function deleteCafeMenuItem(id: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    await db.cafeMenuItem.delete({
      where: { id },
    })

    revalidatePath("/admin/cafe")
    revalidatePath("/cafe")
    
    return { success: true }
  } catch (error) {
    console.error("Delete cafe menu item error:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

export async function toggleCafeMenuItemActive(id: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const item = await db.cafeMenuItem.findUnique({
      where: { id },
      select: { isActive: true },
    })

    if (!item) {
      return { success: false, error: "Produit non trouvé" }
    }

    await db.cafeMenuItem.update({
      where: { id },
      data: { isActive: !item.isActive },
    })

    revalidatePath("/admin/cafe")
    revalidatePath("/cafe")
    
    return { success: true }
  } catch (error) {
    console.error("Toggle cafe menu item error:", error)
    return { success: false, error: "Erreur lors de la modification" }
  }
}

// ============================================================================
// TEACHER MANAGEMENT
// ============================================================================

export async function toggleTeacherActive(teacherId: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const teacher = await db.teacherProfile.findUnique({
      where: { id: teacherId },
      select: { isActive: true },
    })

    if (!teacher) {
      return { success: false, error: "Professeur non trouvé" }
    }

    await db.teacherProfile.update({
      where: { id: teacherId },
      data: { isActive: !teacher.isActive },
    })

    revalidatePath("/admin/profs")
    revalidatePath("/profs")
    revalidatePath("/planning")
    revalidatePath("/admin/planning")
    
    return { success: true }
  } catch (error) {
    console.error("Toggle teacher active error:", error)
    return { success: false, error: "Erreur lors de la modification" }
  }
}

export async function deleteTeacher(teacherId: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    // Check if teacher has any sessions
    const sessionsCount = await db.session.count({
      where: { teacherId },
    })

    if (sessionsCount > 0) {
      return { 
        success: false, 
        error: `Ce professeur a ${sessionsCount} cours associé(s). Supprimez ou réassignez ces cours d'abord, ou masquez le professeur.`,
        hasSession: true,
        sessionsCount,
      }
    }

    // Get teacher to find userId
    const teacher = await db.teacherProfile.findUnique({
      where: { id: teacherId },
      select: { userId: true },
    })

    if (!teacher) {
      return { success: false, error: "Professeur non trouvé" }
    }

    // Delete teacher profile (cascade will handle user if configured)
    await db.teacherProfile.delete({
      where: { id: teacherId },
    })

    // Also update user role back to CLIENT
    await db.user.update({
      where: { id: teacher.userId },
      data: { role: "CLIENT" },
    })

    revalidatePath("/admin/profs")
    revalidatePath("/profs")
    
    return { success: true }
  } catch (error) {
    console.error("Delete teacher error:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

export async function forceDeleteTeacher(teacherId: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    // Get teacher to find userId
    const teacher = await db.teacherProfile.findUnique({
      where: { id: teacherId },
      select: { userId: true },
    })

    if (!teacher) {
      return { success: false, error: "Professeur non trouvé" }
    }

    // Delete all related data in transaction
    await db.$transaction(async (tx) => {
      // Delete waitlist entries for teacher's sessions
      await tx.waitlistEntry.deleteMany({
        where: {
          session: { teacherId },
        },
      })

      // Delete reservations for teacher's sessions
      await tx.reservation.deleteMany({
        where: {
          session: { teacherId },
        },
      })

      // Delete all sessions
      await tx.session.deleteMany({
        where: { teacherId },
      })

      // Delete teacher profile
      await tx.teacherProfile.delete({
        where: { id: teacherId },
      })

      // Update user role back to CLIENT
      await tx.user.update({
        where: { id: teacher.userId },
        data: { role: "CLIENT" },
      })
    })

    revalidatePath("/admin/profs")
    revalidatePath("/profs")
    revalidatePath("/admin/planning")
    revalidatePath("/planning")
    
    return { success: true }
  } catch (error) {
    console.error("Force delete teacher error:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

export async function getTeacherById(teacherId: string) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const teacher = await db.teacherProfile.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: { email: true },
        },
        _count: {
          select: { sessions: true },
        },
      },
    })

    if (!teacher) {
      return { success: false, error: "Professeur non trouvé" }
    }

    return { success: true, teacher }
  } catch (error) {
    console.error("Get teacher by id error:", error)
    return { success: false, error: "Erreur lors du chargement" }
  }
}

export async function updateTeacher(teacherId: string, data: {
  displayName?: string
  bio?: string | null
  photoUrl?: string | null
  specialties?: string[]
  email?: string
  newPassword?: string
}) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    // Get teacher to find associated user
    const existingTeacher = await db.teacherProfile.findUnique({
      where: { id: teacherId },
      include: { user: true },
    })

    if (!existingTeacher) {
      return { success: false, error: "Professeur non trouvé" }
    }

    // Prepare user updates
    const userUpdates: { email?: string; passwordHash?: string } = {}

    // Update email if provided and different
    if (data.email && data.email !== existingTeacher.user.email) {
      // Check if email is already taken
      const emailTaken = await db.user.findUnique({
        where: { email: data.email },
      })
      
      if (emailTaken) {
        return { success: false, error: "Cette adresse email est déjà utilisée" }
      }

      userUpdates.email = data.email
    }

    // Update password if provided
    if (data.newPassword && data.newPassword.trim().length >= 6) {
      userUpdates.passwordHash = await hash(data.newPassword, 12)
    }

    // Apply user updates if any
    if (Object.keys(userUpdates).length > 0) {
      await db.user.update({
        where: { id: existingTeacher.userId },
        data: userUpdates,
      })
    }

    // Update teacher profile
    const teacher = await db.teacherProfile.update({
      where: { id: teacherId },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        photoUrl: data.photoUrl,
        specialties: data.specialties,
      },
    })

    revalidatePath("/admin/profs")
    revalidatePath(`/admin/profs/${teacherId}`)
    revalidatePath("/profs")
    
    return { success: true, teacher }
  } catch (error) {
    console.error("Update teacher error:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

// ============================================================================
// UPDATE CLIENT PROFILE
// ============================================================================

export async function updateClientProfile(userId: string, data: {
  firstName: string
  lastName: string
  phone?: string
}) {
  const authSession = await auth()
  
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    // Check if client profile exists
    const existingProfile = await db.clientProfile.findUnique({
      where: { userId },
    })

    if (existingProfile) {
      // Update existing profile
      await db.clientProfile.update({
        where: { userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || existingProfile.phone,
        },
      })
    } else {
      // Create new profile
      await db.clientProfile.create({
        data: {
          userId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || "",
        },
      })
    }

    revalidatePath("/admin/clients")
    revalidatePath(`/admin/clients/${userId}`)
    
    return { success: true }
  } catch (error) {
    console.error("Update client profile error:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}
