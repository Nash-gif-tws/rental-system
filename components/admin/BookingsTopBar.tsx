"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Search, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"

// Use local date parts (not toISOString which is UTC) so the displayed date
// matches Sydney local time in the browser.
function formatDateParam(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatDisplayDate(d: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)

  if (target.getTime() === today.getTime()) return "Today"
  if (target.getTime() === tomorrow.getTime()) return "Tomorrow"

  return target.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })
}

export default function BookingsTopBar({
  selectedDate,
  searchQuery,
}: {
  selectedDate: string
  searchQuery: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Clear status filter when changing date
      if (key === "date") params.delete("status")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const currentDate = new Date(selectedDate + "T00:00:00")

  function shiftDate(days: number) {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + days)
    updateParam("date", formatDateParam(d))
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 flex flex-wrap items-center gap-3">
      {/* Reference search — primary action */}
      <div className="flex-1 min-w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B4B4B4]" />
          <input
            key={searchQuery}
            name="q"
            defaultValue={searchQuery}
            placeholder="Search booking #, name, phone or email..."
            onChange={(e) => {
              const val = e.target.value
              const params = new URLSearchParams(searchParams.toString())
              if (val) { params.set("q", val); params.delete("date") } else { params.delete("q") }
              router.replace(`${pathname}?${params.toString()}`)
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C4A04A] focus:ring-1 focus:ring-[#C4A04A] transition-colors"
          />
        </div>
      </div>

      {/* Day navigator */}
      <div className="flex items-center gap-1 bg-[#121212] border border-[#2e2e2e] rounded-lg overflow-hidden">
        <button
          onClick={() => shiftDate(-1)}
          className="p-2.5 hover:bg-white/5 text-[#B4B4B4] hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5 px-2 min-w-[100px] justify-center">
          <CalendarDays className="h-3.5 w-3.5 text-[#C4A04A]" />
          <span className="text-sm font-medium text-white whitespace-nowrap">
            {formatDisplayDate(currentDate)}
          </span>
        </div>
        <button
          onClick={() => shiftDate(1)}
          className="p-2.5 hover:bg-white/5 text-[#B4B4B4] hover:text-white transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Jump to today */}
      {formatDateParam(currentDate) !== formatDateParam(new Date()) && (
        <button
          onClick={() => updateParam("date", formatDateParam(new Date()))}
          className="px-3 py-2 text-xs font-medium text-[#C4A04A] hover:text-white border border-[#C4A04A]/30 hover:border-[#C4A04A] rounded-lg transition-colors"
        >
          Today
        </button>
      )}
    </div>
  )
}
