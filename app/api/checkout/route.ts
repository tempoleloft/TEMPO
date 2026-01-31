import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getStripe, isStripeConfigured } from "@/lib/stripe"
import { rateLimit, RATE_LIMITS, getClientIP } from "@/lib/rate-limit"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Rate limiting basé sur l'IP
    const clientIP = getClientIP(request)
    const rateLimitResult = await rateLimit(
      `checkout:${clientIP}`,
      RATE_LIMITS.CHECKOUT
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${rateLimitResult.retryAfter} secondes.` },
        { 
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.resetAt),
          }
        }
      )
    }

    // Check Stripe configuration first
    const stripe = getStripe()
    if (!isStripeConfigured() || !stripe) {
      console.error("Stripe is not configured")
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

    // Create Stripe Checkout Session avec clé d'idempotence
    // La clé d'idempotence garantit qu'un double-clic ou une erreur réseau
    // ne créera pas plusieurs sessions de paiement
    const baseUrl = process.env.NEXTAUTH_URL?.trim() || "http://localhost:3000"
    
    const checkoutSession = await stripe.checkout.sessions.create(
      {
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
      },
      {
        idempotencyKey: `checkout_${purchase.id}`,
      }
    )

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
    // Log l'erreur complète côté serveur pour le debugging
    console.error("Checkout error:", error)
    
    // Ne jamais exposer les détails techniques au client
    // Cela pourrait révéler des informations sensibles (noms de tables, config, etc.)
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    )
  }
}
