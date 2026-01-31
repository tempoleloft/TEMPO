/**
 * Rate Limiter pour protéger les endpoints sensibles
 * 
 * Cette implémentation utilise un stockage en mémoire qui fonctionne pour :
 * - Le développement local
 * - Les déploiements avec un seul serveur
 * 
 * IMPORTANT pour la production sur Vercel (serverless) :
 * Pour une protection robuste en production, utilisez Upstash Redis :
 * 1. npm install @upstash/ratelimit @upstash/redis
 * 2. Créez un compte sur upstash.com
 * 3. Remplacez cette implémentation par celle d'Upstash
 * 
 * Exemple avec Upstash :
 * import { Ratelimit } from "@upstash/ratelimit"
 * import { Redis } from "@upstash/redis"
 * const ratelimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(5, "60 s"),
 * })
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Stockage en mémoire des tentatives
const rateLimitStore = new Map<string, RateLimitEntry>()

// Nettoyage périodique des entrées expirées (toutes les 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupExpiredEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  
  lastCleanup = now
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}

export interface RateLimitConfig {
  /** Nombre maximum de requêtes autorisées */
  maxRequests: number
  /** Fenêtre de temps en secondes */
  windowSeconds: number
}

export interface RateLimitResult {
  /** Si la requête est autorisée */
  success: boolean
  /** Nombre de requêtes restantes */
  remaining: number
  /** Timestamp de réinitialisation */
  resetAt: number
  /** Temps d'attente en secondes si bloqué */
  retryAfter?: number
}

/**
 * Vérifie si une requête est autorisée selon le rate limit
 * 
 * @param identifier - Identifiant unique (IP, userId, email, etc.)
 * @param config - Configuration du rate limit
 * @returns Résultat du rate limit
 * 
 * @example
 * const result = await rateLimit("user@email.com", { maxRequests: 5, windowSeconds: 60 })
 * if (!result.success) {
 *   return { error: `Trop de tentatives. Réessayez dans ${result.retryAfter} secondes.` }
 * }
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Nettoyer les entrées expirées périodiquement
  cleanupExpiredEntries()

  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = `ratelimit:${identifier}`

  const existing = rateLimitStore.get(key)

  // Si pas d'entrée ou entrée expirée, créer une nouvelle
  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs
    rateLimitStore.set(key, { count: 1, resetAt })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt,
    }
  }

  // Incrémenter le compteur
  existing.count++
  rateLimitStore.set(key, existing)

  // Vérifier si la limite est dépassée
  if (existing.count > config.maxRequests) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000)
    return {
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfter,
    }
  }

  return {
    success: true,
    remaining: config.maxRequests - existing.count,
    resetAt: existing.resetAt,
  }
}

/**
 * Configurations prédéfinies pour différents cas d'usage
 */
export const RATE_LIMITS = {
  /** Connexion : 5 tentatives par minute */
  LOGIN: { maxRequests: 5, windowSeconds: 60 },
  
  /** Inscription : 3 tentatives par minute */
  REGISTER: { maxRequests: 3, windowSeconds: 60 },
  
  /** Réinitialisation mot de passe : 3 tentatives par heure */
  PASSWORD_RESET: { maxRequests: 3, windowSeconds: 3600 },
  
  /** Paiement : 10 tentatives par minute */
  CHECKOUT: { maxRequests: 10, windowSeconds: 60 },
  
  /** API générique : 100 requêtes par minute */
  API_GENERIC: { maxRequests: 100, windowSeconds: 60 },
} as const

/**
 * Extrait l'adresse IP d'une requête
 * Fonctionne avec Vercel, Cloudflare, et en local
 */
export function getClientIP(request: Request): string {
  // Headers courants pour les proxies
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }

  // Cloudflare
  const cfConnectingIP = request.headers.get("cf-connecting-ip")
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback
  return "unknown"
}
