import { format } from "date-fns"

export default function BookingSuccess({ booking }: { booking: any }) {
  return (
    <div className="max-w-lg mx-auto px-5 pt-28 pb-16 space-y-6">
      {/* Hero */}
      <div className="text-center space-y-4 py-6">
        <div className="w-20 h-20 bg-[#C4A04A]/10 border-2 border-[#C4A04A]/30 rounded-full flex items-center justify-center text-4xl mx-auto">
          🎿
        </div>
        <div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-8 h-px bg-[#C4A04A]" />
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C4A04A]">Booking confirmed</span>
            <span className="w-8 h-px bg-[#C4A04A]" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">You're all set!</h1>
          <p className="text-[#B4B4B4] text-sm mt-2">
            Thanks {booking.customer.firstName} — your booking is confirmed and we'll have your gear ready.
          </p>
        </div>
      </div>

      {/* Booking ref */}
      <div className="bg-[#1e1e1e] border border-[#C4A04A]/30 rounded-xl p-6 text-center">
        <p className="text-[#B4B4B4] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Booking Reference</p>
        <p className="text-3xl font-bold text-[#C4A04A] font-mono tracking-wider">{booking.bookingNumber}</p>
        <p className="text-[#B4B4B4]/50 text-xs mt-2">Screenshot this · Bring it when you pick up</p>
      </div>

      {/* Details */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl divide-y divide-[#2e2e2e]">
        <div className="flex items-start gap-3 p-5">
          <span className="text-xl">📅</span>
          <div>
            <p className="font-bold text-white text-sm">Rental Period</p>
            <p className="text-sm text-[#B4B4B4] mt-0.5">
              {format(new Date(booking.startDate), "EEEE d MMMM")} → {format(new Date(booking.endDate), "EEEE d MMMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-5">
          <span className="text-xl">📍</span>
          <div>
            <p className="font-bold text-white text-sm">Pickup & Return</p>
            <p className="text-sm text-[#B4B4B4] mt-0.5">Trojan Snow Skiers Warehouse</p>
            <p className="text-sm text-[#B4B4B4]/50">Princes Highway, Rockdale NSW · Open 7 days</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-5">
          <span className="text-xl">💳</span>
          <div>
            <p className="font-bold text-white text-sm">Payment</p>
            <p className="text-sm text-[#B4B4B4] mt-0.5">Collected in store at pickup. Cash, card or EFTPOS.</p>
          </div>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5">
        <p className="text-[10px] font-bold text-[#C4A04A] uppercase tracking-[0.25em] mb-4">What happens next</p>
        <div className="space-y-3">
          {[
            "Our team prepares your gear based on your fitting details",
            "Come in on your pickup date with this booking ref and valid ID",
            "We'll fit you, take payment, and you're off to the mountain 🏔️",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-[#B4B4B4]">
              <div className="w-5 h-5 bg-[#C4A04A] text-[#121212] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="text-center space-y-2 text-sm">
        <p className="text-[#B4B4B4]">Need to change something?</p>
        <div className="flex justify-center gap-4">
          <a href="tel:0295973422" className="font-semibold text-[#C4A04A] hover:text-[#d4b565] transition-colors">
            (02) 9597 3422
          </a>
          <span className="text-[#2e2e2e]">·</span>
          <a href="mailto:info@snowskierswarehouse.com.au" className="font-semibold text-[#C4A04A] hover:text-[#d4b565] transition-colors">
            Email us
          </a>
        </div>
      </div>

      <div className="text-center">
        <a href="/book" className="text-sm text-[#B4B4B4]/50 hover:text-[#B4B4B4] transition-colors">
          Make another booking →
        </a>
      </div>
    </div>
  )
}
