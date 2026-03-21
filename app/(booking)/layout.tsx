"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"

const FAQS = [
  {
    q: "Do I need to pay online?",
    a: "No payment required to book. Pay by cash, card, or EFTPOS when you pick up in store.",
  },
  {
    q: "What if the gear doesn't fit?",
    a: "No problem — we swap it same-day at no extra cost. Our staff are experienced fitters and we'll get you sorted before you leave.",
  },
  {
    q: "Can I cancel my booking?",
    a: "Yes, free cancellation any time before pickup. Just give us a call on (02) 9597 3422 and we'll sort it.",
  },
  {
    q: "What's included in a ski/snowboard package?",
    a: "Ski packages include skis, boots, and poles. Snowboard packages include a board and boots. Outerwear is sold separately unless you book an outerwear package.",
  },
  {
    q: "Do you have kids' gear?",
    a: "Yes — we stock a full range of kids' skis, snowboards, boots, and outerwear. Book a Kids Ski Package or Kids Snowboard Package from the equipment step.",
  },
  {
    q: "What if I damage the equipment?",
    a: "Normal wear and tear is on us. Accidental damage is discussed case-by-case — we're reasonable about it. No surprises.",
  },
  {
    q: "Where are you located?",
    a: "Princes Highway, Rockdale NSW — right on the way to Thredbo and Perisher. Open 7 days during snow season.",
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="max-w-2xl mx-auto px-5 pb-16">
      <div className="border-t border-white/[0.06] pt-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6" style={{ color: "#C4A04A" }}>Common questions</p>
        <div className="space-y-1">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className="border border-[#2e2e2e] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors gap-3"
              >
                <p className="text-sm font-semibold text-white">{q}</p>
                <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} style={{ color: "#9a9a9a" }} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 border-t border-[#2e2e2e]">
                  <p className="text-sm text-[#B4B4B4] leading-relaxed pt-3">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-[#555] mt-6 text-center">
          Still got questions? Call us on{" "}
          <a href="tel:0295973422" className="text-[#C4A04A] hover:text-white transition-colors">(02) 9597 3422</a>
        </p>
      </div>
    </div>
  )
}

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
            className="font-body text-xs tracking-[0.15em] uppercase font-semibold px-5 py-2.5 transition-colors duration-200" style={{ background: "#C4A04A", color: "#0C0D11" }}
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
      <FAQ />

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
                <span className="w-6 h-px bg-[#C4A04A]" />
                <span className="font-body text-[10px] text-[#C4A04A] tracking-[0.25em] uppercase">Trojan Wake Ski Snow</span>
              </div>
            </div>

            {/* Nav links */}
            <div>
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#C4A04A] mb-5">Explore</p>
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
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-[#C4A04A] mb-5">Contact</p>
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
