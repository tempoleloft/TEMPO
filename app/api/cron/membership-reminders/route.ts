import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendMembershipRenewalReminderEmail } from "@/lib/email"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify cron secret (for Vercel Cron or manual trigger)
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  
  // Allow if no secret is set (dev mode) or if secret matches
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Find memberships renewing in ~48 hours (between 47 and 49 hours from now)
    const now = new Date()
    const in47Hours = new Date(now.getTime() + 47 * 60 * 60 * 1000)
    const in49Hours = new Date(now.getTime() + 49 * 60 * 60 * 1000)

    const membershipsToRemind = await db.membership.findMany({
      where: {
        status: "ACTIVE",
        cancelAtPeriodEnd: false, // Don't remind if already cancelling
        plan: {
          renewalType: "AUTO", // Only for auto-renewing memberships
        },
        currentPeriodEnd: {
          gte: in47Hours,
          lte: in49Hours,
        },
      },
      include: {
        user: {
          include: { clientProfile: true },
        },
        plan: true,
      },
    })

    console.log(`Found ${membershipsToRemind.length} memberships to remind`)

    let sentCount = 0
    let errorCount = 0

    for (const membership of membershipsToRemind) {
      const firstName = membership.user.clientProfile?.firstName || 
                       membership.user.name?.split(" ")[0] || 
                       "Membre"

      const result = await sendMembershipRenewalReminderEmail(
        membership.user.email,
        firstName,
        membership.plan.name,
        membership.currentPeriodEnd,
        membership.plan.priceCentsPerMonth
      )

      if (result.success) {
        sentCount++
        console.log(`Renewal reminder sent to ${membership.user.email}`)
      } else {
        errorCount++
        console.error(`Failed to send reminder to ${membership.user.email}:`, result.error)
      }
    }

    return NextResponse.json({
      success: true,
      found: membershipsToRemind.length,
      sent: sentCount,
      errors: errorCount,
    })
  } catch (error) {
    console.error("Error in membership reminders cron:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
