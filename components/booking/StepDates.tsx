"use client"

import { differenceInDays } from "date-fns"
import { ArrowRight } from "lucide-react"
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
        <h1 className="text-2xl font-bold text-gray-900">When do you need gear?</h1>
        <p className="text-gray-500 text-sm mt-1">Select your pickup and return dates to see availability.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pickup date</label>
            <input
              type="date"
              min={today}
              value={state.startDate}
              onChange={(e) => onUpdate({ startDate: e.target.value, endDate: "" })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Return date</label>
            <input
              type="date"
              min={state.startDate || today}
              value={state.endDate}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
              disabled={!state.startDate}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {rentalDays > 0 && (
          <div className="flex items-center gap-3 bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {rentalDays}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{rentalDays}-day rental</p>
              <p className="text-xs text-gray-500">
                {rentalDays >= 7 ? "Weekly rate applies — great value!" :
                 rentalDays >= 3 ? "3+ day rate applies" :
                 "Daily rate applies"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3.5 flex gap-3">
        <span className="text-lg flex-shrink-0">📍</span>
        <div className="text-sm">
          <p className="font-semibold text-amber-900">Pickup & return in store</p>
          <p className="text-amber-700 mt-0.5">Princes Highway, Rockdale — open 7 days during snow season.</p>
        </div>
      </div>

      <button
        onClick={() => { onUpdate({ rentalDays }); onNext() }}
        disabled={!valid}
        className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all text-sm shadow-lg shadow-sky-100 hover:shadow-sky-200 hover:-translate-y-0.5 disabled:shadow-none disabled:translate-y-0"
      >
        See Available Gear
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
