import { Snowflake } from "lucide-react"
import Link from "next/link"

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-sky-600 p-2 rounded-xl">
            <Snowflake className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-tight">Snowskiers Warehouse</p>
            <p className="text-xs text-gray-500">Equipment Rentals</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500">Need help?</p>
            <a href="tel:0295973422" className="text-sm font-medium text-sky-600">(02) 9597 3422</a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
          Snowskiers Warehouse · Rockdale, Sydney · snowskierswarehouse.com.au
        </div>
      </footer>
    </div>
  )
}
