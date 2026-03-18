"use client"

import { useState } from "react"
import StepDates from "./StepDates"
import StepEquipment from "./StepEquipment"
import StepDetails from "./StepDetails"
import StepConfirm from "./StepConfirm"
import BookingSuccess from "./BookingSuccess"

export type BookingItem = {
  productId: string
  productName: string
  category: string
  size: string
  quantity: number
  unitPrice: number
}

export type BookingState = {
  startDate: string
  endDate: string
  rentalDays: number
  items: BookingItem[]
  firstName: string
  lastName: string
  email: string
  phone: string
  height: string
  weight: string
  bootSize: string
  skillLevel: string
  notes: string
}

const INITIAL_STATE: BookingState = {
  startDate: "", endDate: "", rentalDays: 0, items: [],
  firstName: "", lastName: "", email: "", phone: "",
  height: "", weight: "", bootSize: "", skillLevel: "", notes: "",
}

const STEPS = [
  { label: "Dates", icon: "📅" },
  { label: "Equipment", icon: "🎿" },
  { label: "Details", icon: "👤" },
  { label: "Confirm", icon: "✓" },
]

export default function BookingWizard() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<BookingState>(INITIAL_STATE)
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null)

  function updateState(updates: Partial<BookingState>) {
    setState((prev) => ({ ...prev, ...updates }))
  }

  if (confirmedBooking) return <BookingSuccess booking={confirmedBooking} />

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      {/* Step indicator */}
      <div className="flex items-center mb-10">
        {STEPS.map(({ label, icon }, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < step ? "bg-sky-500 text-white"
                : i === step ? "bg-sky-500 text-white ring-4 ring-sky-100 scale-110"
                : "bg-gray-100 text-gray-400"
              }`}>
                {i < step ? "✓" : icon}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-sky-500" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 mb-5 transition-all duration-500 ${i < step ? "bg-sky-500" : "bg-gray-100"}`} />
            )}
          </div>
        ))}
      </div>

      {step === 0 && <StepDates state={state} onUpdate={updateState} onNext={() => setStep(1)} />}
      {step === 1 && <StepEquipment state={state} onUpdate={updateState} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <StepDetails state={state} onUpdate={updateState} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <StepConfirm state={state} onBack={() => setStep(2)} onConfirmed={setConfirmedBooking} />}
    </div>
  )
}
