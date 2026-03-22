"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookingStatus } from "@prisma/client"

const TRANSITIONS: Record<BookingStatus, { label: string; next: BookingStatus }[]> = {
  PENDING: [{ label: "Confirm Booking", next: "CONFIRMED" }, { label: "Cancel", next: "CANCELLED" }],
  CONFIRMED: [{ label: "Check Out Gear", next: "CHECKED_OUT" }, { label: "Cancel", next: "CANCELLED" }, { label: "No Show", next: "NO_SHOW" }],
  CHECKED_OUT: [{ label: "Mark Returned", next: "RETURNED" }],
  RETURNED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

export default function BookingActions({ booking }: { booking: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const actions = TRANSITIONS[booking.status as BookingStatus] ?? []

  async function updateStatus(next: BookingStatus) {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? "Failed to update status")
        return
      }
      router.refresh()
    } catch {
      setError("Network error — please try again")
    } finally {
      setLoading(false)
    }
  }

  if (actions.length === 0) return null

  return (
    <div className="flex flex-col items-end gap-1.5">
      {error && <p className="text-xs text-red-400 text-right">{error}</p>}
      <div className="flex gap-2">
      {actions.map(({ label, next }) => (
        <button
          key={next}
          onClick={() => updateStatus(next)}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-colors disabled:opacity-50 ${
            next === "CANCELLED" || next === "NO_SHOW"
              ? "border border-[#2e2e2e] text-[#B4B4B4] hover:bg-white/5"
              : "bg-[#C4A04A] text-[#121212] hover:bg-[#d4b565]"
          }`}
        >
          {loading ? "..." : label}
        </button>
      ))}
      </div>
    </div>
  )
}
