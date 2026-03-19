import Link from "next/link"

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#F2EDE4]/8 bg-[#0D0D0D]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Snowflake mark */}
            <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7 text-[#C4973A]" stroke="currentColor" strokeWidth="1.5">
              <line x1="16" y1="2" x2="16" y2="30" />
              <line x1="2" y1="16" x2="30" y2="16" />
              <line x1="6.1" y1="6.1" x2="25.9" y2="25.9" />
              <line x1="25.9" y1="6.1" x2="6.1" y2="25.9" />
              <circle cx="16" cy="16" r="3" fill="currentColor" stroke="none" />
            </svg>
            <div className="leading-tight">
              <span className="font-display text-[#F2EDE4] text-lg tracking-wide block leading-none">SNOWSKIERS WAREHOUSE</span>
              <span className="font-body text-[10px] text-[#F2EDE4]/40 tracking-[0.2em] uppercase block mt-0.5">Rockdale, Sydney</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <a
              href="tel:0295973422"
              className="hidden sm:block font-body text-sm text-[#F2EDE4]/50 hover:text-[#F2EDE4] transition-colors tracking-wide"
            >
              (02) 9597 3422
            </a>
            <Link
              href="/book"
              className="font-body text-xs tracking-[0.15em] uppercase bg-[#3A8EE6] hover:bg-[#5AA5FF] text-white px-5 py-2.5 transition-colors duration-200"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#F2EDE4]/8 mt-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6 text-[#C4973A]" stroke="currentColor" strokeWidth="1.5">
                  <line x1="16" y1="2" x2="16" y2="30" />
                  <line x1="2" y1="16" x2="30" y2="16" />
                  <line x1="6.1" y1="6.1" x2="25.9" y2="25.9" />
                  <line x1="25.9" y1="6.1" x2="6.1" y2="25.9" />
                  <circle cx="16" cy="16" r="3" fill="currentColor" stroke="none" />
                </svg>
                <span className="font-display text-[#F2EDE4] tracking-wide">SNOWSKIERS WAREHOUSE</span>
              </div>
              <p className="font-editorial italic text-[#F2EDE4]/40 text-sm leading-relaxed">
                Sydney's most trusted ski & snowboard rental store. Over 35 years fitting Australians for the mountain.
              </p>
            </div>

            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C4973A] mb-5">Contact</p>
              <div className="space-y-2 font-body text-sm text-[#F2EDE4]/40">
                <p><a href="tel:0295973422" className="hover:text-[#F2EDE4] transition-colors">(02) 9597 3422</a></p>
                <p><a href="mailto:info@snowskierswarehouse.com.au" className="hover:text-[#F2EDE4] transition-colors">info@snowskierswarehouse.com.au</a></p>
              </div>
            </div>

            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C4973A] mb-5">Visit Us</p>
              <div className="space-y-1 font-body text-sm text-[#F2EDE4]/40">
                <p>Princes Highway, Rockdale NSW</p>
                <p>Open 7 days · Snow season</p>
                <p className="text-[#F2EDE4]/25 text-xs mt-3 tracking-wide">On the way to Jindabyne →</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#F2EDE4]/8 pt-8 flex flex-col sm:flex-row justify-between gap-3 font-body text-xs text-[#F2EDE4]/25">
            <p>© 2025 Trojan Snow Skiers Warehouse. All rights reserved.</p>
            <a href="https://snowskierswarehouse.com.au" className="hover:text-[#F2EDE4]/50 transition-colors">snowskierswarehouse.com.au ↗</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
