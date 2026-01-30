import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe, isStripeConfigured } from "@/lib/stripe"
import { db } from "@/lib/db"
import Stripe from "stripe"

export async function POST(request: Request) {
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
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
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
      await handleCheckoutCompleted(session)
      break
    }
    
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutExpired(session)
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
