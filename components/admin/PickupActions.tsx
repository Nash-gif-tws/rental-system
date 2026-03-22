"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, PackageCheck } from "lucide-react"

type Props = {
  bookingId: string
  prepStatus: string
  bookingStatus: string
}

export default function PickupActions({ bookingId, prepStatus, bookingStatus }: Props) {
  const router = useRouter()
  const [loadingReady, setLoadingReady] = useState(false)
  const [loadingPickup, setLoadingPickup] = useState(false)

  const isCheckedOut = bookingStatus === "CHECKED_OUT"
  const isReady = prepStatus === "READY_FOR_COLLECTION"

  async function markReady() {
    setLoadingReady(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/ready`, { method: "PATCH" })
      if (!res.ok) throw new Error("Failed")
      router.refresh()
    } catch {
      alert("Failed to mark as ready. Please try again.")
    } finally {
      setLoadingReady(false)
    }
  }

  async function markPickedUp() {
    setLoadingPickup(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/pickup`, { method: "PATCH" })
      if (!res.ok) throw new Error("Failed")
      router.refresh()
    } catch {
      alert("Failed to mark as picked up. Please try again.")
    } finally {
      setLoadingPickup(false)
    }
  }

  if (isCheckedOut) return null

  return (
    <div className="flex items-center gap-2">
      {!isReady && (
        <button
          onClick={markReady}
          disabled={loadingReady}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 rounded-lg transition-colors disabled:opacity-50"
        >
          <PackageCheck className="h-4 w-4" />
          {loadingReady ? "Saving..." : "Mark Ready"}
        </button>
      )}
      {isReady && (
        <button
          onClick={markPickedUp}
          disabled={loadingPickup}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 rounded-lg transition-colors disabled:opacity-50"
        >
          <CheckCircle className="h-4 w-4" />
          {loadingPickup ? "Saving..." : "Picked Up"}
        </button>
      )}
    </div>
  )
}
