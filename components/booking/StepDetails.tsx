"use client"

import { ArrowRight, ArrowLeft } from "lucide-react"
import type { BookingState } from "./BookingWizard"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"

export default function StepDetails({ state, onUpdate, onNext, onBack }: {
  state: BookingState; onUpdate: (u: Partial<BookingState>) => void
  onNext: () => void; onBack: () => void
}) {
  const valid = state.firstName && state.lastName && state.email

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your details</h1>
        <p className="text-gray-500 text-sm mt-1">We use this to prepare your gear before you arrive.</p>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Info</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name *">
            <input value={state.firstName} onChange={(e) => onUpdate({ firstName: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Last Name *">
            <input value={state.lastName} onChange={(e) => onUpdate({ lastName: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Email *">
            <input type="email" value={state.email} onChange={(e) => onUpdate({ email: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Phone">
            <input type="tel" value={state.phone} onChange={(e) => onUpdate({ phone: e.target.value })} className={inputClass} />
          </Field>
        </div>
      </div>

      {/* Fitting */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fitting Info</p>
          <p className="text-xs text-gray-400 mt-1">Helps us prep the right gear so you spend less time in store.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Height (cm)" hint="e.g. 175">
            <input type="number" placeholder="175" value={state.height} onChange={(e) => onUpdate({ height: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Weight (kg)" hint="e.g. 70">
            <input type="number" placeholder="70" value={state.weight} onChange={(e) => onUpdate({ weight: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Boot Size (EU)" hint="e.g. 42">
            <input type="number" step="0.5" placeholder="42" value={state.bootSize} onChange={(e) => onUpdate({ bootSize: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Skill Level">
            <select value={state.skillLevel} onChange={(e) => onUpdate({ skillLevel: e.target.value })} className={inputClass + " bg-gray-50"}>
              <option value="">Select...</option>
              <option value="BEGINNER">Beginner — first time or learning</option>
              <option value="INTERMEDIATE">Intermediate — comfortable on groomed runs</option>
              <option value="ADVANCED">Advanced — all terrain confident</option>
              <option value="EXPERT">Expert / Instructor</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <Field label="Special requests or notes" hint="Kids gear, specific brands, anything helpful to know">
          <textarea
            rows={3}
            placeholder="e.g. Two adults and two kids, need beginner-friendly setup..."
            value={state.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className={inputClass + " resize-none"}
          />
        </Field>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 px-5 py-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all text-sm"
        >
          Review Booking <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
