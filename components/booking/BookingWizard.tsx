"use client"

import { useState } from "react"
import StepDates from "./StepDates"
import StepQuiz, { type QuizAnswers } from "./StepQuiz"
import StepEquipment from "./StepEquipment"
import StepDetails from "./StepDetails"
import StepConfirm from "./StepConfirm"
import BookingSuccess from "./BookingSuccess"
import { ChevronDown, Phone } from "lucide-react"

const BOOKING_FAQS = [
  { q: "Do I need to pay online?", a: "No payment required to book. Pay by cash, card or EFTPOS when you pick up in store." },
  { q: "What if the gear doesn't fit?", a: "No problem — we swap it same-day at no extra cost. Our staff are experienced fitters." },
  { q: "Can I cancel my booking?", a: "Yes, free cancellation any time before pickup. Just call us on (02) 9597 3422." },
  { q: "What's included in a package?", a: "Ski packages include skis, boots & poles. Snowboard packages include a board & boots. Outerwear is separate." },
  { q: "Do you have kids' gear?", a: "Yes — full range of kids' skis, snowboards, boots and outerwear. Select a Kids Package in Step 2." },
]

function BookingFAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="max-w-2xl mx-auto px-5 pb-10 pt-2">
      <div className="border-t border-white/[0.06] pt-8">
        <p className="text-[10px] font-bold text-[#C4A04A] uppercase tracking-[0.3em] mb-4">Common questions</p>
        <div className="space-y-1">
          {BOOKING_FAQS.map(({ q, a }, i) => (
            <div key={i} className="border border-[#2e2e2e] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors gap-3"
              >
                <p className="text-sm font-medium text-white/70">{q}</p>
                <ChevronDown className={`h-4 w-4 text-[#555] flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-4 pb-4 border-t border-[#2e2e2e]">
                  <p className="text-sm text-[#B4B4B4]/70 leading-relaxed pt-3">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-[#444] mt-5 text-center">
          Still got questions?{" "}
          <a href="tel:0295973422" className="text-[#C4A04A] hover:text-white transition-colors">(02) 9597 3422</a>
        </p>
      </div>
    </div>
  )
}

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
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null)
  const [state, setState] = useState<BookingState>(INITIAL_STATE)
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null)

  function updateState(updates: Partial<BookingState>) {
    setState((prev) => ({ ...prev, ...updates }))
  }

  function afterDates() {
    setShowQuiz(true)
  }

  function onQuizComplete(answers: QuizAnswers) {
    setQuizAnswers(answers)
    setShowQuiz(false)
    setStep(1)
  }

  function onQuizSkip() {
    setQuizAnswers(null)
    setShowQuiz(false)
    setStep(1)
  }

  if (confirmedBooking) return <BookingSuccess booking={confirmedBooking} />

  return (
    <div className="max-w-2xl mx-auto px-5 pt-28 pb-16">
      {/* Step indicator — only show when not in quiz interstitial */}
      {!showQuiz && (
        <div className="flex items-center mb-10">
          {STEPS.map(({ label, icon }, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < step
                    ? "bg-[#C4A04A] text-[#121212]"
                    : i === step
                    ? "bg-[#C4A04A] text-[#121212] ring-4 ring-[#C4A04A]/20 scale-110"
                    : "bg-[#1e1e1e] text-[#B4B4B4] border border-[#2e2e2e]"
                }`}>
                  {i < step ? "✓" : icon}
                </div>
                <span className={`text-[10px] font-medium tracking-wider uppercase hidden sm:block ${
                  i === step ? "text-[#C4A04A]" : "text-[#B4B4B4]/50"
                }`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 mb-5 transition-all duration-500 ${
                  i < step ? "bg-[#C4A04A]" : "bg-[#2e2e2e]"
                }`} />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 0 && !showQuiz && (
        <StepDates state={state} onUpdate={updateState} onNext={afterDates} />
      )}
      {showQuiz && (
        <StepQuiz onComplete={onQuizComplete} onSkip={onQuizSkip} />
      )}
      {step === 1 && !showQuiz && (
        <StepEquipment
          state={state}
          onUpdate={updateState}
          onNext={() => setStep(2)}
          onBack={() => { setStep(0); setShowQuiz(false) }}
          quizAnswers={quizAnswers}
        />
      )}
      {step === 2 && <StepDetails state={state} onUpdate={updateState} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <StepConfirm state={state} onBack={() => setStep(2)} onConfirmed={setConfirmedBooking} />}
      <BookingFAQ />
    </div>
  )
}
