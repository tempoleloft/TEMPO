import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { stripe, isStripeConfigured } from "@/lib/stripe"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Check Stripe configuration first
    if (!isStripeConfigured() || !stripe) {
      console.error("Stripe is not configured. Please add valid STRIPE_SECRET_KEY to .env")
      return NextResponse.json(
        { error: "Le paiement n'est pas encore configuré. Contactez l'administrateur." },
        { status: 503 }
      )
    }

    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: "Produit requis" },
        { status: 400 }
      )
    }

    // Get product
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product || !product.active) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      )
    }

    // Get user info
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        clientProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Create pending purchase
    const purchase = await db.purchase.create({
      data: {
        userId: user.id,
        productId: product.id,
        amountCents: product.priceCents,
        creditsGranted: product.credits,
        status: "PENDING",
      },
    })

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      client_reference_id: purchase.id,
      metadata: {
        purchaseId: purchase.id,
        userId: user.id,
        productId: product.id,
        credits: product.credits.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: product.name,
              description: product.description || `${product.credits} cours - Valable ${product.validityDays} jours`,
            },
            unit_amount: product.priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/app/paiements?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/app/paiements?canceled=true`,
    })

    // Update purchase with Stripe session ID
    await db.purchase.update({
      where: { id: purchase.id },
      data: {
        stripeCheckoutSessionId: checkoutSession.id,
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    )
  }
}
