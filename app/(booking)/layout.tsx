import Link from "next/link"

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="font-bold text-gray-900 text-sm block">Snowskiers Warehouse</span>
              <span className="text-[11px] text-gray-400 block -mt-0.5">Rockdale, Sydney</span>
            </div>
          </Link>
          <div className="flex items-center gap-5">
            <a href="tel:0295973422" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden sm:block transition-colors">
              (02) 9597 3422
            </a>
            <Link
              href="/book"
              className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white mt-24">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-sky-500 rounded-md flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="font-bold text-sm">Snowskiers Warehouse</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Sydney's most trusted ski & snowboard rental store. Over 35 years fitting Australians for the mountain.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Contact</p>
              <div className="space-y-2 text-sm text-slate-400">
                <p><a href="tel:0295973422" className="hover:text-white transition-colors">(02) 9597 3422</a></p>
                <p><a href="mailto:info@snowskierswarehouse.com.au" className="hover:text-white transition-colors">info@snowskierswarehouse.com.au</a></p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Visit Us</p>
              <div className="space-y-1 text-sm text-slate-400">
                <p>Princes Highway, Rockdale NSW</p>
                <p>Open 7 days · Snow season</p>
                <p className="text-slate-500 text-xs mt-2">On the way to Jindabyne →</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-500">
            <p>© 2025 Trojan Snow Skiers Warehouse. All rights reserved.</p>
            <a href="https://snowskierswarehouse.com.au" className="hover:text-slate-300 transition-colors">snowskierswarehouse.com.au ↗</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
