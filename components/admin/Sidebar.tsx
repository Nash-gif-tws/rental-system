"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  Users,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
  ScanLine,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/scan", label: "Scan / Check Out", icon: ScanLine },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/products", label: "Products & Pricing", icon: Wrench },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-[#0d0d0d] border-r border-[#2a2a2a] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#2a2a2a]">
        <p className="font-display text-lg font-bold tracking-widest text-white uppercase leading-none">
          TROJAN
        </p>
        <p className="text-[10px] tracking-[0.2em] text-[#B4B4B4] uppercase mt-0.5">
          Rental Manager
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-[#C8FF00] text-[#121212]"
                  : "text-[#B4B4B4] hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[#2a2a2a]">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? user?.email}</p>
            <p className="text-xs text-[#B4B4B4] truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="ml-2 p-1.5 rounded hover:bg-white/10 text-[#B4B4B4] hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
