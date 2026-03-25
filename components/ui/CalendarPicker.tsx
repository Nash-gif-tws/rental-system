"use client"

import { DayPicker } from "react-day-picker"
import type { DateRange } from "react-day-picker"

export type { DateRange }

// Dark-theme classNames for react-day-picker v9 — no CSS import needed
const CLASSES: Partial<Record<string, string>> = {
  root: "text-white select-none",
  months: "flex gap-4",
  month: "",
  month_caption: "relative flex items-center justify-center h-9 mb-2",
  caption_label: "text-sm font-semibold text-white",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between h-9",
  button_previous:
    "h-9 w-9 flex items-center justify-center rounded-lg text-[#B4B4B4] hover:text-white hover:bg-white/10 transition-colors",
  button_next:
    "h-9 w-9 flex items-center justify-center rounded-lg text-[#B4B4B4] hover:text-white hover:bg-white/10 transition-colors",
  month_grid: "w-full",
  weekdays: "",
  weekday:
    "text-[10px] font-medium text-[#555] uppercase tracking-wider text-center w-9 h-6",
  weeks: "",
  week: "",
  day: "p-0 text-center relative w-9 h-9",
  day_button:
    "w-9 h-9 bg-transparent border-0 cursor-pointer rounded-full text-sm text-white transition-colors hover:bg-white/10 focus:outline-none block mx-auto",
  selected: "bg-[#C4A04A] !text-[#121212] font-semibold hover:bg-[#d4b565]",
  today: "font-bold text-[#C4A04A]",
  outside: "opacity-25",
  disabled: "opacity-20 cursor-not-allowed pointer-events-none",
  range_start: "bg-[#C4A04A]/20 rounded-l-full",
  range_end: "bg-[#C4A04A]/20 rounded-r-full",
  range_middle: "bg-[#C4A04A]/10",
  hidden: "invisible",
}

export function CalendarRangePicker({
  selected,
  onSelect,
  disabled,
}: {
  selected: DateRange | undefined
  onSelect: (range: DateRange | undefined) => void
  disabled?: { before: Date }
}) {
  return (
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      classNames={CLASSES as any}
    />
  )
}
