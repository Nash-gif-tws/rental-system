import { Snowflake } from "lucide-react"
import Link from "next/link"

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-sky-600 p-2 rounded-xl">
              <Snowflake className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight text-sm">Trojan Snow Skiers Warehouse</p>
              <p className="text-xs text-gray-500">Equipment Rentals · Rockdale, Sydney</p>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-4 text-right">
            <a href="tel:0295973422" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
              (02) 9597 3422
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center space-y-1">
          <p className="text-xs text-gray-500">
            Trojan Snow Skiers Warehouse · Princes Highway, Rockdale NSW · <a href="tel:0295973422" className="hover:text-gray-700">(02) 9597 3422</a>
          </p>
          <p className="text-xs text-gray-400">
            <a href="mailto:info@snowskierswarehouse.com.au" className="hover:text-gray-600">info@snowskierswarehouse.com.au</a>
            {" · "}
            <a href="https://snowskierswarehouse.com.au" className="hover:text-gray-600">snowskierswarehouse.com.au</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
