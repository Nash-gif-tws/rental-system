import Link from "next/link"
import { ArrowRight, MapPin, Zap, Shield, Star, Phone, ChevronRight } from "lucide-react"

export default function HomePage() {
  return (
    <main className="bg-[#121212] text-white overflow-x-hidden">

      {/* ── GRAIN OVERLAY ─────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
          mixBlendMode: "overlay",
        }}
      />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end pb-20 pt-28 overflow-hidden">

        {/* Neon accent glow — top left */}
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at top left, rgba(200,255,0,0.07) 0%, transparent 60%)",
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Snow particles */}
        {snowParticles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/50 pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              top: "-8px",
              animation: `snowFall ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}

        {/* Diagonal accent bar */}
        <div
          className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[#C8FF00]/20 to-transparent hidden lg:block"
          style={{ right: "25%" }}
        />

        {/* Discount badge */}
        <div className="absolute top-24 right-6 md:right-16 z-10 hidden sm:block">
          <div
            className="border border-[#C8FF00]/40 text-[#C8FF00] bg-[#C8FF00]/5 px-4 py-2.5 font-body text-[10px] tracking-[0.2em] uppercase"
            style={{ transform: "rotate(2.5deg)" }}
          >
            Online: 15% off · Code ONLINE15
          </div>
        </div>

        {/* Main headline */}
        <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6 animate-fade-up">
            <span className="w-8 h-px bg-[#C8FF00]" />
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">
              Est. 1984 · Rockdale, Sydney
            </span>
          </div>

          <div className="animate-fade-up mb-4">
            <span
              className="block font-display font-bold leading-none tracking-tight"
              style={{
                fontSize: "clamp(3.5rem, 13vw, 13rem)",
                WebkitTextStroke: "1px rgba(255,255,255,0.12)",
                color: "transparent",
              }}
            >
              SNOWSKIERS
            </span>
            <span
              className="block font-display font-bold leading-none tracking-tight text-white"
              style={{ fontSize: "clamp(3.5rem, 13vw, 13rem)" }}
            >
              WAREHOUSE
            </span>
          </div>

          {/* Neon rule */}
          <div className="w-16 h-0.5 bg-[#C8FF00] mb-8 mt-4 animate-fade-up-delay-1" />

          <div className="flex flex-col lg:flex-row lg:items-end gap-10 animate-fade-up-delay-2">
            <div className="max-w-lg">
              <p className="font-body text-[#B4B4B4] leading-relaxed"
                style={{ fontSize: "clamp(1rem, 1.6vw, 1.25rem)" }}>
                Sydney's finest ski & snowboard hire since 1984.
                Atomic skis, Burton boards, retail-quality outerwear —
                pick up in Rockdale, ride the mountain.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 lg:ml-auto">
              <Link
                href="/book"
                className="group inline-flex items-center gap-3 bg-[#C8FF00] hover:bg-[#b3e600] text-[#121212] font-semibold px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200"
              >
                Book Your Gear
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <a
                href="#packages"
                className="inline-flex items-center gap-3 border border-white/20 hover:border-[#C8FF00]/50 hover:text-[#C8FF00] text-white px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200"
              >
                View Packages
              </a>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#121212] to-transparent pointer-events-none" />
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────── */}
      <section className="border-t border-b border-white/[0.06] py-7 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-wrap gap-8 md:gap-0 md:justify-between items-center">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-display font-bold text-[#C8FF00]" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
                  {item.value}
                </span>
                <span className="font-body text-[#B4B4B4] text-xs tracking-[0.18em] uppercase">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES ─────────────────────────────────────────────── */}
      <section id="packages" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">

          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-[#C8FF00]" />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">What we hire</span>
              </div>
              <h2
                className="font-display font-bold text-white leading-none"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
              >
                THE PACKAGES
              </h2>
            </div>
            <span
              className="hidden md:block font-display font-bold text-white/[0.04] leading-none select-none"
              style={{ fontSize: "clamp(4rem, 9vw, 9rem)" }}
            >
              01
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06]">
            {packages.map((pkg, i) => (
              <Link
                key={i}
                href="/book"
                className="group bg-[#121212] hover:bg-[#1a1a1a] p-8 transition-colors duration-300 block"
              >
                <div className="text-3xl mb-5">{pkg.icon}</div>
                <h3 className="font-display font-bold text-white text-2xl mb-2 leading-tight">{pkg.name}</h3>
                <p className="font-body text-[#B4B4B4] text-sm leading-relaxed mb-8">{pkg.description}</p>
                <div className="flex items-end justify-between mt-auto">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-bold text-[#C8FF00] text-2xl">FROM ${pkg.from}</span>
                    <span className="font-body text-[#B4B4B4] text-xs">/day</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-[#C8FF00] group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <Link
              href="/book"
              className="group inline-flex items-center gap-3 font-body text-xs tracking-[0.18em] uppercase text-[#B4B4B4] hover:text-[#C8FF00] transition-colors"
            >
              Book any package online
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FLEET ────────────────────────────────────────────────── */}
      <section id="fleet" className="py-24 md:py-32 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">

            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-[#C8FF00]" />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">The fleet</span>
              </div>
              <h2
                className="font-display font-bold text-white leading-none mb-8"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
              >
                PREMIUM<br />GEAR ONLY
              </h2>
              <p className="font-body text-[#B4B4B4] leading-relaxed mb-4"
                style={{ fontSize: "clamp(1rem, 1.5vw, 1.15rem)" }}>
                We don't do "whatever's lying around." Our fleet is regularly refreshed with the best in the industry — so you hit the mountain in gear that actually performs.
              </p>
              <p className="font-body text-[#B4B4B4]/60 text-sm leading-relaxed mb-10">
                Atomic skis refreshed 2023. Burton snowboards brand new 2024. Outerwear upgraded 2025. Properly maintained after every hire.
              </p>
              <Link
                href="/book"
                className="group inline-flex items-center gap-3 bg-[#C8FF00] hover:bg-[#b3e600] text-[#121212] font-semibold px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200"
              >
                Browse & Book
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>

            <div className="space-y-px">
              {fleetItems.map((item, i) => (
                <div
                  key={i}
                  className="group bg-[#1a1a1a] hover:bg-[#1e1e1e] border-l-2 border-transparent hover:border-[#C8FF00] p-6 flex items-center justify-between transition-all duration-200"
                >
                  <div>
                    <h4 className="font-display font-bold text-white text-xl leading-tight mb-1">{item.name}</h4>
                    <p className="font-body text-[#B4B4B4] text-sm">{item.detail}</p>
                  </div>
                  <span className="font-body text-[9px] tracking-[0.18em] uppercase bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20 px-3 py-1.5 flex-shrink-0 ml-4">
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEASON RENTALS ───────────────────────────────────────── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Accent glow */}
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at top right, rgba(200,255,0,0.05) 0%, transparent 60%)",
          }}
        />

        {/* Decorative rings */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-[#C8FF00]/[0.06] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full border border-[#C8FF00]/[0.04] translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl">
            <div className="inline-block border border-[#C8FF00]/30 text-[#C8FF00] bg-[#C8FF00]/5 font-body text-[10px] tracking-[0.25em] uppercase px-4 py-1.5 mb-8">
              New for 2025
            </div>
            <h2
              className="font-display font-bold text-white leading-none mb-8"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
            >
              SEASON<br />RENTALS
            </h2>
            <p className="font-body text-[#B4B4B4] leading-relaxed mb-4"
              style={{ fontSize: "clamp(1rem, 1.5vw, 1.15rem)" }}>
              Planning to ski all season? Lock in a 3–4 month rental with monthly billing. Includes a free mid-season tune.
            </p>
            <p className="font-body text-[#B4B4B4]/50 text-sm leading-relaxed mb-10">
              Perfect for regular weekend warriors and families heading up to Perisher or Thredbo multiple times. Ask us about custom packages for groups and schools.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              {["3–4 month season", "Monthly billing", "Free tune-up", "Best value"].map((f) => (
                <span key={f} className="font-body text-[10px] tracking-[0.12em] uppercase border border-white/10 text-[#B4B4B4] px-4 py-2 hover:border-[#C8FF00]/40 hover:text-[#C8FF00] transition-colors cursor-default">
                  {f}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/book"
                className="group inline-flex items-center gap-3 bg-[#C8FF00] hover:bg-[#b3e600] text-[#121212] font-semibold px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200"
              >
                Book a Season Rental
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <a
                href="tel:0295973422"
                className="inline-flex items-center gap-3 border border-white/15 hover:border-white/30 text-white px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200"
              >
                <Phone className="w-4 h-4" />
                Call to Discuss
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how" className="py-24 md:py-32 border-t border-white/[0.06] bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">

          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-[#C8FF00]" />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">The process</span>
              </div>
              <h2
                className="font-display font-bold text-white leading-none"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
              >
                HOW IT<br />WORKS
              </h2>
            </div>
            <span
              className="hidden md:block font-display font-bold text-white/[0.04] leading-none select-none"
              style={{ fontSize: "clamp(4rem, 9vw, 9rem)" }}
            >
              03
            </span>
          </div>

          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
            {steps.map((step, i) => (
              <div key={i} className="relative p-8 md:p-10">
                <span
                  className="absolute top-6 right-8 font-display font-bold text-white/[0.04] leading-none select-none"
                  style={{ fontSize: "5rem" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="text-[#C8FF00] mb-5">{step.icon}</div>
                <h3 className="font-display font-bold text-white text-2xl mb-3 leading-tight">{step.title}</h3>
                <p className="font-body text-[#B4B4B4] text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 border-t border-white/[0.06] pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="font-body text-[#B4B4B4] text-sm">
              Use code{" "}
              <span className="text-[#C8FF00] tracking-wider font-semibold">ONLINE15</span>{" "}
              at checkout to save 15%
            </p>
            <Link
              href="/book"
              className="group inline-flex items-center gap-3 bg-[#C8FF00] hover:bg-[#b3e600] text-[#121212] font-semibold px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200"
            >
              Start Booking
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────── */}
      <section id="reviews" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">

          <div className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-px bg-[#C8FF00]" />
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">Social proof</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C8FF00] text-[#C8FF00]" />
                ))}
              </div>
              <span className="font-display font-bold text-white text-3xl">4.8</span>
              <span className="font-body text-[#B4B4B4] text-xs tracking-wider uppercase">480+ Google reviews</span>
            </div>
          </div>

          {/* Feature quote */}
          <blockquote className="border-l-2 border-[#C8FF00] pl-8 mb-16 max-w-3xl">
            <p className="font-body text-white/80 leading-relaxed mb-5"
              style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)" }}>
              "Best gear hire in Sydney. Picked up our ski packages the night before, everything fitted perfectly, and the staff actually knew what they were talking about. Will never go anywhere else."
            </p>
            <cite className="font-body text-[#B4B4B4] text-xs tracking-[0.2em] uppercase not-italic">
              — Sarah M., Perisher regular
            </cite>
          </blockquote>

          <div className="grid md:grid-cols-3 gap-px bg-white/[0.05]">
            {reviews.map((r, i) => (
              <div key={i} className="bg-[#121212] hover:bg-[#1a1a1a] p-8 transition-colors duration-200 group">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-[#C8FF00] text-[#C8FF00]" />
                  ))}
                </div>
                <p className="font-body text-[#B4B4B4] text-sm leading-relaxed mb-5">"{r.text}"</p>
                <span className="font-body text-[#B4B4B4]/40 text-xs tracking-[0.18em] uppercase">— {r.author}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 md:py-32 border-t border-white/[0.06] bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 lg:gap-24">

            <div className="md:sticky md:top-32 md:self-start">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-[#C8FF00]" />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">Got questions</span>
              </div>
              <h2
                className="font-display font-bold text-white leading-none"
                style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
              >
                COMMON<br />QUESTIONS
              </h2>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {faqs.map((faq, i) => (
                <details key={i} className="group py-7 cursor-pointer">
                  <summary className="flex items-center justify-between font-body font-medium text-sm text-[#B4B4B4] hover:text-white transition-colors duration-200 list-none">
                    {faq.question}
                    <span className="font-display font-bold text-white/20 group-open:rotate-45 transition-transform duration-300 ml-6 flex-shrink-0 text-2xl leading-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 font-body text-sm text-[#B4B4B4]/60 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-24 md:py-36 relative overflow-hidden border-t border-white/[0.06]">
        {/* Neon glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(200,255,0,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="font-display font-bold text-white/[0.025] whitespace-nowrap"
            style={{ fontSize: "clamp(6rem, 18vw, 18rem)" }}
          >
            BOOK NOW
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-[#C8FF00]" />
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">Rockdale, Sydney</span>
            <span className="w-8 h-px bg-[#C8FF00]" />
          </div>
          <h2
            className="font-display font-bold text-white leading-none mb-8"
            style={{ fontSize: "clamp(3rem, 9vw, 9rem)" }}
          >
            READY TO<br />RIDE?
          </h2>
          <p className="font-body text-[#B4B4B4] max-w-xl mx-auto mb-10"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.15rem)" }}>
            35+ years outfitting Sydney's mountain community. Book online and save 15% with code{" "}
            <span className="text-[#C8FF00] font-semibold">ONLINE15</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="group inline-flex items-center justify-center gap-3 bg-[#C8FF00] hover:bg-[#b3e600] text-[#121212] font-semibold px-10 py-5 font-body text-xs tracking-[0.2em] uppercase transition-colors duration-200"
            >
              Book Your Gear
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a
              href="tel:0295973422"
              className="inline-flex items-center justify-center gap-3 border border-white/15 hover:border-[#C8FF00]/40 hover:text-[#C8FF00] text-white px-10 py-5 font-body text-xs tracking-[0.2em] uppercase transition-colors duration-200"
            >
              <Phone className="w-4 h-4" />
              (02) 9597 3422
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}

// ── DATA ──────────────────────────────────────────────────────────────────────

const trustItems = [
  { value: "35+", label: "Years in business" },
  { value: "4.8★", label: "480+ Google reviews" },
  { value: "Atomic · Burton", label: "Premium fleet only" },
  { value: "Rockdale NSW", label: "Perfect stop for Jindabyne" },
]

const packages = [
  { icon: "🎿", name: "Adult Ski Package", description: "Atomic skis, ski boots & poles. Refreshed fleet, sharp edges, fitted by our experts.", from: 55 },
  { icon: "🏂", name: "Adult Snowboard", description: "Burton boards & boots, brand new 2024 fleet. Beginner through to advanced.", from: 60 },
  { icon: "👶", name: "Junior Package", description: "Properly fitted kids ski & snowboard packages, sized for every age.", from: 40 },
  { icon: "🥾", name: "Boots Only", description: "Ski or snowboard boots individually. Perfect if you have your own gear.", from: 20 },
  { icon: "🧥", name: "Snow Clothing", description: "Retail-quality Burton jackets & pants. 70%+ of our 2025 range freshly upgraded.", from: 20 },
  { icon: "⛑", name: "Helmets & Goggles", description: "Safety-rated helmets and anti-fog goggles to complete your kit.", from: 10 },
]

const fleetItems = [
  { name: "Atomic Rental Skis", detail: "Full range of sizes and ability levels", badge: "Refreshed 2023" },
  { name: "Burton Snowboards", detail: "Freestyle and all-mountain options", badge: "New 2024" },
  { name: "Burton Outerwear", detail: "Waterproof jackets and pants, adults & kids", badge: "Upgraded 2025" },
  { name: "Boots & Bindings", detail: "Heat-mouldable liners for custom fit", badge: "Premium" },
]

const steps = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "BOOK ONLINE",
    description: "Choose your gear, dates, and sizes in under 2 minutes. Save 15% with code ONLINE15. No payment until pickup.",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "PICK UP IN ROCKDALE",
    description: "Come into our Princes Highway store. Our team fits you properly — not just hands you a bag and wishes you luck.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "HIT THE MOUNTAIN",
    description: "Drive to Perisher, Thredbo or Falls Creek knowing you're in properly maintained, properly fitted gear.",
  },
]

const reviews = [
  { text: "The fitting service is incredible. They actually adjusted the boots for my wide feet — unheard of at most hire places.", author: "James T." },
  { text: "Season rental is a game changer. Monthly billing and a free tune-up halfway through. Couldn't recommend more.", author: "Alex & Kim, Thredbo" },
  { text: "Booked online, picked up, done. Staff were brilliant with our kids and made sure they were safe and comfortable.", author: "Priya K." },
]

// Deterministic snow particles — no random() to avoid hydration mismatch
const snowParticles = Array.from({ length: 40 }, (_, i) => ({
  size: `${1.5 + (Math.sin(i * 2.3) + 1) * 2}px`,
  left: `${(i * 2.6) % 100}%`,
  duration: 10 + (i % 7) * 2,
  delay: -((i * 1.3) % 14),
}))

const faqs = [
  { question: "What do I need to bring when picking up?", answer: "A valid ID and a credit card for the security deposit. Parents or guardians must be present for anyone under 18 to sign the rental agreement." },
  { question: "How far in advance should I book?", answer: "As early as possible — especially during school holidays. We take bookings up to 6 months ahead. Popular sizes sell out fast during peak periods." },
  { question: "Can I swap gear if it doesn't feel right?", answer: "Yes. If something doesn't feel right, you can exchange in-store within the first day, subject to availability. Our team will re-fit you properly." },
  { question: "What are Season Rentals?", answer: "Hire your gear for the entire 3–4 month snow season. Billed monthly over 4 payments (first month upfront). Includes a free tune-up mid-season." },
  { question: "Do you offer discounts for longer rentals?", answer: "Yes — pricing automatically adjusts based on duration. The longer you hire, the better the daily rate. Discounts apply from 5 days." },
  { question: "When do I pay?", answer: "Payment is collected in store at pickup. We accept all major cards and EFTPOS. No payment is required to make an online booking." },
  { question: "What if equipment is damaged?", answer: "Normal wear and tear is expected. Significant damage or loss will be charged fairly to cover repair or replacement. We'll always discuss this with you first." },
]
