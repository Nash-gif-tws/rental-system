import Link from "next/link"
import { ArrowRight, MapPin, Zap, Shield, Star, Phone, Check } from "lucide-react"

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end pb-24 pt-28 overflow-hidden" style={{ background: "#0C0D11" }}>

        {/* Atmospheric layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Deep sky gradient */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(170deg, #0a0c18 0%, #0e1020 35%, #0C0D11 100%)" }} />
          {/* Subtle blue atmospheric haze */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 65% 0%, rgba(60,80,160,0.14) 0%, transparent 65%)" }} />
          {/* Gold horizon glow — warmth of a ski sunrise */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 30% at 30% 90%, rgba(196,160,74,0.08) 0%, transparent 55%)" }} />
          {/* Mountain silhouette */}
          <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: "42%" }}>
            <path d="M0,320 L0,220 L180,90 L320,180 L480,60 L640,150 L800,40 L960,140 L1120,80 L1280,160 L1440,100 L1440,320 Z" fill="rgba(6,7,10,0.80)" />
            <path d="M0,320 L0,260 L120,160 L240,220 L380,120 L520,200 L680,100 L840,190 L1000,120 L1160,200 L1300,140 L1440,180 L1440,320 Z" fill="rgba(6,7,10,0.94)" />
          </svg>
          {/* Stars */}
          {stars.map((s, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{ width: s.size, height: s.size, left: s.left, top: s.top, opacity: s.opacity }} />
          ))}
        </div>

        {/* Snow particles */}
        {snowParticles.map((p, i) => (
          <div key={i} className="absolute rounded-full bg-white/30 pointer-events-none" style={{ width: p.size, height: p.size, left: p.left, top: "-8px", animation: `snowFall ${p.duration}s linear ${p.delay}s infinite` }} />
        ))}

        {/* Gold vertical accent line */}
        <div className="absolute top-0 h-full hidden lg:block" style={{ right: "8%", width: "1px", background: "linear-gradient(to bottom, transparent, rgba(196,160,74,0.4), transparent)" }} />

        {/* Discount badge */}
        <div className="absolute top-24 right-6 md:right-[10%] z-10 hidden sm:block">
          <div className="border font-body text-[10px] tracking-[0.18em] uppercase px-4 py-2.5" style={{ borderColor: "rgba(196,160,74,0.35)", color: "#C4A04A", background: "rgba(196,160,74,0.06)", transform: "rotate(1.5deg)", backdropFilter: "blur(8px)" }}>
            Online: 15% off · Code ONLINE15
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px" style={{ background: "#C4A04A" }} />
            <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C4A04A" }}>Est. 1984 · Rockdale, Sydney</span>
          </div>

          <h1 className="font-display font-black text-white leading-none tracking-tight mb-6" style={{ fontSize: "clamp(3.5rem, 11vw, 11rem)" }}>
            <span className="block" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.12)", color: "transparent" }}>SNOWSKIERS</span>
            <span className="block text-white">WAREHOUSE</span>
          </h1>

          <div className="w-16 h-px mb-8" style={{ background: "#C4A04A" }} />

          <div className="flex flex-col lg:flex-row lg:items-end gap-10">
            <p className="font-body leading-relaxed max-w-lg" style={{ color: "rgba(249,248,245,0.55)", fontSize: "clamp(1rem, 1.5vw, 1.18rem)" }}>
              Sydney's finest ski & snowboard hire since 1984.
              Atomic skis, Burton boards, retail-quality outerwear —
              pick up in Rockdale, ride the mountain.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto flex-shrink-0">
              <Link href="/book" className="group inline-flex items-center gap-3 font-bold px-8 py-4 font-body text-xs tracking-[0.2em] uppercase transition-all duration-200" style={{ background: "#C4A04A", color: "#0C0D11" }}>
                Book Your Gear
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#packages" className="inline-flex items-center gap-3 px-8 py-4 font-body text-xs tracking-[0.2em] uppercase transition-colors duration-200" style={{ border: "1px solid rgba(249,248,245,0.15)", color: "rgba(249,248,245,0.7)" }}
                onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "rgba(196,160,74,0.5)"; (e.target as HTMLElement).style.color = "#C4A04A" }}
                onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "rgba(249,248,245,0.15)"; (e.target as HTMLElement).style.color = "rgba(249,248,245,0.7)" }}
              >
                View Packages
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────────────── */}
      {/* Dark with gold — refined, not loud */}
      <section style={{ background: "#141620", borderBottom: "1px solid rgba(196,160,74,0.12)" }} className="py-7">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-wrap gap-6 md:gap-0 md:justify-between items-center">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-display font-black" style={{ color: "#C4A04A", fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)" }}>{item.value}</span>
                <span className="font-body text-xs tracking-[0.12em] uppercase" style={{ color: "rgba(249,248,245,0.35)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES — IVORY ──────────────────────────────────────────────── */}
      <section id="packages" className="py-24 md:py-32" style={{ background: "#F9F8F5" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px" style={{ background: "#C4A04A" }} />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C4A04A" }}>What we hire</span>
              </div>
              <h2 className="font-display font-black leading-none" style={{ color: "#0C0D11", fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}>
                THE PACKAGES
              </h2>
            </div>
            <span className="hidden md:block font-display font-black leading-none select-none" style={{ color: "rgba(12,13,17,0.04)", fontSize: "clamp(4rem, 9vw, 9rem)" }}>01</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg, i) => (
              <Link key={i} href="/book"
                className="group block p-8 transition-all duration-300"
                style={{ background: "#FFFFFF", border: "1px solid rgba(12,13,17,0.08)", borderRadius: "16px" }}
              >
                <div className="text-3xl mb-5">{pkg.icon}</div>
                <h3 className="font-display font-bold text-xl mb-2 leading-tight transition-colors" style={{ color: "#0C0D11" }}>{pkg.name}</h3>
                <p className="font-body text-sm leading-relaxed mb-8 transition-colors" style={{ color: "rgba(12,13,17,0.48)" }}>{pkg.description}</p>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-2xl" style={{ color: "#C4A04A" }}>FROM ${pkg.from}</span>
                    <span className="font-body text-xs" style={{ color: "rgba(12,13,17,0.35)" }}>/rental</span>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: "#C4A04A" }}>
                    <ArrowRight className="w-3.5 h-3.5" style={{ color: "#0C0D11" }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <Link href="/book" className="group inline-flex items-center gap-3 font-body text-xs tracking-[0.18em] uppercase transition-colors" style={{ color: "rgba(12,13,17,0.35)" }}>
              Book any package online
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FLEET — DARK INK ──────────────────────────────────────────────── */}
      <section id="fleet" className="py-24 md:py-32" style={{ background: "#0C0D11" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px" style={{ background: "#C4A04A" }} />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C4A04A" }}>The fleet</span>
              </div>
              <h2 className="font-display font-black text-white leading-none mb-8" style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}>
                PREMIUM<br />GEAR ONLY
              </h2>
              <p className="font-body leading-relaxed mb-4" style={{ color: "rgba(249,248,245,0.48)", fontSize: "clamp(1rem, 1.5vw, 1.12rem)" }}>
                We don't do "whatever's lying around." Our fleet is regularly refreshed with the best in the industry — so you hit the mountain in gear that actually performs.
              </p>
              <p className="font-body text-sm leading-relaxed mb-10" style={{ color: "rgba(249,248,245,0.25)" }}>
                Atomic skis refreshed 2023. Burton snowboards brand new 2024. Outerwear upgraded 2025.
              </p>
              <Link href="/book" className="group inline-flex items-center gap-3 font-bold px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200" style={{ background: "#C4A04A", color: "#0C0D11" }}>
                Browse & Book
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-2">
              {fleetItems.map((item, i) => (
                <div key={i} className="group p-6 flex items-center justify-between transition-all duration-200" style={{ background: "rgba(249,248,245,0.03)", border: "1px solid rgba(249,248,245,0.06)", borderRadius: "12px" }}>
                  <div>
                    <h4 className="font-display font-bold text-white text-lg leading-tight mb-1">{item.name}</h4>
                    <p className="font-body text-sm" style={{ color: "rgba(249,248,245,0.35)" }}>{item.detail}</p>
                  </div>
                  <span className="font-body text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full flex-shrink-0 ml-4" style={{ background: "rgba(196,160,74,0.1)", color: "#C4A04A", border: "1px solid rgba(196,160,74,0.2)" }}>
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEASON RENTALS — WARM SAND ───────────────────────────────────── */}
      {/* Light, warm, approachable — not loud */}
      <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: "#EDE8DF" }}>
        {/* Decorative circle */}
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ border: "1px solid rgba(12,13,17,0.06)" }} />
        <div className="absolute -right-16 -top-16 w-[280px] h-[280px] rounded-full pointer-events-none" style={{ border: "1px solid rgba(12,13,17,0.04)" }} />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block font-body text-[10px] tracking-[0.25em] uppercase px-4 py-1.5 mb-8" style={{ background: "#0C0D11", color: "#C4A04A", borderRadius: "99px" }}>
                New for 2025
              </div>
              <h2 className="font-display font-black leading-none mb-6" style={{ color: "#0C0D11", fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}>
                SEASON<br />RENTALS
              </h2>
              <p className="font-body leading-relaxed mb-10" style={{ color: "rgba(12,13,17,0.6)", fontSize: "clamp(1rem, 1.5vw, 1.12rem)" }}>
                Planning to ski all season? Lock in a 3–4 month rental with monthly billing. Includes a free mid-season tune.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/book" className="group inline-flex items-center gap-3 font-bold px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200" style={{ background: "#0C0D11", color: "#F9F8F5" }}>
                  Book a Season Rental
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="tel:0295973422" className="inline-flex items-center gap-3 px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200" style={{ border: "1.5px solid rgba(12,13,17,0.25)", color: "#0C0D11" }}>
                  <Phone className="w-4 h-4" /> Call to Discuss
                </a>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { title: "3–4 month season", desc: "Full season coverage for regular skiers and families." },
                { title: "Monthly billing", desc: "Spread the cost — 4 payments, first month upfront." },
                { title: "Free mid-season tune", desc: "Sharp edges keep you safer and more in control." },
                { title: "Best value per day", desc: "Significantly cheaper than repeated weekly hires." },
              ].map(({ title, desc }) => (
                <div key={title} className="p-5 flex gap-4 items-start" style={{ background: "rgba(255,255,255,0.55)", borderRadius: "14px", border: "1px solid rgba(12,13,17,0.06)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#C4A04A" }}>
                    <Check className="w-3 h-3" style={{ color: "#0C0D11" }} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-base" style={{ color: "#0C0D11" }}>{title}</p>
                    <p className="font-body text-sm mt-0.5" style={{ color: "rgba(12,13,17,0.55)" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — IVORY ─────────────────────────────────────────── */}
      <section id="how" className="py-24 md:py-32" style={{ background: "#F9F8F5" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px" style={{ background: "#C4A04A" }} />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C4A04A" }}>The process</span>
              </div>
              <h2 className="font-display font-black leading-none" style={{ color: "#0C0D11", fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}>
                HOW IT<br />WORKS
              </h2>
            </div>
            <span className="hidden md:block font-display font-black leading-none select-none" style={{ color: "rgba(12,13,17,0.04)", fontSize: "clamp(4rem, 9vw, 9rem)" }}>02</span>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#0C0D11" }}>
                    <span className="font-display font-black text-lg" style={{ color: "#C4A04A" }}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block flex-1 h-px" style={{ background: "rgba(12,13,17,0.1)" }} />
                  )}
                </div>
                <div className="mb-4" style={{ color: "rgba(12,13,17,0.3)" }}>{step.icon}</div>
                <h3 className="font-display font-bold text-xl mb-3 leading-tight" style={{ color: "#0C0D11" }}>{step.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(12,13,17,0.48)" }}>{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6" style={{ borderTop: "1px solid rgba(12,13,17,0.08)" }}>
            <p className="font-body text-sm" style={{ color: "rgba(12,13,17,0.45)" }}>
              Use code <span className="font-bold tracking-wider" style={{ color: "#0C0D11" }}>ONLINE15</span> at checkout to save 15%
            </p>
            <Link href="/book" className="group inline-flex items-center gap-3 font-bold px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200" style={{ background: "#0C0D11", color: "#F9F8F5" }}>
              Start Booking
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── REVIEWS — DARK ───────────────────────────────────────────────── */}
      <section id="reviews" className="py-24 md:py-32" style={{ background: "#13141A" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-px" style={{ background: "#C4A04A" }} />
              <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C4A04A" }}>Social proof</span>
            </div>
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5" style={{ fill: "#C4A04A", color: "#C4A04A" }} />)}
              </div>
              <span className="font-display font-black text-white text-4xl">4.8</span>
              <span className="font-body text-xs tracking-wider uppercase" style={{ color: "rgba(249,248,245,0.3)" }}>480+ Google reviews</span>
            </div>
          </div>

          {/* Feature quote */}
          <blockquote className="p-10 md:p-14 mb-10 max-w-4xl" style={{ background: "rgba(249,248,245,0.04)", border: "1px solid rgba(249,248,245,0.07)", borderRadius: "20px" }}>
            <div className="w-8 h-px mb-6" style={{ background: "#C4A04A" }} />
            <p className="font-body leading-relaxed mb-6" style={{ color: "rgba(249,248,245,0.75)", fontSize: "clamp(1.1rem, 2.5vw, 1.45rem)" }}>
              "Best gear hire in Sydney. Picked up our ski packages the night before, everything fitted perfectly, and the staff actually knew what they were talking about. Will never go anywhere else."
            </p>
            <cite className="font-body text-xs tracking-[0.2em] uppercase not-italic" style={{ color: "#C4A04A" }}>— Sarah M., Perisher regular</cite>
          </blockquote>

          <div className="grid md:grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <div key={i} className="p-8" style={{ background: "rgba(249,248,245,0.03)", border: "1px solid rgba(249,248,245,0.06)", borderRadius: "16px" }}>
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5" style={{ fill: "#C4A04A", color: "#C4A04A" }} />)}
                </div>
                <p className="font-body text-sm leading-relaxed mb-5" style={{ color: "rgba(249,248,245,0.5)" }}>"{r.text}"</p>
                <span className="font-body text-xs tracking-[0.18em] uppercase" style={{ color: "rgba(249,248,245,0.25)" }}>— {r.author}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ — DEEP INK ───────────────────────────────────────────────── */}
      <section id="faq" className="py-24 md:py-32" style={{ background: "#0C0D11" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 lg:gap-24">
            <div className="md:sticky md:top-32 md:self-start">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px" style={{ background: "#C4A04A" }} />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C4A04A" }}>Got questions</span>
              </div>
              <h2 className="font-display font-black text-white leading-none mb-8" style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}>
                COMMON<br />QUESTIONS
              </h2>
              <a href="tel:0295973422" className="group inline-flex items-center gap-3 px-6 py-3 font-body text-xs tracking-[0.15em] uppercase transition-colors" style={{ border: "1px solid rgba(249,248,245,0.12)", color: "rgba(249,248,245,0.5)" }}>
                <Phone className="w-4 h-4" /> (02) 9597 3422
              </a>
            </div>

            <div style={{ borderTop: "1px solid rgba(249,248,245,0.06)" }}>
              {faqs.map((faq, i) => (
                <details key={i} className="group py-7 cursor-pointer" style={{ borderBottom: "1px solid rgba(249,248,245,0.06)" }}>
                  <summary className="flex items-center justify-between font-body font-medium text-sm list-none transition-colors duration-200" style={{ color: "rgba(249,248,245,0.45)" }}>
                    {faq.question}
                    <span className="font-display font-bold group-open:rotate-45 transition-all duration-300 ml-6 flex-shrink-0 text-2xl leading-none" style={{ color: "rgba(249,248,245,0.15)" }}>+</span>
                  </summary>
                  <p className="mt-4 font-body text-sm leading-relaxed" style={{ color: "rgba(249,248,245,0.28)" }}>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      {/* Rich dark with gold — send them to book with confidence */}
      <section className="py-24 md:py-36 relative overflow-hidden" style={{ background: "#0F1016" }}>
        {/* Gold gradient radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(196,160,74,0.07) 0%, transparent 65%)" }} />
        {/* Top border gold */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(196,160,74,0.4), transparent)" }} />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px" style={{ background: "rgba(196,160,74,0.3)" }} />
            <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(196,160,74,0.6)" }}>Rockdale, Sydney</span>
            <span className="w-8 h-px" style={{ background: "rgba(196,160,74,0.3)" }} />
          </div>

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden>
            <span className="font-display font-black whitespace-nowrap" style={{ color: "rgba(249,248,245,0.02)", fontSize: "clamp(6rem, 18vw, 18rem)" }}>
              BOOK NOW
            </span>
          </div>

          <h2 className="font-display font-black text-white leading-none mb-8 relative" style={{ fontSize: "clamp(3rem, 9vw, 9rem)" }}>
            READY TO<br />RIDE?
          </h2>

          <p className="font-body max-w-xl mx-auto mb-10 relative" style={{ color: "rgba(249,248,245,0.45)", fontSize: "clamp(1rem, 1.5vw, 1.1rem)" }}>
            35+ years outfitting Sydney's mountain community. Book online and save 15% with code{" "}
            <span className="font-bold" style={{ color: "#C4A04A" }}>ONLINE15</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
            <Link href="/book" className="group inline-flex items-center justify-center gap-3 font-bold px-10 py-5 font-body text-xs tracking-[0.2em] uppercase transition-all duration-200" style={{ background: "#C4A04A", color: "#0C0D11" }}>
              Book Your Gear
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="tel:0295973422" className="inline-flex items-center justify-center gap-3 px-10 py-5 font-body text-xs tracking-[0.2em] uppercase transition-colors duration-200" style={{ border: "1.5px solid rgba(249,248,245,0.15)", color: "rgba(249,248,245,0.65)" }}>
              <Phone className="w-4 h-4" /> (02) 9597 3422
            </a>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes snowFall {
          0% { transform: translateY(-8px) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.25; }
          100% { transform: translateY(100vh) translateX(28px); opacity: 0; }
        }
      `}</style>
    </main>
  )
}

// ── DATA ───────────────────────────────────────────────────────────────────────

const trustItems = [
  { value: "35+", label: "Years in business" },
  { value: "4.8★", label: "480+ Google reviews" },
  { value: "Atomic · Burton", label: "Premium fleet only" },
  { value: "Rockdale NSW", label: "On the way to Jindabyne" },
]

const packages = [
  { icon: "🎿", name: "Adult Ski Package", description: "Atomic skis, ski boots & poles. Refreshed fleet, sharp edges, fitted by our experts.", from: 135 },
  { icon: "🏂", name: "Adult Snowboard", description: "Burton boards & boots, brand new 2024 fleet. Beginner through to advanced.", from: 130 },
  { icon: "❄️", name: "Burton Step-On", description: "Our premium Step-On binding system. Fastest entry/exit on the mountain.", from: 170 },
  { icon: "👶", name: "Junior Package", description: "Properly fitted kids ski & snowboard packages, sized for every age.", from: 70 },
  { icon: "🧥", name: "Outerwear Package", description: "Retail-quality jacket & pants bundle. 2025 range freshly upgraded.", from: 80 },
  { icon: "⛑️", name: "Helmets & More", description: "Safety-rated helmets, goggles, bags and accessories to complete your kit.", from: 25 },
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

const snowParticles = Array.from({ length: 35 }, (_, i) => ({
  size: `${1.5 + (Math.sin(i * 2.3) + 1) * 1.8}px`,
  left: `${(i * 2.9) % 100}%`,
  duration: 12 + (i % 7) * 2,
  delay: -((i * 1.4) % 16),
}))

const stars = Array.from({ length: 55 }, (_, i) => ({
  size: `${0.5 + (Math.sin(i * 1.7) + 1) * 0.9}px`,
  left: `${(i * 1.618) % 100}%`,
  top: `${(i * 2.1) % 55}%`,
  opacity: 0.15 + (Math.sin(i * 3.1) + 1) * 0.25,
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
