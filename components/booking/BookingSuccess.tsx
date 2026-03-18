import { format } from "date-fns"

export default function BookingSuccess({ booking }: { booking: any }) {
  return (
    <div className="max-w-lg mx-auto px-5 py-10 space-y-6">
      {/* Hero */}
      <div className="text-center space-y-4 py-6">
        <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center text-4xl mx-auto">
          🎿
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">You're all set!</h1>
          <p className="text-gray-500 text-sm mt-2">
            Thanks {booking.customer.firstName} — your booking is confirmed and we'll have your gear ready.
          </p>
        </div>
      </div>

      {/* Booking ref */}
      <div className="bg-[#0f172a] rounded-2xl p-6 text-center">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Booking Reference</p>
        <p className="text-3xl font-bold text-white font-mono tracking-wider">{booking.bookingNumber}</p>
        <p className="text-slate-500 text-xs mt-2">Screenshot this · Bring it when you pick up</p>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        <div className="flex items-start gap-3 p-5">
          <span className="text-xl">📅</span>
          <div>
            <p className="font-bold text-gray-900 text-sm">Rental Period</p>
            <p className="text-sm text-gray-600 mt-0.5">
              {format(new Date(booking.startDate), "EEEE d MMMM")} → {format(new Date(booking.endDate), "EEEE d MMMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-5">
          <span className="text-xl">📍</span>
          <div>
            <p className="font-bold text-gray-900 text-sm">Pickup & Return</p>
            <p className="text-sm text-gray-600 mt-0.5">Trojan Snow Skiers Warehouse</p>
            <p className="text-sm text-gray-400">Princes Highway, Rockdale NSW · Open 7 days</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-5">
          <span className="text-xl">💳</span>
          <div>
            <p className="font-bold text-gray-900 text-sm">Payment</p>
            <p className="text-sm text-gray-500 mt-0.5">Collected in store at pickup. Cash, card or EFTPOS.</p>
          </div>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5">
        <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-3">What happens next</p>
        <div className="space-y-2.5">
          {[
            "Our team prepares your gear based on your fitting details",
            "Come in on your pickup date with this booking ref and valid ID",
            "We'll fit you, take payment, and you're off to the mountain 🏔️",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-sky-900">
              <div className="w-5 h-5 bg-sky-200 text-sky-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="text-center space-y-2 text-sm">
        <p className="text-gray-500">Need to change something?</p>
        <div className="flex justify-center gap-4">
          <a href="tel:0295973422" className="font-semibold text-sky-500 hover:text-sky-600 transition-colors">
            (02) 9597 3422
          </a>
          <span className="text-gray-300">·</span>
          <a href="mailto:info@snowskierswarehouse.com.au" className="font-semibold text-sky-500 hover:text-sky-600 transition-colors">
            Email us
          </a>
        </div>
      </div>

      <div className="text-center">
        <a href="/book" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Make another booking →
        </a>
      </div>
    </div>
  )
}
