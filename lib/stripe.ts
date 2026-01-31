import Stripe from "stripe"

// Check if Stripe is properly configured
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  return !!(key && key.startsWith("sk_"))
}

// Get Stripe instance - create fresh instance for each request in serverless
// This is the recommended pattern for Vercel serverless functions
export function getStripe(): Stripe | null {
  // IMPORTANT: Trim the key to remove any trailing newlines from env vars
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key || !key.startsWith("sk_")) return null
  
  // Create new instance with explicit config for serverless
  return new Stripe(key, {
    maxNetworkRetries: 3,
    timeout: 30000, // 30 seconds
  })
}

// For backwards compatibility - use getStripe() instead
export const stripe = null as Stripe | null

// Helper to format amount for display
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100)
}
