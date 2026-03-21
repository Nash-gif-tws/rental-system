"use client"

import { useEffect, useState } from "react"
import { differenceInDays } from "date-fns"
import { ArrowRight, MapPin, ChevronDown } from "lucide-react"
import type { BookingState } from "./BookingWizard"

type PriceItem = { slug: string; label: string; price: number }
type PriceGroup = { group: string; items: PriceItem[] }

export default function StepDates({ state, onUpdate, onNext }: {
  state: BookingState
  onUpdate: (u: Partial<BookingState>) => void
  onNext: () => void
}) {
  const today = new Date().toISOString().split("T")[0]
  const rentalDays = state.startDate && state.endDate
    ? Math.max(1, differenceInDays(new Date(state.endDate), new Date(state.startDate)))
    : 0
  const valid = state.startDate && state.endDate && state.endDate > state.startDate

  const [pricingGroups, setPricingGroups] = useState<PriceGroup[]>([])
  const [pricingOpen, setPricingOpen] = useState(false)

  useEffect(() => {
    if (!rentalDays) { setPricingGroups([]); return }
    fetch(`/api/pricing-preview?days=${rentalDays}`)
      .then((r) => r.json())
      .then(setPricingGroups)
      .catch(() => {})
  }, [rentalDays])

  const tierLabel =
    rentalDays >= 10 ? "6–10 day rate" :
    rentalDays >= 6  ? "6–10 day rate" :
    rentalDays >= 1  ? "1–5 day rate" : ""

  const discountNote =
    rentalDays >= 6 ? "Multi-day discount applied" :
    rentalDays >= 3 ? "Tip: 6+ days unlocks a cheaper daily rate" : ""

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-5 h-px bg-[#C8FF00]" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">Step 1</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white leading-tight">When do you<br />need gear?</h1>
        <p className="text-[#B4B4B4] text-sm mt-2">Select your pickup and return dates to see availability and pricing.</p>
      </div>

      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-[0.2em] mb-2">Pickup date</label>
            <input
              type="date"
              min={today}
              value={state.startDate}
              onChange={(e) => onUpdate({ startDate: e.target.value, endDate: "" })}
              className="w-full px-4 py-3 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white focus:outline-none focus:border-[#C8FF00] transition-colors"
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
              className="w-full px-4 py-3 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white focus:outline-none focus:border-[#C8FF00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {rentalDays > 0 && (
          <div className="flex items-center gap-3 bg-[#C8FF00]/5 border border-[#C8FF00]/20 rounded-lg px-4 py-3">
            <div className="w-9 h-9 bg-[#C8FF00] rounded-lg flex items-center justify-center text-[#121212] text-sm font-bold flex-shrink-0">
              {rentalDays}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{rentalDays}-day rental · {tierLabel}</p>
              {discountNote && (
                <p className="text-xs text-[#C8FF00]/70 mt-0.5">{discountNote}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pricing preview */}
      {pricingGroups.length > 0 && (
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <button
            onClick={() => setPricingOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-white">Estimated pricing for {rentalDays} day{rentalDays !== 1 ? "s" : ""}</p>
              <p className="text-xs text-[#B4B4B4] mt-0.5">Tap to see what common packages cost</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-[#B4B4B4] transition-transform flex-shrink-0 ${pricingOpen ? "rotate-180" : ""}`} />
          </button>

          {pricingOpen && (
            <div className="border-t border-[#2e2e2e] px-5 pb-5 pt-4 space-y-5">
              {pricingGroups.map(({ group, items }) => (
                <div key={group}>
                  <p className="text-[10px] font-bold text-[#C8FF00] uppercase tracking-[0.2em] mb-2.5">{group}</p>
                  <div className="space-y-1.5">
                    {items.map(({ slug, label, price }) => (
                      <div key={slug} className="flex items-center justify-between">
                        <p className="text-sm text-[#E6E6E6]">{label}</p>
                        <p className="text-sm font-bold text-white">${price.toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-[#555] pt-1 border-t border-[#2e2e2e] mt-3">
                Prices are for the full rental period. Packages include all listed components — sizes selected in the next step.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl px-4 py-3.5 flex gap-3">
        <MapPin className="h-4 w-4 text-[#C8FF00] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-white">Pickup & return in store</p>
          <p className="text-[#B4B4B4] mt-0.5 text-xs">Princes Highway, Rockdale — open 7 days during snow season.</p>
        </div>
      </div>

      <button
        onClick={() => { onUpdate({ rentalDays }); onNext() }}
        disabled={!valid}
        className="w-full flex items-center justify-center gap-2 bg-[#C8FF00] hover:bg-[#b3e600] disabled:opacity-40 disabled:cursor-not-allowed text-[#121212] font-bold py-4 rounded-xl transition-colors text-sm tracking-widest uppercase"
      >
        See Available Gear
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
