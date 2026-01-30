import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardNav } from "@/components/layout/dashboard-nav"

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
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
