"use client"

import { useState } from "react"
import { ArrowLeft, Calendar, Package, User, Tag } from "lucide-react"
import { format } from "date-fns"
import type { BookingState } from "./BookingWizard"

export default function StepConfirm({ state, onBack, onConfirmed }: {
  state: BookingState; onBack: () => void; onConfirmed: (booking: any) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [discountCode, setDiscountCode] = useState("")
  const [discountInfo, setDiscountInfo] = useState<{ valid: boolean; percent: number } | null>(null)

  const subtotal = state.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  // Preview discount locally for UX (server validates for real on submit)
  const PREVIEW_CODES: Record<string, number> = { ONLINE15: 15 }
  const previewPct = discountCode ? (PREVIEW_CODES[discountCode.toUpperCase().trim()] ?? 0) : 0
  const previewDiscount = Math.round(subtotal * (previewPct / 100) * 100) / 100
  const total = subtotal - previewDiscount

  async function handleConfirm() {
    setLoading(true)
    setError("")
    const res = await fetch("/api/bookings/public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { firstName: state.firstName, lastName: state.lastName, email: state.email, phone: state.phone || undefined },
        startDate: state.startDate, endDate: state.endDate,
        items: state.items.map((i) => ({ productId: i.productId, size: i.size || undefined, quantity: i.quantity })),
        height: state.height ? parseFloat(state.height) : undefined,
        weight: state.weight ? parseFloat(state.weight) : undefined,
        bootSize: state.bootSize ? parseFloat(state.bootSize) : undefined,
        skillLevel: state.skillLevel || undefined,
        notes: state.notes || undefined,
        discountCode: discountCode || undefined,
      }),
    })
    if (!res.ok) {
      setError("Something went wrong. Please try again or call us on (02) 9597 3422.")
      setLoading(false)
      return
    }
    const data = await res.json()
    setDiscountInfo({ valid: data.discountApplied, percent: data.discountPercent ?? 0 })
    onConfirmed(data)
  }

  const SectionHeader = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 bg-[#C4A04A]/10 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-[#C4A04A]" />
      </div>
      <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-[0.25em]">{label}</p>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-5 h-px bg-[#C4A04A]" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C4A04A]">Step 4</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white leading-tight">Review your<br />booking</h1>
        <p className="text-[#B4B4B4] text-sm mt-2">Looks good? Confirm and we'll prepare your gear.</p>
      </div>

      {/* Dates */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5">
        <SectionHeader icon={Calendar} label="Rental Period" />
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#252525] rounded-lg px-4 py-3 text-center">
            <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-wider">Pickup</p>
            <p className="font-bold text-white text-sm mt-0.5">{state.startDate ? format(new Date(state.startDate), "EEE d MMM") : "—"}</p>
          </div>
          <div className="text-[#B4B4B4] text-lg">→</div>
          <div className="flex-1 bg-[#252525] rounded-lg px-4 py-3 text-center">
            <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-wider">Return</p>
            <p className="font-bold text-white text-sm mt-0.5">{state.endDate ? format(new Date(state.endDate), "EEE d MMM") : "—"}</p>
          </div>
          <div className="bg-[#C4A04A]/10 border border-[#C4A04A]/20 rounded-lg px-3 py-3 text-center">
            <p className="text-[10px] font-bold text-[#C4A04A] uppercase tracking-wider">Days</p>
            <p className="font-bold text-[#C4A04A] text-sm mt-0.5">{state.rentalDays}</p>
          </div>
        </div>
      </div>

      {/* Equipment */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5">
        <SectionHeader icon={Package} label="Equipment" />
        <div className="space-y-2.5">
          {state.items.map((item, i) => {
            // Package sizes are stored as "Label: value · Label: value"
            const isMultiSize = item.size?.includes(" · ")
            return (
              <div key={i} className="flex items-start justify-between py-1 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{item.productName}</p>
                  {item.size && !isMultiSize && (
                    <p className="text-xs text-[#B4B4B4] mt-0.5">Size: {item.size}</p>
                  )}
                  {isMultiSize && (
                    <div className="mt-1 space-y-0.5">
                      {item.size!.split(" · ").map((part) => (
                        <p key={part} className="text-xs text-[#B4B4B4]">{part}</p>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold text-white flex-shrink-0">${(item.unitPrice * item.quantity).toFixed(2)}</p>
              </div>
            )
          })}

          {/* Discount code */}
          <div className="border-t border-[#2e2e2e] pt-4 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-3.5 w-3.5 text-[#B4B4B4]" />
              <p className="text-xs font-semibold text-[#B4B4B4]">Discount code</p>
            </div>
            <input
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="w-full px-3 py-2 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#C4A04A] transition-colors"
            />
            {discountCode && previewPct > 0 && (
              <p className="text-xs text-[#C4A04A] font-semibold mt-1.5">✓ {previewPct}% discount applied</p>
            )}
            {discountCode && previewPct === 0 && (
              <p className="text-xs text-red-400 mt-1.5">Invalid discount code</p>
            )}
          </div>

          <div className="border-t border-[#2e2e2e] pt-3 space-y-2">
            <div className="flex justify-between text-sm text-[#B4B4B4]">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {previewDiscount > 0 && (
              <div className="flex justify-between text-sm text-[#C4A04A] font-semibold">
                <span>Discount ({discountCode})</span>
                <span>−${previewDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-[#2e2e2e]">
              <span className="text-white">Est. Total</span>
              <span className="text-[#C4A04A]">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5">
        <SectionHeader icon={User} label="Your Details" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-white">{state.firstName} {state.lastName}</p>
          <p className="text-[#B4B4B4]">{state.email}</p>
          {state.phone && <p className="text-[#B4B4B4]">{state.phone}</p>}
          {state.skillLevel && <p className="text-[#B4B4B4]/60 text-xs mt-1 capitalize">Skill level: {state.skillLevel.toLowerCase()}</p>}
        </div>
      </div>

      {/* Notes */}
      <div className="flex gap-3 text-sm">
        <div className="flex-1 bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4">
          <p className="font-semibold text-white mb-0.5">💳 Pay in store</p>
          <p className="text-[#B4B4B4] text-xs">Cash, card or EFTPOS at pickup. No payment needed to book.</p>
        </div>
        <div className="flex-1 bg-[#1e1e1e] border border-[#C4A04A]/20 rounded-xl p-4">
          <p className="font-semibold text-[#C4A04A] mb-0.5">👨‍👩‍👧 Under 18?</p>
          <p className="text-[#B4B4B4] text-xs">Parent or guardian must be present at pickup to sign.</p>
        </div>
      </div>

      {/* Reassurance strip */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 space-y-2.5">
        <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-[0.2em] mb-3">Our guarantee</p>
        {[
          { icon: "✓", text: "Free cancellation — change of plans? No problem." },
          { icon: "✓", text: "Gear doesn't fit? We'll swap it same-day at no extra cost." },
          { icon: "✓", text: "Normal wear & tear is on us — no hidden damage charges." },
          { icon: "✓", text: "Expert staff on hand — questions before or during your rental, just call." },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-start gap-2.5">
            <span className="text-[#C4A04A] font-bold text-sm leading-none mt-0.5">{icon}</span>
            <p className="text-xs text-[#B4B4B4] leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-5 py-4 bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl text-sm font-semibold text-[#B4B4B4] hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-[#C4A04A] hover:bg-[#b3e600] disabled:opacity-50 text-[#121212] font-bold py-4 rounded-xl transition-colors text-sm tracking-widest uppercase"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" /> Confirming...</>
          ) : (
            <>Confirm Booking — ${total.toFixed(2)}</>
          )}
        </button>
      </div>
    </div>
  )
}
