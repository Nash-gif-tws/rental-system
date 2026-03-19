import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Sidebar from "@/components/admin/Sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/admin/login")

  return (
    <div className="flex h-screen bg-[#121212]">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
