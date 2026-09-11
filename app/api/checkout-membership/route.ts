import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { getStripe, isStripeConfigured } from "@/lib/stripe"

export const dynamic = 'force-dynamic'

function getBaseUrl() {
  return (process.env.NEXTAUTH_URL || "https://tempoleloft.com")
    .trim()
    .replace(/\\n$/g, "")
    .replace(/\n$/g, "")
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe()
    if (!isStripeConfigured() || !stripe) {
      console.error("Stripe is not configured for membership checkout")
      return NextResponse.json(
        { error: "Le paiement n'est pas encore configuré. Contactez l'administrateur." },
        { status: 503 }
      )
    }

    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: "Plan ID requis" }, { status: 400 })
    }

    // Get the plan
    const plan = await db.membershipPlan.findUnique({
      where: { id: planId },
    })

    if (!plan || !plan.isActive || !plan.stripePriceId) {
      return NextResponse.json({ error: "Formule non disponible" }, { status: 400 })
    }

    // Check if user already has an active membership
    const existingMembership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    })

    if (existingMembership) {
      return NextResponse.json({ error: "Vous avez déjà un abonnement actif" }, { status: 400 })
    }

    // Get or create Stripe customer
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { clientProfile: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 400 })
    }

    // Check if user has a Stripe customer ID stored (we could add this field to User model)
    // For now, create a new customer or search by email
    let customerId: string

    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.clientProfile 
          ? `${user.clientProfile.firstName} ${user.clientProfile.lastName}`
          : user.name || undefined,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id
    }

    // Create Stripe checkout session for subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        planId: plan.id,
        type: "membership",
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planId: plan.id,
          type: "membership",
        },
      },
      success_url: `${getBaseUrl()}/app/compte?membership=success`,
      cancel_url: `${getBaseUrl()}/tarifs?membership=cancelled`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Checkout membership error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    )
  }
}
