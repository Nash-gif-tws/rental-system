import Link from "next/link"
import { Snowflake, ChevronRight, MapPin, Clock, Star, Shield, Wrench, Phone, Mail, ChevronDown } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-10">

      {/* Discount Banner */}
      <div className="bg-sky-600 text-white rounded-2xl px-6 py-4 text-center">
        <p className="font-bold text-lg">Book online & save 15%</p>
        <p className="text-sky-100 text-sm mt-0.5">
          Use code <span className="font-mono font-bold bg-sky-500 px-2 py-0.5 rounded">ONLINE15</span> at checkout · Applied automatically when you book online
        </p>
      </div>

      {/* Hero */}
      <div className="text-center space-y-5 py-4">
        <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-4 py-2 rounded-full text-sm font-semibold">
          <Snowflake className="h-4 w-4" />
          2025 Snow Season — Now Open
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          Snowboard, Ski &<br />Snow Gear Hire in Sydney
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
          Whether you ski or snowboard once a year or every weekend, you deserve the best gear.
          Trojan Snow Skiers Warehouse offers one of the <strong className="text-gray-700">newest and best-maintained rental fleets in Australia</strong> — with expert fitting to match.
        </p>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 bg-sky-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-sky-700 transition-colors shadow-lg shadow-sky-200"
        >
          Book Your Gear Now
          <ChevronRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-gray-400">Takes less than 2 minutes · Pay in store</p>
      </div>

      {/* Fleet highlights */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        <h2 className="font-bold text-lg mb-4">Our 2025 Fleet</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-sky-400 text-xs font-semibold uppercase tracking-wide mb-1">Skis</p>
            <p className="font-semibold">Atomic Rental Skis</p>
            <p className="text-slate-400 text-sm mt-1">Completely refreshed for 2023 — sharp edges, fast bases</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-sky-400 text-xs font-semibold uppercase tracking-wide mb-1">Snowboards</p>
            <p className="font-semibold">Burton Rental Boards</p>
            <p className="text-slate-400 text-sm mt-1">Brand new fleet for 2024 — perfect for all levels</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-sky-400 text-xs font-semibold uppercase tracking-wide mb-1">Outerwear</p>
            <p className="font-semibold">Burton Clothing</p>
            <p className="text-slate-400 text-sm mt-1">70%+ of our 2025 range upgraded to retail-quality Burton gear</p>
          </div>
        </div>
        <p className="text-slate-400 text-xs mt-4">
          Demo gear also available · Volkl · Salomon · Burton · Capita · and more
        </p>
      </div>

      {/* Why us */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Top-Quality Gear, Expert Service,<br />and Unbeatable Convenience</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4">
            <div className="bg-sky-50 rounded-xl p-2.5 h-fit">
              <Star className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">35+ Years Experience</p>
              <p className="text-sm text-gray-500 mt-1">Our team has firsthand experience with every product we stock — real advice from real riders.</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4">
            <div className="bg-sky-50 rounded-xl p-2.5 h-fit">
              <MapPin className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Perfect Location</p>
              <p className="text-sm text-gray-500 mt-1">On Princes Highway in Rockdale — the ideal stop on your way to Jindabyne and the Snowy Mountains.</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4">
            <div className="bg-sky-50 rounded-xl p-2.5 h-fit">
              <Shield className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Premium Brands Only</p>
              <p className="text-sm text-gray-500 mt-1">Atomic, Burton, Volkl, Salomon, Capita — no off-brand gear here.</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4">
            <div className="bg-sky-50 rounded-xl p-2.5 h-fit">
              <Wrench className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Free Exchanges</p>
              <p className="text-sm text-gray-500 mt-1">Not happy with your gear? Exchange it in-store within the first day, subject to availability.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Season Rentals */}
      <div className="bg-gradient-to-br from-sky-600 to-sky-800 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-sky-500 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              ✨ New for 2025
            </div>
            <h2 className="text-xl font-bold mb-2">Season Rentals</h2>
            <p className="text-sky-100 text-sm leading-relaxed max-w-md">
              Rent your gear for the full 3–4 month snow season. Billed monthly over 4 payments — and includes a <strong>free tune-up</strong> mid-season.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-sky-100">
              <li>✓ 3 or 4 month duration</li>
              <li>✓ Monthly payments — first month upfront</li>
              <li>✓ Free mid-season service included</li>
              <li>✓ Discounts for 5+ day rentals</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/book"
            className="bg-white text-sky-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-sky-50 transition-colors"
          >
            Book Online
          </Link>
          <a
            href="tel:0295973422"
            className="border border-sky-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-sky-700 transition-colors"
          >
            Call to arrange
          </a>
        </div>
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-5 text-center">How it works</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { step: "1", title: "Book online", desc: "Pick your dates and gear in under 2 minutes. Save 15% with code ONLINE15." },
            { step: "2", title: "Pick up in Rockdale", desc: "Come in before your trip. Our team will fit you properly." },
            { step: "3", title: "Hit the mountain", desc: "Head to Jindabyne or the Snowies with confidence." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="w-9 h-9 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">
                {step}
              </div>
              <p className="font-semibold text-gray-900 text-sm">{title}</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-5">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <details key={q} className="bg-white rounded-2xl border border-gray-200 group">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-sm text-gray-900 list-none">
                {q}
                <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-3" />
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                {a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Get in touch</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <a href="tel:0295973422" className="flex items-center gap-3 text-gray-700 hover:text-sky-600 transition-colors">
            <div className="bg-sky-50 p-2.5 rounded-xl">
              <Phone className="h-4 w-4 text-sky-600" />
            </div>
            <div>
              <p className="font-medium">(02) 9597 3422</p>
              <p className="text-gray-400 text-xs">Call us anytime during business hours</p>
            </div>
          </a>
          <a href="mailto:info@snowskierswarehouse.com.au" className="flex items-center gap-3 text-gray-700 hover:text-sky-600 transition-colors">
            <div className="bg-sky-50 p-2.5 rounded-xl">
              <Mail className="h-4 w-4 text-sky-600" />
            </div>
            <div>
              <p className="font-medium">info@snowskierswarehouse.com.au</p>
              <p className="text-gray-400 text-xs">We'll get back to you quickly</p>
            </div>
          </a>
          <div className="flex items-center gap-3 text-gray-700 sm:col-span-2">
            <div className="bg-sky-50 p-2.5 rounded-xl">
              <MapPin className="h-4 w-4 text-sky-600" />
            </div>
            <div>
              <p className="font-medium">Princes Highway, Rockdale NSW</p>
              <p className="text-gray-400 text-xs">On your way to Jindabyne — open 7 days during snow season</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center pb-4">
        <Link
          href="/book"
          className="inline-flex items-center gap-2 bg-sky-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-sky-700 transition-colors shadow-lg shadow-sky-200"
        >
          Book Your Gear Now
          <ChevronRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-gray-400 mt-2">Save 15% with code ONLINE15</p>
      </div>

    </div>
  )
}

const faqs = [
  {
    q: "What do I need to bring when picking up?",
    a: "Please bring a valid ID and a credit card for the security deposit. A parent or guardian must also be present to sign the rental agreement for anyone under 18.",
  },
  {
    q: "How far in advance should I book?",
    a: "We recommend booking as early as possible — especially during peak school holiday periods. Online bookings can be made up to 6 months in advance.",
  },
  {
    q: "Can I exchange my gear if it doesn't feel right?",
    a: "Yes. If you're not satisfied with your equipment or find it unsuitable, you can exchange it in-store within the first day of rental, subject to availability. Our staff will make sure you leave with the right fit.",
  },
  {
    q: "Do you offer discounts for longer rentals?",
    a: "Yes — we offer discounts for rentals longer than 5 days. Our pricing tiers automatically apply the best rate for your rental duration.",
  },
  {
    q: "What are Season Rentals?",
    a: "A season rental lets you hire ski or snowboard equipment for 3–4 months across the full snow season. Payment is billed monthly over 4 instalments, with the first month required upfront. Season rentals also include one free tune-up during your rental period.",
  },
  {
    q: "What happens if equipment is damaged?",
    a: "Normal wear and tear is expected and accepted. Significant damage or loss will result in a charge to cover repair or replacement costs. We'll always discuss this with you fairly.",
  },
  {
    q: "When do I pay?",
    a: "Payment is collected in store when you pick up your gear. We accept cash, card, and EFTPOS.",
  },
]
