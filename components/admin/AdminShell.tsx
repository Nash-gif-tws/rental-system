"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import Sidebar from "./Sidebar"

export default function AdminShell({
  user,
  children,
}: {
  user: any
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#121212]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — hidden off-screen on mobile, always visible on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar user={user} onClose={() => setMobileOpen(false)} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-[#0d0d0d] border-b border-[#2a2a2a]">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 rounded-lg text-[#B4B4B4] hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-display text-sm font-bold tracking-widest text-white uppercase leading-none">
            TROJAN
          </p>
          <p className="text-[10px] tracking-[0.2em] text-[#B4B4B4] uppercase">Rental Manager</p>
        </div>

        <main className="flex-1" id="main-content">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
