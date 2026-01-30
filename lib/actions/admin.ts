"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { addMinutes } from "date-fns"

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

    const { classTypeId, teacherId, date, time, capacity, location } = parsed.data

    // Get class type for duration
    const classType = await db.classType.findUnique({
      where: { id: classTypeId },
    })

    if (!classType) {
      return { success: false, error: "Type de cours non trouvé" }
    }

    // Combine date and time
    const startAt = new Date(`${date}T${time}:00`)
    const endAt = addMinutes(startAt, classType.durationMin)

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
    return { success: false, error: "Erreur lors de la création du cours" }
  }
}

// ============================================================================
// CREATE TEACHER
// ============================================================================

const createTeacherSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe minimum 6 caractères"),
  displayName: z.string().min(2, "Nom requis"),
  bio: z.string().optional(),
  specialties: z.array(z.string()).min(1, "Au moins une spécialité"),
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

    const { email, password, displayName, bio, specialties } = parsed.data

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return { success: false, error: "Un compte existe déjà avec cet email" }
    }

    // Hash password
    const passwordHash = await hash(password, 12)

    // Create user with teacher profile
    await db.user.create({
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

    revalidatePath("/admin/profs")
    
    return { success: true }
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
  kind: z.enum(["SINGLE", "PACK"]),
  priceCents: z.number().int().min(100, "Prix minimum 1€"),
  credits: z.number().int().min(1, "Au moins 1 crédit"),
  validityDays: z.number().int().min(1, "Au moins 1 jour de validité"),
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

    const { name, description, kind, priceCents, credits, validityDays, sortOrder } = parsed.data

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
        credits,
        validityDays,
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
