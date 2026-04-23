import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getStripe, isStripeConfigured } from "@/lib/stripe"
import { db } from "@/lib/db"
import Stripe from "stripe"
import { 
  sendMembershipWelcomeEmail, 
  sendMembershipRenewalConfirmationEmail 
} from "@/lib/email"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const stripe = getStripe()
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    )
  }

  const body = await request.text()
  const signature = headers().get("stripe-signature")

  if (!signature) {
    console.error("Missing stripe-signature header")
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // IMPORTANT: Trim the webhook secret to remove any trailing newlines
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
    if (!webhookSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET")
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      )
    }
    
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      // Check if it's a membership subscription or a regular purchase
      if (session.mode === "subscription" && session.metadata?.type === "membership") {
        await handleMembershipCheckoutCompleted(session)
      } else {
        await handleCheckoutCompleted(session)
      }
      break
    }
    
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutExpired(session)
      break
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice
      // Handle recurring membership payments
      if (invoice.subscription && invoice.billing_reason === "subscription_cycle") {
        await handleMembershipInvoicePaid(invoice)
      }
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdated(subscription)
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(subscription)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const purchaseId = session.metadata?.purchaseId
  const userId = session.metadata?.userId
  const credits = parseInt(session.metadata?.credits || "0")

  if (!purchaseId || !userId) {
    console.error("Missing metadata in checkout session:", session.id)
    return
  }

  try {
    await db.$transaction(async (tx) => {
      // 1. Update purchase status
      const purchase = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          status: "PAID",
          stripePaymentIntentId: session.payment_intent as string,
        },
      })

      // 2. Add credits to wallet
      await tx.wallet.upsert({
        where: { userId },
        create: {
          userId,
          creditsBalance: credits,
        },
        update: {
          creditsBalance: { increment: credits },
        },
      })

      // 3. Create ledger entry
      await tx.creditLedger.create({
        data: {
          userId,
          delta: credits,
          reason: "PURCHASE",
          refType: "Purchase",
          refId: purchase.id,
          notes: `Achat de ${credits} crédit${credits > 1 ? "s" : ""}`,
        },
      })
    })

    console.log(`Payment completed for purchase ${purchaseId}: ${credits} credits added`)
  } catch (error) {
    console.error("Error processing checkout completion:", error)
    throw error
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const purchaseId = session.metadata?.purchaseId

  if (!purchaseId) {
    return
  }

  try {
    // Mark purchase as failed/cancelled
    await db.purchase.update({
      where: { id: purchaseId },
      data: {
        status: "REFUNDED", // Using REFUNDED as cancelled state
      },
    })

    console.log(`Checkout expired for purchase ${purchaseId}`)
  } catch (error) {
    console.error("Error handling checkout expiration:", error)
  }
}

async function handleMembershipCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId
  const subscriptionId = session.subscription as string

  if (!userId || !planId || !subscriptionId) {
    console.error("Missing metadata in membership checkout session:", session.id)
    return
  }

  try {
    const [plan, user] = await Promise.all([
      db.membershipPlan.findUnique({
        where: { id: planId },
      }),
      db.user.findUnique({
        where: { id: userId },
        include: { clientProfile: true },
      }),
    ])

    if (!plan) {
      console.error("Membership plan not found:", planId)
      return
    }

    if (!user) {
      console.error("User not found:", userId)
      return
    }

    const now = new Date()
    const commitmentEndDate = new Date(now)
    commitmentEndDate.setMonth(commitmentEndDate.getMonth() + plan.commitmentMonths)
    
    const currentPeriodEnd = new Date(now)
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
    
    const creditsExpiryDate = new Date(commitmentEndDate)
    creditsExpiryDate.setMonth(creditsExpiryDate.getMonth() + 1) // +1 month grace period

    // Calculate initial credits (including promo)
    let initialCredits = plan.creditsPerMonth
    if (plan.promoBonusCredits) {
      initialCredits += plan.promoBonusCredits
    }

    await db.$transaction(async (tx) => {
      // 1. Create membership
      await tx.membership.create({
        data: {
          userId,
          planId,
          startDate: now,
          currentPeriodStart: now,
          currentPeriodEnd,
          commitmentEndDate,
          creditsExpiryDate,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: session.customer as string,
          totalCreditsGranted: initialCredits,
          monthsCompleted: 0,
        },
      })

      // 2. Add credits to wallet
      await tx.wallet.upsert({
        where: { userId },
        create: {
          userId,
          creditsBalance: initialCredits,
        },
        update: {
          creditsBalance: { increment: initialCredits },
        },
      })

      // 3. Create ledger entry
      await tx.creditLedger.create({
        data: {
          userId,
          delta: initialCredits,
          reason: "MEMBERSHIP",
          refType: "Membership",
          refId: planId,
          notes: `Abonnement ${plan.name} - Premier mois${plan.promoBonusCredits ? ` + ${plan.promoBonusCredits} crédits bonus` : ""}`,
        },
      })
    })

    // 4. Send welcome email
    const firstName = user.clientProfile?.firstName || user.name?.split(" ")[0] || "Membre"
    await sendMembershipWelcomeEmail(
      user.email,
      firstName,
      plan.name,
      plan.creditsPerMonth,
      now,
      commitmentEndDate,
      plan.commitmentMonths,
      plan.promoBonusCredits || undefined
    )

    console.log(`Membership created for user ${userId}: ${plan.name} with ${initialCredits} credits`)
  } catch (error) {
    console.error("Error creating membership:", error)
    throw error
  }
}

async function handleMembershipInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) {
    return
  }

  try {
    const membership = await db.membership.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      include: { 
        plan: true,
        user: {
          include: { clientProfile: true },
        },
      },
    })

    if (!membership) {
      console.log("Membership not found for subscription:", subscriptionId)
      return
    }

    const now = new Date()
    const newPeriodEnd = new Date(now)
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1)

    const newCreditsExpiryDate = new Date(membership.commitmentEndDate)
    newCreditsExpiryDate.setMonth(newCreditsExpiryDate.getMonth() + 1)

    await db.$transaction(async (tx) => {
      // 1. Update membership
      await tx.membership.update({
        where: { id: membership.id },
        data: {
          currentPeriodStart: now,
          currentPeriodEnd: newPeriodEnd,
          monthsCompleted: { increment: 1 },
          totalCreditsGranted: { increment: membership.plan.creditsPerMonth },
        },
      })

      // 2. Add monthly credits
      await tx.wallet.upsert({
        where: { userId: membership.userId },
        create: {
          userId: membership.userId,
          creditsBalance: membership.plan.creditsPerMonth,
        },
        update: {
          creditsBalance: { increment: membership.plan.creditsPerMonth },
        },
      })

      // 3. Create ledger entry
      await tx.creditLedger.create({
        data: {
          userId: membership.userId,
          delta: membership.plan.creditsPerMonth,
          reason: "MEMBERSHIP",
          refType: "Membership",
          refId: membership.id,
          notes: `Abonnement ${membership.plan.name} - Renouvellement mensuel`,
        },
      })
    })

    // 4. Send renewal confirmation email
    const firstName = membership.user.clientProfile?.firstName || membership.user.name?.split(" ")[0] || "Membre"
    await sendMembershipRenewalConfirmationEmail(
      membership.user.email,
      firstName,
      membership.plan.name,
      membership.plan.creditsPerMonth,
      now,
      newPeriodEnd
    )

    console.log(`Monthly credits added for membership ${membership.id}: ${membership.plan.creditsPerMonth} credits`)
  } catch (error) {
    console.error("Error processing membership invoice:", error)
    throw error
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const membership = await db.membership.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    })

    if (!membership) {
      return
    }

    // Check if subscription is being cancelled at period end
    if (subscription.cancel_at_period_end) {
      await db.membership.update({
        where: { id: membership.id },
        data: {
          cancelAtPeriodEnd: true,
          cancelledAt: new Date(),
        },
      })
      console.log(`Membership ${membership.id} will be cancelled at period end`)
    }
  } catch (error) {
    console.error("Error handling subscription update:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const membership = await db.membership.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    })

    if (!membership) {
      return
    }

    await db.membership.update({
      where: { id: membership.id },
      data: {
        status: "EXPIRED",
      },
    })

    console.log(`Membership ${membership.id} has expired`)
  } catch (error) {
    console.error("Error handling subscription deletion:", error)
  }
}
