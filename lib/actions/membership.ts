"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

interface CreateMembershipPlanInput {
  name: string
  description?: string
  creditsPerMonth: number
  priceCentsPerMonth: number
  commitmentMonths: number
  renewalType: "AUTO" | "FIXED"
  promoFreeMonths?: number
  promoBonusCredits?: number
}

export async function createMembershipPlan(input: CreateMembershipPlanInput) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    // Create Stripe product and price
    const stripeProduct = await stripe.products.create({
      name: `Membership - ${input.name}`,
      description: input.description || undefined,
      metadata: {
        type: "membership",
        creditsPerMonth: input.creditsPerMonth.toString(),
        commitmentMonths: input.commitmentMonths.toString(),
      },
    })

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: input.priceCentsPerMonth,
      currency: "eur",
      recurring: {
        interval: "month",
      },
      metadata: {
        type: "membership",
      },
    })

    // Create in database
    const plan = await db.membershipPlan.create({
      data: {
        name: input.name,
        description: input.description,
        creditsPerMonth: input.creditsPerMonth,
        priceCentsPerMonth: input.priceCentsPerMonth,
        commitmentMonths: input.commitmentMonths,
        renewalType: input.renewalType,
        promoFreeMonths: input.promoFreeMonths,
        promoBonusCredits: input.promoBonusCredits,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      },
    })

    revalidatePath("/admin/memberships")
    return { success: true, planId: plan.id }
  } catch (error) {
    console.error("Error creating membership plan:", error)
    return { success: false, error: "Erreur lors de la création de la formule" }
  }
}

export async function toggleMembershipPlanActive(planId: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const plan = await db.membershipPlan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return { success: false, error: "Formule non trouvée" }
    }

    await db.membershipPlan.update({
      where: { id: planId },
      data: { isActive: !plan.isActive },
    })

    // Update Stripe product
    if (plan.stripeProductId) {
      await stripe.products.update(plan.stripeProductId, {
        active: !plan.isActive,
      })
    }

    revalidatePath("/admin/memberships")
    return { success: true }
  } catch (error) {
    console.error("Error toggling membership plan:", error)
    return { success: false, error: "Erreur lors de la modification" }
  }
}

export async function deleteMembershipPlan(planId: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    // Check if there are active memberships
    const activeCount = await db.membership.count({
      where: { planId, status: "ACTIVE" },
    })

    if (activeCount > 0) {
      return { success: false, error: "Impossible de supprimer : des membres sont encore actifs sur cette formule" }
    }

    const plan = await db.membershipPlan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return { success: false, error: "Formule non trouvée" }
    }

    // Archive in Stripe (can't delete products with prices)
    if (plan.stripeProductId) {
      await stripe.products.update(plan.stripeProductId, {
        active: false,
      })
    }

    // Delete from database
    await db.membershipPlan.delete({
      where: { id: planId },
    })

    revalidatePath("/admin/memberships")
    return { success: true }
  } catch (error) {
    console.error("Error deleting membership plan:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

export async function cancelMembership(membershipId: string) {
  const session = await auth()
  
  if (!session?.user) {
    return { success: false, error: "Non authentifié" }
  }

  try {
    const membership = await db.membership.findUnique({
      where: { id: membershipId },
      include: { plan: true },
    })

    if (!membership) {
      return { success: false, error: "Abonnement non trouvé" }
    }

    // Check ownership or admin
    if (membership.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    // Cancel in Stripe at period end
    if (membership.stripeSubscriptionId) {
      await stripe.subscriptions.update(membership.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
    }

    // Update in database
    await db.membership.update({
      where: { id: membershipId },
      data: {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
      },
    })

    revalidatePath("/admin/memberships")
    revalidatePath("/app/compte")
    return { success: true }
  } catch (error) {
    console.error("Error cancelling membership:", error)
    return { success: false, error: "Erreur lors de l'annulation" }
  }
}
