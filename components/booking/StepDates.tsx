"use client"

import { differenceInDays } from "date-fns"
import { ArrowRight, MapPin } from "lucide-react"
import type { BookingState } from "./BookingWizard"

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

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-5 h-px bg-[#C8FF00]" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">Step 1</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white leading-tight">When do you<br />need gear?</h1>
        <p className="text-[#B4B4B4] text-sm mt-2">Select your pickup and return dates to see availability.</p>
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
            <div>
              <p className="text-sm font-semibold text-white">{rentalDays}-day rental</p>
              <p className="text-xs text-[#B4B4B4]">
                {rentalDays >= 7 ? "Weekly rate applies — great value!" :
                 rentalDays >= 3 ? "3+ day rate applies" :
                 "Daily rate applies"}
              </p>
            </div>
          </div>
        )}
      </div>

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
