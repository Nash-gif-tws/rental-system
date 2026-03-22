"use client"

import { useEffect, useState } from "react"
import { differenceInDays } from "date-fns"
import { ArrowRight, MapPin, CreditCard, RefreshCcw, Tag } from "lucide-react"
import type { BookingState } from "./BookingWizard"

type PriceItem = { slug: string; label: string; price: number }
type PriceGroup = { group: string; items: PriceItem[] }

const DISCOUNT_TIERS = [
  { label: "1–5 days", days: "1–5", saving: null },
  { label: "6–10 days", days: "6–10", saving: "Better daily rate" },
  { label: "10+ days", days: "10+", saving: "Best daily rate" },
]

export default function StepDates({ state, onUpdate, onNext }: {
  state: BookingState
  onUpdate: (u: Partial<BookingState>) => void
  onNext: () => void
}) {
  const _now = new Date()
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-${String(_now.getDate()).padStart(2, "0")}`
  const rentalDays = state.startDate && state.endDate
    ? Math.max(1, differenceInDays(new Date(state.endDate), new Date(state.startDate)))
    : 0
  const valid = state.startDate && state.endDate && state.endDate > state.startDate

  const [pricingGroups, setPricingGroups] = useState<PriceGroup[]>([])

  useEffect(() => {
    if (!rentalDays) { setPricingGroups([]); return }
    fetch(`/api/pricing-preview?days=${rentalDays}`)
      .then((r) => r.json())
      .then(setPricingGroups)
      .catch(() => {})
  }, [rentalDays])

  const activeTier =
    rentalDays >= 10 ? 2 :
    rentalDays >= 6  ? 1 : 0

  const discountNudge =
    rentalDays >= 6  ? null :
    rentalDays >= 3  ? "Book 6+ days and unlock a better daily rate" :
    rentalDays >= 1  ? "Book 6+ days to unlock multi-day savings" : null

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-5 h-px bg-[#C4A04A]" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C4A04A]">Step 1 of 4</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white leading-tight">When do you<br />need gear?</h1>
        <p className="text-[#B4B4B4] text-sm mt-2">Pick your dates — prices update instantly below.</p>
      </div>

      {/* Date inputs */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-[0.2em] mb-2">Pickup date</label>
            <input
              type="date"
              min={today}
              value={state.startDate}
              onChange={(e) => onUpdate({ startDate: e.target.value, endDate: "" })}
              className="w-full px-4 py-3 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white focus:outline-none focus:border-[#C4A04A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-[0.2em] mb-2">Return date</label>
            <input
              type="date"
              min={state.startDate || today}
              value={state.endDate}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
              disabled={!state.startDate}
              className="w-full px-4 py-3 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white focus:outline-none focus:border-[#C4A04A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {rentalDays > 0 && (
          <div className="flex items-center gap-3 bg-[#C4A04A]/8 border border-[#C4A04A]/25 rounded-lg px-4 py-3">
            <div className="w-9 h-9 bg-[#C4A04A] rounded-lg flex items-center justify-center text-[#121212] text-sm font-bold flex-shrink-0">
              {rentalDays}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{rentalDays}-day rental</p>
              {discountNudge
                ? <p className="text-xs text-[#C4A04A]/70 mt-0.5">{discountNudge}</p>
                : <p className="text-xs text-[#C4A04A] mt-0.5 font-medium">✓ Multi-day rate applied</p>
              }
            </div>
          </div>
        )}
      </div>

      {/* Pricing preview — auto-shown when dates selected */}
      {pricingGroups.length > 0 && (
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#2e2e2e]">
            <p className="text-sm font-bold text-white mb-0.5">
              Estimated prices for {rentalDays} day{rentalDays !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-[#B4B4B4]/60">No payment until pickup — exact total shown at checkout</p>
          </div>

          {/* Discount tier indicator */}
          <div className="px-5 py-4 border-b border-[#2e2e2e]">
            <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-[0.2em] mb-3">Pricing tiers</p>
            <div className="grid grid-cols-3 gap-2">
              {DISCOUNT_TIERS.map((tier, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2.5 text-center transition-all ${
                    i === activeTier
                      ? "bg-[#C4A04A]/15 border border-[#C4A04A]/40"
                      : "bg-[#121212] border border-[#2e2e2e]"
                  }`}
                >
                  <p className={`text-[11px] font-bold ${i === activeTier ? "text-[#C4A04A]" : "text-[#555]"}`}>
                    {tier.days} days
                  </p>
                  <p className={`text-[10px] mt-0.5 ${i === activeTier ? "text-[#C4A04A]/70" : "text-[#444]"}`}>
                    {i === 0 ? "Standard" : tier.saving}
                  </p>
                  {i === activeTier && (
                    <p className="text-[9px] text-[#C4A04A] font-bold mt-0.5 uppercase tracking-wide">← Your rate</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Package prices */}
          <div className="px-5 py-4 space-y-5">
            {pricingGroups.map(({ group, items }) => (
              <div key={group}>
                <p className="text-[10px] font-bold text-[#C4A04A] uppercase tracking-[0.2em] mb-2.5">{group}</p>
                <div className="space-y-2">
                  {items.map(({ slug, label, price }) => (
                    <div key={slug} className="flex items-center justify-between">
                      <p className="text-sm text-[#B4B4B4]">{label}</p>
                      <p className="text-sm font-bold text-white">${price.toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-[11px] text-[#444] pt-2 border-t border-[#2e2e2e]">
              Sizes selected in the next step. Exact total shown before you confirm.
            </p>
          </div>
        </div>
      )}

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: CreditCard, label: "Pay at pickup", sub: "No card needed to book" },
          { icon: RefreshCcw, label: "Free swap", sub: "If the fit isn't right" },
          { icon: Tag, label: "15% off online", sub: "Code ONLINE15" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-3 text-center">
            <Icon className="h-4 w-4 text-[#C4A04A] mx-auto mb-1.5" />
            <p className="text-[11px] font-semibold text-white leading-tight">{label}</p>
            <p className="text-[10px] text-[#555] mt-0.5 leading-tight">{sub}</p>
          </div>
        ))}
      </div>

      {/* Location */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl px-4 py-3.5 flex gap-3">
        <MapPin className="h-4 w-4 text-[#C4A04A] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-white">Pickup & return in store</p>
          <p className="text-[#B4B4B4] mt-0.5 text-xs">Princes Highway, Rockdale — open 7 days during snow season.</p>
        </div>
      </div>

      <button
        onClick={() => { onUpdate({ rentalDays }); onNext() }}
        disabled={!valid}
        className="w-full flex items-center justify-center gap-2 bg-[#C4A04A] hover:bg-[#d4b565] disabled:opacity-40 disabled:cursor-not-allowed text-[#121212] font-bold py-4 rounded-xl transition-colors text-sm tracking-widest uppercase"
      >
        See Available Gear
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
