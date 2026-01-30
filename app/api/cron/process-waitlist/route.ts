import { NextResponse } from "next/server"
import { processExpiredWaitlistNotifications } from "@/lib/actions/waitlist"

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// Set up in vercel.json with a schedule like "*/5 * * * *" (every 5 minutes)

export async function GET(request: Request) {
  // Verify cron secret (optional but recommended for security)
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await processExpiredWaitlistNotifications()
    
    return NextResponse.json({
      success: true,
      processed: result.processed || 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron process waitlist error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Also allow POST for manual triggers
export async function POST(request: Request) {
  return GET(request)
}
