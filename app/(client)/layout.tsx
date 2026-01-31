import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardNav } from "@/components/layout/dashboard-nav"

export const dynamic = 'force-dynamic'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Get user profile
  const profile = await db.clientProfile.findUnique({
    where: { userId: session.user.id },
  })

  const userName = profile 
    ? `${profile.firstName} ${profile.lastName}` 
    : session.user.email

  return (
    <div className="min-h-screen bg-tempo-creme">
      <DashboardNav role="CLIENT" userName={userName || undefined} />
      <main className="pt-16 px-4 pb-8 md:pt-0 md:ml-64 md:p-8">
        {children}
      </main>
    </div>
  )
}
