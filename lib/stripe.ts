import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

// Check if Stripe is properly configured
export function isStripeConfigured(): boolean {
  return !!(stripeSecretKey && stripeSecretKey.startsWith("sk_"))
}

// Only create Stripe instance if properly configured
export const stripe = stripeSecretKey && stripeSecretKey.startsWith("sk_")
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      typescript: true,
    })
  : null

// Helper to format amount for display
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100)
}
