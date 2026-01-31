import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardNav } from "@/components/layout/dashboard-nav"

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/app")
  }

  return (
    <div className="min-h-screen bg-tempo-creme">
      <DashboardNav role="ADMIN" userName={session.user.email || undefined} />
      <main className="pt-16 px-4 pb-8 md:pt-0 md:ml-64 md:p-8">
        {children}
      </main>
    </div>
  )
}
