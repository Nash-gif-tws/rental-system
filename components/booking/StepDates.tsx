"use client"

import { differenceInDays } from "date-fns"
import { Calendar, ChevronRight } from "lucide-react"
import type { BookingState } from "./BookingWizard"

export default function StepDates({
  state,
  onUpdate,
  onNext,
}: {
  state: BookingState
  onUpdate: (u: Partial<BookingState>) => void
  onNext: () => void
}) {
  const today = new Date().toISOString().split("T")[0]

  const rentalDays =
    state.startDate && state.endDate
      ? Math.max(1, differenceInDays(new Date(state.endDate), new Date(state.startDate)))
      : 0

  function handleNext() {
    onUpdate({ rentalDays })
    onNext()
  }

  const valid = state.startDate && state.endDate && state.endDate > state.startDate

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">When do you need gear?</h1>
        <p className="text-gray-500 mt-1">Select your pickup and return dates.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-sky-600" />
                Pickup Date
              </span>
            </label>
            <input
              type="date"
              min={today}
              value={state.startDate}
              onChange={(e) => {
                onUpdate({ startDate: e.target.value, endDate: "" })
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-sky-600" />
                Return Date
              </span>
            </label>
            <input
              type="date"
              min={state.startDate || today}
              value={state.endDate}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
              disabled={!state.startDate}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
            />
          </div>
        </div>

        {rentalDays > 0 && (
          <div className="bg-sky-50 rounded-xl px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-sky-500 rounded-full" />
            <p className="text-sm font-medium text-sky-700">
              {rentalDays} day{rentalDays !== 1 ? "s" : ""} rental
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">📍 Pickup & return in store</p>
        <p className="text-amber-700">All rentals are picked up and returned at our Rockdale store. Open 7 days during snow season.</p>
      </div>

      <button
        onClick={handleNext}
        disabled={!valid}
        className="w-full bg-sky-600 text-white py-4 rounded-xl font-semibold text-sm hover:bg-sky-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Choose Equipment
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
