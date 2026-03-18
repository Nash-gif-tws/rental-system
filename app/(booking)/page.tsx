import Link from "next/link"
import { ChevronRight, Star, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #0c2340 40%, #0e3a5c 70%, #0f4c75 100%)",
        }}
      >
        {/* Subtle snow texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 text-white/90 text-xs font-medium px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
            2025 Snow Season — Now Booking
          </div>

          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Ski & snowboard hire,{" "}
              <span className="text-sky-400">done properly.</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
              Sydney's best-maintained rental fleet. Atomic skis, Burton boards, retail-quality outerwear.
              Pick up in Rockdale on the way to the Snowies.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold px-7 py-4 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-sky-900/40 hover:shadow-sky-500/30 hover:-translate-y-0.5"
              >
                Book Your Gear
                <ChevronRight className="h-4 w-4" />
              </Link>
              <a
                href="#packages"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold px-7 py-4 rounded-xl transition-all duration-200 text-sm"
              >
                View Packages
              </a>
            </div>

            {/* Discount pill */}
            <div className="mt-6 inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-xs font-medium px-4 py-2 rounded-full">
              <span>🏷️</span>
              Use code <span className="font-mono font-bold bg-emerald-400/20 px-1.5 py-0.5 rounded">ONLINE15</span> — save 15% when you book online
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap gap-x-8 gap-y-3">
            {[
              { value: "35+", label: "Years experience" },
              { value: "⭐ 4.8", label: "480+ Google reviews" },
              { value: "Atomic · Burton", label: "Premium brands only" },
              { value: "Rockdale, Sydney", label: "Perfect stop for Jindabyne" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-white font-bold text-sm">{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES ─────────────────────────────────────────────── */}
      <section id="packages" className="max-w-6xl mx-auto px-5 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sky-500 text-sm font-semibold uppercase tracking-wider mb-2">What we offer</p>
            <h2 className="text-3xl font-bold text-gray-900">Packages & gear</h2>
          </div>
          <Link href="/book" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-sky-500 hover:text-sky-600 transition-colors">
            Book now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <Link
              key={pkg.title}
              href="/book"
              className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-4">{pkg.emoji}</div>
              <h3 className="font-bold text-gray-900 mb-1">{pkg.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{pkg.desc}</p>
              <div className="flex items-center justify-between">
                <p className="text-sky-500 font-bold text-sm">From ${pkg.from}/day</p>
                <span className="text-xs text-gray-400 group-hover:text-sky-500 transition-colors flex items-center gap-1">
                  Book <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 2025 FLEET ───────────────────────────────────────────── */}
      <section className="bg-[#0f172a]">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <p className="text-sky-400 text-sm font-semibold uppercase tracking-wider mb-3">Our fleet</p>
              <h2 className="text-3xl font-bold text-white mb-4">
                One of Australia's newest rental fleets
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                We've invested heavily in our gear so you don't have to. Every season we refresh, upgrade, and maintain our stock to ensure you're riding quality equipment — not tired old rentals.
              </p>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
              >
                Browse & Book <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex-1 grid grid-cols-1 gap-4 w-full">
              {fleet.map((item) => (
                <div key={item.brand} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                    {item.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{item.brand}</p>
                    <p className="text-slate-400 text-sm mt-0.5">{item.desc}</p>
                    <span className="inline-block mt-2 text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-medium">{item.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEASON RENTALS ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="bg-gradient-to-br from-sky-500 to-sky-700 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">✨ New for 2025</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Season Rentals</h2>
            <p className="text-sky-100 max-w-lg mb-6 leading-relaxed">
              Heading up multiple times this season? Rent your gear for the full 3–4 months.
              Monthly payments, free tune-up included, and way better value than hiring every trip.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {["3–4 month season", "Monthly billing", "Free tune-up included", "Best value option"].map((f) => (
                <div key={f} className="bg-white/15 rounded-xl px-3 py-2.5 text-sm text-white font-medium text-center">
                  {f}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/book" className="bg-white text-sky-600 font-bold px-6 py-3 rounded-xl text-sm hover:bg-sky-50 transition-colors">
                Book a Season Rental
              </Link>
              <a href="tel:0295973422" className="border border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/10 transition-colors">
                Call us to discuss
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="text-center mb-12">
            <p className="text-sky-500 text-sm font-semibold uppercase tracking-wider mb-2">Simple process</p>
            <h2 className="text-3xl font-bold text-gray-900">Book in under 2 minutes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm shadow-lg shadow-sky-200 hover:-translate-y-0.5"
            >
              Start Booking — Save 15% Online <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />)}
          </div>
          <p className="text-2xl font-bold text-gray-900">4.8 out of 5</p>
          <p className="text-gray-500 text-sm mt-1">Based on 480+ Google reviews</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">"{r.review}"</p>
              <p className="text-xs font-semibold text-gray-500">{r.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-5 py-20">
          <div className="text-center mb-10">
            <p className="text-sky-500 text-sm font-semibold uppercase tracking-wider mb-2">Got questions?</p>
            <h2 className="text-3xl font-bold text-gray-900">Frequently asked</h2>
          </div>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-semibold text-sm text-gray-900 hover:text-sky-600 transition-colors">
                  {q}
                  <svg
                    className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="bg-[#0f172a] rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "32px 32px" }}
          />
          <div className="relative">
            <p className="text-sky-400 text-sm font-semibold uppercase tracking-wider mb-3">Ready to shred?</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Book your gear today
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Over 35 years fitting Australians for the mountain. Pickup from Rockdale, Sydney — perfectly placed for Perisher, Thredbo & Falls Creek.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold px-10 py-4 rounded-xl transition-all text-sm hover:-translate-y-0.5 shadow-lg shadow-sky-900/40"
            >
              Book Now — Save 15% Online <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

const packages = [
  { emoji: "🎿", title: "Adult Ski Package", desc: "Atomic skis, ski boots & poles. Refreshed fleet, sharp edges, fitted by our experts.", from: 55 },
  { emoji: "🏂", title: "Adult Snowboard Package", desc: "Burton boards & boots, brand new 2024 fleet. Beginner through to advanced.", from: 60 },
  { emoji: "👶", title: "Junior Packages", desc: "Properly fitted kids ski & snowboard packages. Ski from $40/day, snowboard from $45/day.", from: 40 },
  { emoji: "🥾", title: "Boots Only", desc: "Ski or snowboard boots individually. Perfect if you have your own board or skis.", from: 20 },
  { emoji: "🧥", title: "Snow Clothing", desc: "Retail-quality Burton jackets & pants. 70%+ of our 2025 outerwear range freshly upgraded.", from: 20 },
  { emoji: "🪖", title: "Helmets & Goggles", desc: "Safety gear to complete your kit. Helmets from $15/day, goggles from $10/day.", from: 10 },
]

const fleet = [
  { emoji: "🎿", brand: "Atomic Rental Skis", desc: "Completely refreshed for 2023. Tuned edges, fast bases, fitted properly.", badge: "Refreshed 2023" },
  { emoji: "🏂", brand: "Burton Rental Snowboards", desc: "Brand new fleet introduced for 2024. All levels catered for.", badge: "New 2024" },
  { emoji: "🧥", brand: "Burton Outerwear", desc: "70%+ of our clothing range upgraded to retail-quality Burton gear for adults & kids.", badge: "Upgraded 2025" },
]

const steps = [
  { num: "1", title: "Book online", desc: "Choose your dates, pick your gear, enter your details. Takes under 2 minutes. Save 15% with code ONLINE15." },
  { num: "2", title: "Pick up in Rockdale", desc: "Come into our store before your trip. Our team will fit you properly — not just hand you a bag." },
  { num: "3", title: "Hit the mountain", desc: "Drive to Perisher, Thredbo or Falls Creek knowing you're riding quality gear." },
]

const reviews = [
  { name: "Sarah M.", review: "Amazing service, super helpful staff who made sure everything fitted perfectly. Will definitely be back next season." },
  { name: "James T.", review: "Best gear hire experience I've had. The Burton boards were genuinely good quality, not the beaten-up stuff you get elsewhere." },
  { name: "Priya K.", review: "Booked online, picked up, done. Staff were brilliant with our kids and made sure they were safe and comfortable." },
]

const faqs = [
  { q: "What do I need to bring when picking up?", a: "A valid ID and a credit card for the security deposit. Parents or guardians must be present for anyone under 18 to sign the rental agreement." },
  { q: "How far in advance should I book?", a: "As early as possible — especially during school holidays. We take bookings up to 6 months ahead. Popular sizes sell out fast during peak periods." },
  { q: "Can I swap gear if it doesn't feel right?", a: "Yes. If something doesn't feel right, you can exchange in-store within the first day, subject to availability. Our team will re-fit you properly." },
  { q: "What are Season Rentals?", a: "Hire your gear for the entire 3–4 month snow season. Billed monthly over 4 payments (first month upfront). Includes a free tune-up mid-season." },
  { q: "Do you offer discounts for longer rentals?", a: "Yes — pricing automatically adjusts based on duration. The longer you hire, the better the daily rate. Discounts apply from 5 days." },
  { q: "When do I pay?", a: "Payment is collected in store at pickup. We accept cash, card, and EFTPOS. No payment required to make an online booking." },
  { q: "What if equipment is damaged?", a: "Normal wear and tear is expected. Significant damage or loss will be charged fairly to cover repair or replacement. We'll always discuss this with you first." },
]
