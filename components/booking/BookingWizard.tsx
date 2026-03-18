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
  startDate: "",
  endDate: "",
  rentalDays: 0,
  items: [],
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  height: "",
  weight: "",
  bootSize: "",
  skillLevel: "",
  notes: "",
}

const STEPS = ["Dates", "Equipment", "Your Details", "Confirm"]

export default function BookingWizard() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<BookingState>(INITIAL_STATE)
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null)

  function updateState(updates: Partial<BookingState>) {
    setState((prev) => ({ ...prev, ...updates }))
  }

  if (confirmedBooking) {
    return <BookingSuccess booking={confirmedBooking} />
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    i < step
                      ? "bg-sky-600 text-white"
                      : i === step
                      ? "bg-sky-600 text-white ring-4 ring-sky-100"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs mt-1 font-medium ${i === step ? "text-sky-600" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-10px] ${i < step ? "bg-sky-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      {step === 0 && (
        <StepDates
          state={state}
          onUpdate={updateState}
          onNext={() => setStep(1)}
        />
      )}
      {step === 1 && (
        <StepEquipment
          state={state}
          onUpdate={updateState}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <StepDetails
          state={state}
          onUpdate={updateState}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepConfirm
          state={state}
          onBack={() => setStep(2)}
          onConfirmed={setConfirmedBooking}
        />
      )}
    </div>
  )
}
