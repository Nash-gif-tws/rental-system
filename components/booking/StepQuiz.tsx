"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

export type QuizAnswers = {
  sport: "ski" | "snowboard" | "both" | ""
  experience: "beginner" | "intermediate" | "advanced" | ""
  group: "solo" | "couple" | "family" | ""
}

const INITIAL: QuizAnswers = { sport: "", experience: "", group: "" }

function OptionBtn({ label, sub, selected, onClick }: {
  label: string; sub?: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 ${
        selected
          ? "bg-[#C4A04A]/10 border-[#C4A04A] text-white"
          : "bg-[#121212] border-[#2e2e2e] text-[#B4B4B4] hover:border-[#C4A04A]/40 hover:text-white"
      }`}
    >
      <p className="text-sm font-semibold">{label}</p>
      {sub && <p className="text-[11px] text-[#555] mt-0.5">{sub}</p>}
    </button>
  )
}

export default function StepQuiz({ onComplete, onSkip }: {
  onComplete: (answers: QuizAnswers) => void
  onSkip: () => void
}) {
  const [answers, setAnswers] = useState<QuizAnswers>(INITIAL)

  const set = <K extends keyof QuizAnswers>(key: K, val: QuizAnswers[K]) =>
    setAnswers((prev) => ({ ...prev, [key]: val }))

  const allAnswered = answers.sport && answers.experience && answers.group

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-5 h-px bg-[#C4A04A]" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C4A04A]">Quick match</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white leading-tight">
          Let's find the<br />right gear for you
        </h1>
        <p className="text-[#B4B4B4] text-sm mt-2">
          3 quick questions — we'll highlight the best packages for your trip.
        </p>
      </div>

      {/* Q1 — Sport */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5 space-y-3">
        <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-[0.2em]">
          <span className="text-[#C4A04A]">01</span> · What do you want to do?
        </p>
        <div className="space-y-2">
          <OptionBtn label="⛷  Skiing" sub="Skis, boots & poles" selected={answers.sport === "ski"} onClick={() => set("sport", "ski")} />
          <OptionBtn label="🏂  Snowboarding" sub="Board & boots" selected={answers.sport === "snowboard"} onClick={() => set("sport", "snowboard")} />
          <OptionBtn label="Both / Not sure yet" selected={answers.sport === "both"} onClick={() => set("sport", "both")} />
        </div>
      </div>

      {/* Q2 — Experience */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5 space-y-3">
        <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-[0.2em]">
          <span className="text-[#C4A04A]">02</span> · Experience level?
        </p>
        <div className="space-y-2">
          <OptionBtn label="Beginner" sub="First time or still learning the basics" selected={answers.experience === "beginner"} onClick={() => set("experience", "beginner")} />
          <OptionBtn label="Intermediate" sub="Comfortable on groomed runs, working on technique" selected={answers.experience === "intermediate"} onClick={() => set("experience", "intermediate")} />
          <OptionBtn label="Advanced" sub="All terrain, confident at speed" selected={answers.experience === "advanced"} onClick={() => set("experience", "advanced")} />
        </div>
      </div>

      {/* Q3 — Group */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5 space-y-3">
        <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-[0.2em]">
          <span className="text-[#C4A04A]">03</span> · Who's going?
        </p>
        <div className="space-y-2">
          <OptionBtn label="Just me" selected={answers.group === "solo"} onClick={() => set("group", "solo")} />
          <OptionBtn label="Me + partner / friend" selected={answers.group === "couple"} onClick={() => set("group", "couple")} />
          <OptionBtn label="Family (including kids)" sub="We'll show kids packages too" selected={answers.group === "family"} onClick={() => set("group", "family")} />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => allAnswered && onComplete(answers)}
          disabled={!allAnswered}
          className="w-full flex items-center justify-center gap-2 bg-[#C4A04A] hover:bg-[#d4b565] disabled:opacity-35 disabled:cursor-not-allowed text-[#121212] font-bold py-4 rounded-xl transition-colors text-sm tracking-widest uppercase"
        >
          Show My Recommendations
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={onSkip}
          className="w-full text-center text-xs text-[#555] hover:text-[#B4B4B4] py-2 transition-colors"
        >
          Skip — browse all gear
        </button>
      </div>
    </div>
  )
}
