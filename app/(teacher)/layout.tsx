import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardNav } from "@/components/layout/dashboard-nav"

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    redirect("/app")
  }

  // Get teacher profile
  const profile = await db.teacherProfile.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <div className="min-h-screen bg-tempo-creme">
      <DashboardNav role="TEACHER" userName={profile?.displayName || session.user.email || undefined} />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
