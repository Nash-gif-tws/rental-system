"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Packages", href: "/#packages" },
  { label: "Our Fleet", href: "/#fleet" },
  { label: "How It Works", href: "/#how" },
  { label: "Reviews", href: "/#reviews" },
  { label: "FAQ", href: "/#faq" },
]

function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#121212]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="leading-tight">
            <span className="font-display text-white text-base font-bold tracking-[0.15em] block leading-none">
              SNOWSKIERS WAREHOUSE
            </span>
            <span className="font-body text-[9px] text-[#B4B4B4] tracking-[0.3em] uppercase block mt-0.5">
              Est. 1984 · Rockdale, Sydney
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-body text-xs tracking-[0.15em] uppercase text-[#B4B4B4] hover:text-white transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <a
            href="tel:0295973422"
            className="hidden lg:block font-body text-xs text-[#B4B4B4] hover:text-white transition-colors tracking-wide"
          >
            (02) 9597 3422
          </a>
          <Link
            href="/book"
            className="font-body text-xs tracking-[0.15em] uppercase bg-[#C8FF00] hover:bg-[#b3e600] text-[#121212] font-semibold px-5 py-2.5 transition-colors duration-200"
          >
            Book Now
          </Link>
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1 text-[#B4B4B4] hover:text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#121212]">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block font-body text-sm tracking-[0.12em] uppercase text-[#B4B4B4] hover:text-white py-2.5 border-b border-white/[0.04] transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="tel:0295973422"
              className="block font-body text-sm text-[#B4B4B4] hover:text-white py-2.5 transition-colors"
            >
              (02) 9597 3422
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#121212]">
      <Nav />

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
            {/* Brand */}
            <div className="lg:col-span-2">
              <p className="font-display text-white font-bold tracking-[0.15em] text-lg mb-1">SNOWSKIERS WAREHOUSE</p>
              <p className="font-body text-[9px] text-[#B4B4B4] tracking-[0.3em] uppercase mb-5">Est. 1984 · Rockdale, NSW</p>
              <p className="font-body text-sm text-[#B4B4B4] leading-relaxed max-w-xs">
                Sydney's most trusted ski & snowboard rental store. Over 35 years fitting Australians for the mountain.
              </p>
              <div className="flex items-center gap-2 mt-6">
                <span className="w-6 h-px bg-[#C8FF00]" />
                <span className="font-body text-[10px] text-[#C8FF00] tracking-[0.25em] uppercase">Trojan Wake Ski Snow</span>
              </div>
            </div>

            {/* Nav links */}
            <div>
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#C8FF00] mb-5">Explore</p>
              <div className="space-y-3">
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href} className="block font-body text-sm text-[#B4B4B4] hover:text-white transition-colors">
                    {l.label}
                  </a>
                ))}
                <Link href="/book" className="block font-body text-sm text-[#B4B4B4] hover:text-white transition-colors">
                  Book Now
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#C8FF00] mb-5">Contact</p>
              <div className="space-y-3 font-body text-sm text-[#B4B4B4]">
                <p>
                  <a href="tel:0295973422" className="hover:text-white transition-colors">(02) 9597 3422</a>
                </p>
                <p>
                  <a href="mailto:info@snowskierswarehouse.com.au" className="hover:text-white transition-colors break-all">
                    info@snowskierswarehouse.com.au
                  </a>
                </p>
                <div className="pt-2 space-y-1 text-[#B4B4B4]">
                  <p>Princes Highway, Rockdale NSW</p>
                  <p>Open 7 days · Snow season</p>
                  <p className="text-xs text-[#B4B4B4]/50 mt-2">On your way to Jindabyne →</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row justify-between gap-3 font-body text-xs text-[#B4B4B4]/40">
            <p>© 2025 Trojan Snow Skiers Warehouse Pty Ltd. All rights reserved.</p>
            <a href="https://snowskierswarehouse.com.au" className="hover:text-[#B4B4B4] transition-colors">
              snowskierswarehouse.com.au ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
