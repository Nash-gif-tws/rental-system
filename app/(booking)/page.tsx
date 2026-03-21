import Link from "next/link"
import { ArrowRight, MapPin, Zap, Shield, Star, Phone, Check } from "lucide-react"

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {/* Dark alpine section — sets the scene */}
      <section className="relative min-h-screen flex flex-col justify-end pb-20 pt-28 overflow-hidden bg-[#0e0e12]">

        {/* Mountain silhouette — CSS gradient layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Sky gradient */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #0e0f1a 0%, #141520 40%, #0e0e12 100%)" }} />
          {/* Purple/blue atmospheric haze */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 60% 0%, rgba(80,60,180,0.18) 0%, transparent 70%)" }} />
          {/* Lime glow bottom-left — light source */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 40% at -5% 100%, rgba(200,255,0,0.12) 0%, transparent 60%)" }} />
          {/* Mountain ridge — stylised CSS shape */}
          <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: "45%" }}>
            <path d="M0,320 L0,220 L180,90 L320,180 L480,60 L640,150 L800,40 L960,140 L1120,80 L1280,160 L1440,100 L1440,320 Z" fill="rgba(8,8,14,0.85)" />
            <path d="M0,320 L0,260 L120,160 L240,220 L380,120 L520,200 L680,100 L840,190 L1000,120 L1160,200 L1300,140 L1440,180 L1440,320 Z" fill="rgba(8,8,14,0.95)" />
          </svg>
          {/* Stars */}
          {stars.map((s, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{ width: s.size, height: s.size, left: s.left, top: s.top, opacity: s.opacity }} />
          ))}
        </div>

        {/* Snow particles */}
        {snowParticles.map((p, i) => (
          <div key={i} className="absolute rounded-full bg-white/40 pointer-events-none" style={{ width: p.size, height: p.size, left: p.left, top: "-8px", animation: `snowFall ${p.duration}s linear ${p.delay}s infinite` }} />
        ))}

        {/* Lime vertical stripe — right side design detail */}
        <div className="absolute top-0 right-0 h-full w-1.5 bg-gradient-to-b from-transparent via-[#C8FF00]/60 to-transparent hidden lg:block" style={{ right: "8%" }} />

        {/* Discount badge */}
        <div className="absolute top-24 right-6 md:right-[10%] z-10 hidden sm:block">
          <div className="border border-[#C8FF00]/50 text-[#C8FF00] bg-[#C8FF00]/8 backdrop-blur-sm px-4 py-2.5 font-body text-[10px] tracking-[0.2em] uppercase" style={{ transform: "rotate(2deg)" }}>
            Online: 15% off · Code ONLINE15
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-px bg-[#C8FF00]" />
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">Est. 1984 · Rockdale, Sydney</span>
          </div>

          <h1 className="font-display font-black text-white leading-none tracking-tight mb-6" style={{ fontSize: "clamp(3.5rem, 12vw, 12rem)" }}>
            <span className="block" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.15)", color: "transparent" }}>SNOWSKIERS</span>
            <span className="block text-white">WAREHOUSE</span>
          </h1>

          <div className="w-16 h-0.5 bg-[#C8FF00] mb-8" />

          <div className="flex flex-col lg:flex-row lg:items-end gap-10">
            <p className="font-body text-white/60 leading-relaxed max-w-lg" style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}>
              Sydney's finest ski & snowboard hire since 1984.
              Atomic skis, Burton boards, retail-quality outerwear —
              pick up in Rockdale, ride the mountain.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
              <Link href="/book" className="group inline-flex items-center gap-3 bg-[#C8FF00] hover:bg-[#d4ff1a] text-[#0e0e12] font-bold px-8 py-4 font-body text-xs tracking-[0.2em] uppercase transition-all duration-200">
                Book Your Gear
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#packages" className="inline-flex items-center gap-3 border border-white/20 hover:border-[#C8FF00]/60 text-white hover:text-[#C8FF00] px-8 py-4 font-body text-xs tracking-[0.2em] uppercase transition-colors duration-200">
                View Packages
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR — LIME ─────────────────────────────────────────────── */}
      {/* First contrast hit — bold lime on dark creates visual pop */}
      <section className="bg-[#C8FF00] py-6">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-wrap gap-6 md:gap-0 md:justify-between items-center">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-display font-black text-[#0e0e12]" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>{item.value}</span>
                <span className="font-body text-[#0e0e12]/60 text-xs tracking-[0.15em] uppercase">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES — WHITE ─────────────────────────────────────────────── */}
      {/* Light section — packages breathe on white background */}
      <section id="packages" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-[#C8FF00]" />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">What we hire</span>
              </div>
              <h2 className="font-display font-black text-[#0e0e12] leading-none" style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}>
                THE PACKAGES
              </h2>
            </div>
            <span className="hidden md:block font-display font-black text-[#0e0e12]/[0.04] leading-none select-none" style={{ fontSize: "clamp(4rem, 9vw, 9rem)" }}>01</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((pkg, i) => (
              <Link key={i} href="/book"
                className="group bg-[#f8f8f5] hover:bg-[#0e0e12] border border-[#e8e8e2] hover:border-[#0e0e12] p-8 rounded-2xl transition-all duration-300 block"
              >
                <div className="text-3xl mb-5">{pkg.icon}</div>
                <h3 className="font-display font-bold text-[#0e0e12] group-hover:text-white text-xl mb-2 leading-tight transition-colors">{pkg.name}</h3>
                <p className="font-body text-[#0e0e12]/50 group-hover:text-white/50 text-sm leading-relaxed mb-8 transition-colors">{pkg.description}</p>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-[#C8FF00] text-2xl">FROM ${pkg.from}</span>
                    <span className="font-body text-[#0e0e12]/40 group-hover:text-white/40 text-xs transition-colors">/rental</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#C8FF00] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5 text-[#0e0e12]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <Link href="/book" className="group inline-flex items-center gap-3 font-body text-xs tracking-[0.18em] uppercase text-[#0e0e12]/40 hover:text-[#0e0e12] transition-colors">
              Book any package online
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FLEET — DARK ─────────────────────────────────────────────────── */}
      {/* Back to dark — premium gear deserves drama */}
      <section id="fleet" className="py-24 md:py-32 bg-[#111118]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-[#C8FF00]" />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">The fleet</span>
              </div>
              <h2 className="font-display font-black text-white leading-none mb-8" style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}>
                PREMIUM<br />GEAR ONLY
              </h2>
              <p className="font-body text-white/50 leading-relaxed mb-4" style={{ fontSize: "clamp(1rem, 1.5vw, 1.15rem)" }}>
                We don't do "whatever's lying around." Our fleet is regularly refreshed with the best in the industry — so you hit the mountain in gear that actually performs.
              </p>
              <p className="font-body text-white/30 text-sm leading-relaxed mb-10">
                Atomic skis refreshed 2023. Burton snowboards brand new 2024. Outerwear upgraded 2025.
              </p>
              <Link href="/book" className="group inline-flex items-center gap-3 bg-[#C8FF00] hover:bg-[#d4ff1a] text-[#0e0e12] font-bold px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200">
                Browse & Book
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-2">
              {fleetItems.map((item, i) => (
                <div key={i} className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] hover:border-[#C8FF00]/40 p-6 flex items-center justify-between rounded-xl transition-all duration-200">
                  <div>
                    <h4 className="font-display font-bold text-white text-lg leading-tight mb-1">{item.name}</h4>
                    <p className="font-body text-white/40 text-sm">{item.detail}</p>
                  </div>
                  <span className="font-body text-[9px] tracking-[0.18em] uppercase bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20 px-3 py-1.5 rounded-full flex-shrink-0 ml-4">
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEASON RENTALS — LIME ────────────────────────────────────────── */}
      {/* Bold lime section — high contrast, high energy */}
      <section className="py-24 md:py-32 bg-[#C8FF00] relative overflow-hidden">
        {/* Decorative large circle */}
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full border-2 border-[#0e0e12]/10 pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-[300px] h-[300px] rounded-full border-2 border-[#0e0e12]/8 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-[#0e0e12] text-[#C8FF00] font-body text-[10px] tracking-[0.25em] uppercase px-4 py-1.5 mb-8 rounded-full">
                New for 2025
              </div>
              <h2 className="font-display font-black text-[#0e0e12] leading-none mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}>
                SEASON<br />RENTALS
              </h2>
              <p className="font-body text-[#0e0e12]/70 leading-relaxed mb-10" style={{ fontSize: "clamp(1rem, 1.5vw, 1.15rem)" }}>
                Planning to ski all season? Lock in a 3–4 month rental with monthly billing. Includes a free mid-season tune.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/book" className="group inline-flex items-center gap-3 bg-[#0e0e12] hover:bg-[#1e1e24] text-white font-bold px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200 rounded-none">
                  Book a Season Rental
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="tel:0295973422" className="inline-flex items-center gap-3 border-2 border-[#0e0e12]/30 hover:border-[#0e0e12] text-[#0e0e12] px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200">
                  <Phone className="w-4 h-4" /> Call to Discuss
                </a>
              </div>
            </div>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                { title: "3–4 month season", desc: "Full season coverage for regular skiers and families." },
                { title: "Monthly billing", desc: "Spread the cost — 4 payments, first month upfront." },
                { title: "Free mid-season tune", desc: "Sharp edges keep you safer and more in control." },
                { title: "Best value per day", desc: "Significantly cheaper than repeated weekly hires." },
              ].map(({ title, desc }) => (
                <div key={title} className="bg-[#0e0e12]/8 rounded-2xl p-5 flex gap-4 items-start">
                  <div className="w-6 h-6 bg-[#0e0e12] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#C8FF00]" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-[#0e0e12] text-base">{title}</p>
                    <p className="font-body text-[#0e0e12]/60 text-sm mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — WHITE ─────────────────────────────────────────── */}
      <section id="how" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-[#C8FF00]" />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">The process</span>
              </div>
              <h2 className="font-display font-black text-[#0e0e12] leading-none" style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}>
                HOW IT<br />WORKS
              </h2>
            </div>
            <span className="hidden md:block font-display font-black text-[#0e0e12]/[0.04] leading-none select-none" style={{ fontSize: "clamp(4rem, 9vw, 9rem)" }}>03</span>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {/* Step number */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#C8FF00] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="font-display font-black text-[#0e0e12] text-lg">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block flex-1 h-px bg-[#0e0e12]/10" />
                  )}
                </div>
                <div className="text-[#0e0e12]/40 mb-4">{step.icon}</div>
                <h3 className="font-display font-bold text-[#0e0e12] text-xl mb-3 leading-tight">{step.title}</h3>
                <p className="font-body text-[#0e0e12]/50 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 border-t border-[#0e0e12]/8 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="font-body text-[#0e0e12]/50 text-sm">
              Use code <span className="text-[#0e0e12] font-bold tracking-wider">ONLINE15</span> at checkout to save 15%
            </p>
            <Link href="/book" className="group inline-flex items-center gap-3 bg-[#0e0e12] hover:bg-[#1e1e24] text-white font-bold px-8 py-4 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200">
              Start Booking
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── REVIEWS — WARM GREY ──────────────────────────────────────────── */}
      <section id="reviews" className="py-24 md:py-32 bg-[#f5f5f0]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-px bg-[#C8FF00]" />
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">Social proof</span>
            </div>
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[#C8FF00] text-[#C8FF00]" />)}
              </div>
              <span className="font-display font-black text-[#0e0e12] text-4xl">4.8</span>
              <span className="font-body text-[#0e0e12]/40 text-xs tracking-wider uppercase">480+ Google reviews</span>
            </div>
          </div>

          {/* Feature quote */}
          <blockquote className="bg-[#0e0e12] rounded-2xl p-10 md:p-14 mb-10 max-w-4xl">
            <p className="font-body text-white/80 leading-relaxed mb-6" style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)" }}>
              "Best gear hire in Sydney. Picked up our ski packages the night before, everything fitted perfectly, and the staff actually knew what they were talking about. Will never go anywhere else."
            </p>
            <cite className="font-body text-[#C8FF00] text-xs tracking-[0.2em] uppercase not-italic">— Sarah M., Perisher regular</cite>
          </blockquote>

          <div className="grid md:grid-cols-3 gap-5">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-[#0e0e12]/5">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-[#C8FF00] text-[#C8FF00]" />)}
                </div>
                <p className="font-body text-[#0e0e12]/60 text-sm leading-relaxed mb-5">"{r.text}"</p>
                <span className="font-body text-[#0e0e12]/30 text-xs tracking-[0.18em] uppercase">— {r.author}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ — DARK ───────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 md:py-32 bg-[#111118]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 lg:gap-24">
            <div className="md:sticky md:top-32 md:self-start">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-[#C8FF00]" />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">Got questions</span>
              </div>
              <h2 className="font-display font-black text-white leading-none mb-8" style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}>
                COMMON<br />QUESTIONS
              </h2>
              <a href="tel:0295973422" className="group inline-flex items-center gap-3 border border-white/15 hover:border-[#C8FF00]/50 text-white/60 hover:text-[#C8FF00] px-6 py-3 font-body text-xs tracking-[0.15em] uppercase transition-colors">
                <Phone className="w-4 h-4" /> (02) 9597 3422
              </a>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {faqs.map((faq, i) => (
                <details key={i} className="group py-7 cursor-pointer">
                  <summary className="flex items-center justify-between font-body font-medium text-sm text-white/50 hover:text-white transition-colors duration-200 list-none">
                    {faq.question}
                    <span className="font-display font-bold text-white/20 group-open:rotate-45 group-open:text-[#C8FF00] transition-all duration-300 ml-6 flex-shrink-0 text-2xl leading-none">+</span>
                  </summary>
                  <p className="mt-4 font-body text-sm text-white/30 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — LIME ─────────────────────────────────────────────── */}
      {/* End on energy — lime sends them to book */}
      <section className="py-24 md:py-36 bg-[#C8FF00] relative overflow-hidden">
        {/* Big watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden>
          <span className="font-display font-black text-[#0e0e12]/[0.06] whitespace-nowrap" style={{ fontSize: "clamp(6rem, 18vw, 18rem)" }}>
            BOOK NOW
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-[#0e0e12]/30" />
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#0e0e12]/50">Rockdale, Sydney</span>
            <span className="w-8 h-px bg-[#0e0e12]/30" />
          </div>
          <h2 className="font-display font-black text-[#0e0e12] leading-none mb-8" style={{ fontSize: "clamp(3rem, 9vw, 9rem)" }}>
            READY TO<br />RIDE?
          </h2>
          <p className="font-body text-[#0e0e12]/60 max-w-xl mx-auto mb-10" style={{ fontSize: "clamp(1rem, 1.5vw, 1.1rem)" }}>
            35+ years outfitting Sydney's mountain community. Book online and save 15% with code{" "}
            <span className="text-[#0e0e12] font-bold">ONLINE15</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="group inline-flex items-center justify-center gap-3 bg-[#0e0e12] hover:bg-[#1e1e24] text-white font-bold px-10 py-5 font-body text-xs tracking-[0.2em] uppercase transition-colors duration-200">
              Book Your Gear
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="tel:0295973422" className="inline-flex items-center justify-center gap-3 border-2 border-[#0e0e12]/25 hover:border-[#0e0e12] text-[#0e0e12] px-10 py-5 font-body text-xs tracking-[0.2em] uppercase transition-colors duration-200">
              <Phone className="w-4 h-4" /> (02) 9597 3422
            </a>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes snowFall {
          0% { transform: translateY(-8px) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.4; }
          100% { transform: translateY(100vh) translateX(30px); opacity: 0; }
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

const snowParticles = Array.from({ length: 40 }, (_, i) => ({
  size: `${1.5 + (Math.sin(i * 2.3) + 1) * 2}px`,
  left: `${(i * 2.6) % 100}%`,
  duration: 10 + (i % 7) * 2,
  delay: -((i * 1.3) % 14),
}))

const stars = Array.from({ length: 60 }, (_, i) => ({
  size: `${0.5 + (Math.sin(i * 1.7) + 1) * 1}px`,
  left: `${(i * 1.618) % 100}%`,
  top: `${(i * 2.1) % 55}%`,
  opacity: 0.2 + (Math.sin(i * 3.1) + 1) * 0.3,
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
