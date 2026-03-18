"use client"

import { ChevronRight, ChevronLeft } from "lucide-react"
import type { BookingState } from "./BookingWizard"

export default function StepDetails({
  state,
  onUpdate,
  onNext,
  onBack,
}: {
  state: BookingState
  onUpdate: (u: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const valid = state.firstName && state.lastName && state.email

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your details</h1>
        <p className="text-gray-500 mt-1">We'll use this to prepare your gear and send your confirmation.</p>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Contact Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
            <input
              value={state.firstName}
              onChange={(e) => onUpdate({ firstName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
            <input
              value={state.lastName}
              onChange={(e) => onUpdate({ lastName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input
              type="email"
              value={state.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input
              type="tel"
              value={state.phone}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Fitting */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Fitting Info</h2>
          <p className="text-xs text-gray-500 mt-0.5">Helps us prepare the right gear for you before you arrive.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Height (cm)</label>
            <input
              type="number"
              placeholder="e.g. 175"
              value={state.height}
              onChange={(e) => onUpdate({ height: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight (kg)</label>
            <input
              type="number"
              placeholder="e.g. 70"
              value={state.weight}
              onChange={(e) => onUpdate({ weight: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Boot Size (EU)</label>
            <input
              type="number"
              step="0.5"
              placeholder="e.g. 42"
              value={state.bootSize}
              onChange={(e) => onUpdate({ bootSize: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Skill Level</label>
            <select
              value={state.skillLevel}
              onChange={(e) => onUpdate({ skillLevel: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">Select...</option>
              <option value="BEGINNER">Beginner — first time or learning</option>
              <option value="INTERMEDIATE">Intermediate — comfortable on most runs</option>
              <option value="ADVANCED">Advanced — confident on all terrain</option>
              <option value="EXPERT">Expert / Instructor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Any special requests or notes?</label>
        <textarea
          rows={3}
          placeholder="e.g. travelling with kids, specific equipment requests..."
          value={state.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-5 py-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className="flex-1 bg-sky-600 text-white py-4 rounded-xl font-semibold text-sm hover:bg-sky-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Review Booking
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
