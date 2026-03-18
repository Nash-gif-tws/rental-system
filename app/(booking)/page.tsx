import Link from "next/link"
import { Snowflake, ChevronRight, MapPin, Clock, CreditCard } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-4 py-2 rounded-full text-sm font-medium">
          <Snowflake className="h-4 w-4" />
          2025 Snow Season
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Rent your ski & snowboard gear
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Quality equipment from Sydney's most trusted snow sports store. Pick up in Rockdale before you hit the mountain.
        </p>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 bg-sky-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-sky-700 transition-colors"
        >
          Book Now
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <MapPin className="h-6 w-6 text-sky-600 mx-auto mb-2" />
          <p className="font-semibold text-gray-900">Pickup in store</p>
          <p className="text-sm text-gray-500 mt-1">Rockdale, Sydney — easy access before your trip</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <CreditCard className="h-6 w-6 text-sky-600 mx-auto mb-2" />
          <p className="font-semibold text-gray-900">Pay in store</p>
          <p className="text-sm text-gray-500 mt-1">Cash, card or EFTPOS when you collect your gear</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <Clock className="h-6 w-6 text-sky-600 mx-auto mb-2" />
          <p className="font-semibold text-gray-900">Book ahead</p>
          <p className="text-sm text-gray-500 mt-1">Reserve online and skip the queue</p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-900 rounded-2xl p-8 text-center text-white">
        <h2 className="text-xl font-bold mb-2">Ready to hit the slopes?</h2>
        <p className="text-slate-400 text-sm mb-6">Book your gear online in under 2 minutes.</p>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 bg-sky-600 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-sky-500 transition-colors"
        >
          Start Booking <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
