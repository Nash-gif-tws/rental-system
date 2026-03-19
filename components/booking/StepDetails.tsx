"use client"

import { ArrowRight, ArrowLeft } from "lucide-react"
import type { BookingState } from "./BookingWizard"

const inputClass = "w-full px-4 py-3 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C8FF00] transition-colors"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-[0.2em] mb-1.5">
        {label}
      </label>
      {hint && <p className="text-xs text-[#B4B4B4]/60 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

export default function StepDetails({ state, onUpdate, onNext, onBack }: {
  state: BookingState; onUpdate: (u: Partial<BookingState>) => void
  onNext: () => void; onBack: () => void
}) {
  const valid = state.firstName && state.lastName && state.email

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="w-5 h-px bg-[#C8FF00]" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">Step 3</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white leading-tight">Your details</h1>
        <p className="text-[#B4B4B4] text-sm mt-2">We use this to prepare your gear before you arrive.</p>
      </div>

      {/* Contact */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
        <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-[0.25em]">Contact Info</p>
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
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
        <div>
          <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-[0.25em]">Fitting Info</p>
          <p className="text-xs text-[#B4B4B4]/50 mt-1">Helps us prep the right gear so you spend less time in store.</p>
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
            <select value={state.skillLevel} onChange={(e) => onUpdate({ skillLevel: e.target.value })} className={inputClass + " bg-[#121212]"}>
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
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6">
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
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-4 bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl text-sm font-semibold text-[#B4B4B4] hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className="flex-1 flex items-center justify-center gap-2 bg-[#C8FF00] hover:bg-[#b3e600] disabled:opacity-40 disabled:cursor-not-allowed text-[#121212] font-bold py-4 rounded-xl transition-colors text-sm tracking-widest uppercase"
        >
          Review Booking <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
