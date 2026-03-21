"use client"

import { useEffect, useRef, useState } from "react"
import { Scan, Package, User, Calendar, ArrowRight, CheckCircle2, RotateCcw, AlertCircle, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

type ScanResult =
  | { type: "booking"; booking: any }
  | { type: "unit"; unit: any }
  | { type: "not_found" }
  | null

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-300",
  CONFIRMED: "bg-[#C4A04A]/20 text-[#C4A04A]",
  CHECKED_OUT: "bg-purple-500/20 text-purple-300",
  RETURNED: "bg-emerald-500/20 text-emerald-300",
  CANCELLED: "bg-red-500/20 text-red-300",
  NO_SHOW: "bg-zinc-500/20 text-zinc-400",
}

export default function ScannerClient() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState("")

  // Auto-focus on mount and after each scan
  useEffect(() => {
    inputRef.current?.focus()
  }, [result])

  async function handleScan(value: string) {
    const q = value.trim()
    if (!q) return
    setLoading(true)
    setResult(null)
    setActionMsg("")
    const res = await fetch(`/api/scan?q=${encodeURIComponent(q)}`)
    if (res.status === 404) {
      setResult({ type: "not_found" })
    } else {
      setResult(await res.json())
    }
    setLoading(false)
    setQuery("")
  }

  async function updateStatus(bookingId: string, status: string) {
    setActionLoading(true)
    const res = await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const label = status === "CHECKED_OUT" ? "Checked out" : "Returned"
      setActionMsg(`✓ ${label} successfully`)
      setResult(null)
    }
    setActionLoading(false)
  }

  const booking = result?.type === "booking" ? result.booking : result?.type === "unit" ? result.unit?.bookingItems?.[0]?.booking : null
  const unit = result?.type === "unit" ? result.unit : null

  return (
    <div className="space-y-5">
      {/* Scanner input */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#C4A04A]/10 rounded-xl flex items-center justify-center">
            <Scan className="h-5 w-5 text-[#C4A04A]" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Ready to scan</p>
            <p className="text-xs text-[#B4B4B4]">Scan booking barcode or equipment serial number</p>
          </div>
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleScan(query)
            }}
            placeholder="Scan or type booking number / serial..."
            className="w-full px-4 py-3 bg-[#121212] border-2 border-[#333] rounded-xl text-sm font-mono text-white placeholder-[#555] focus:outline-none focus:border-[#C4A04A] transition-colors"
            autoComplete="off"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-[#C4A04A]" />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handleScan(query)}
            disabled={!query.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#C4A04A] text-[#121212] rounded-lg text-sm font-semibold hover:bg-[#d4b565] disabled:opacity-50 transition-colors"
          >
            <Scan className="h-4 w-4" />
            Look Up
          </button>
          {result && (
            <button
              onClick={() => { setResult(null); setQuery(""); setActionMsg(""); inputRef.current?.focus() }}
              className="px-4 py-2 border border-[#333] rounded-lg text-sm font-medium text-[#B4B4B4] hover:bg-white/5 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {actionMsg && (
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
            <CheckCircle2 className="h-4 w-4" />
            {actionMsg}
          </div>
        )}
      </div>

      {/* Not found */}
      {result?.type === "not_found" && (
        <div className="bg-[#1e1e1e] border border-red-500/30 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-white text-sm">Not found</p>
            <p className="text-xs text-[#B4B4B4]">No booking or equipment matched that code. Check the barcode and try again.</p>
          </div>
        </div>
      )}

      {/* Unit found (no active booking) */}
      {unit && !booking && (
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-[#B4B4B4]" />
            </div>
            <div>
              <p className="font-semibold text-white">{unit.product.name}</p>
              <p className="text-sm text-[#B4B4B4]">{unit.size ? `Size ${unit.size}` : "No size"} · {unit.condition.replace("_", " ")}</p>
            </div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-300">
            This unit has no active booking. It's currently available.
          </div>
        </div>
      )}

      {/* Booking result */}
      {booking && (
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
          {/* Booking header */}
          <div className="px-5 py-4 border-b border-[#2e2e2e] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C4A04A]/10 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#C4A04A]" />
              </div>
              <div>
                <p className="font-bold text-white">{booking.bookingNumber}</p>
                <p className="text-xs text-[#B4B4B4]">{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status]}`}>
              {booking.status.replace("_", " ")}
            </span>
          </div>

          {/* Customer */}
          <div className="px-5 py-4 border-b border-[#2e2e2e] flex items-center gap-3">
            <User className="h-4 w-4 text-[#B4B4B4] flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">{booking.customer.firstName} {booking.customer.lastName}</p>
              <p className="text-xs text-[#B4B4B4]">{booking.customer.email}{booking.customer.phone ? ` · ${booking.customer.phone}` : ""}</p>
            </div>
          </div>

          {/* Equipment */}
          {booking.items && booking.items.length > 0 && (
            <div className="px-5 py-4 border-b border-[#2e2e2e]">
              <p className="text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest mb-2">Equipment</p>
              <div className="space-y-1.5">
                {booking.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <Package className="h-3.5 w-3.5 text-[#B4B4B4] flex-shrink-0" />
                    <span className="text-[#E6E6E6]">{item.product?.name ?? "Item"}</span>
                    {item.size && <span className="text-[#B4B4B4] text-xs">· {item.size}</span>}
                    {item.unit && <span className="text-[#B4B4B4] text-xs font-mono">· {item.unit.serialNumber ?? item.unit.id.slice(-8).toUpperCase()}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-5 py-4 bg-[#252525] flex gap-3">
            {booking.status === "CONFIRMED" && (
              <button
                onClick={() => updateStatus(booking.id, "CHECKED_OUT")}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-4 py-3 rounded-xl text-sm font-bold hover:bg-purple-500/30 disabled:opacity-50 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                Check Out
              </button>
            )}
            {booking.status === "CHECKED_OUT" && (
              <button
                onClick={() => updateStatus(booking.id, "RETURNED")}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#C4A04A] text-[#121212] px-4 py-3 rounded-xl text-sm font-bold hover:bg-[#d4b565] disabled:opacity-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Mark Returned
              </button>
            )}
            {booking.status === "PENDING" && (
              <button
                onClick={() => updateStatus(booking.id, "CONFIRMED")}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#C4A04A] text-[#121212] px-4 py-3 rounded-xl text-sm font-bold hover:bg-[#d4b565] disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Booking
              </button>
            )}
            {(booking.status === "RETURNED" || booking.status === "CANCELLED") && (
              <div className="flex-1 text-center text-sm text-[#B4B4B4] py-3">
                No actions available — booking is {booking.status.toLowerCase()}.
              </div>
            )}
            <Link
              href={`/admin/bookings/${booking.id}`}
              className="px-4 py-3 border border-[#333] rounded-xl text-sm font-medium text-[#B4B4B4] hover:bg-white/5 transition-colors"
            >
              View Full Booking
            </Link>
          </div>
        </div>
      )}

      {/* Tips */}
      {!result && !loading && (
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5 space-y-3">
          <p className="text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest">How to use</p>
          <div className="space-y-2 text-sm text-[#E6E6E6]">
            <div className="flex items-start gap-2">
              <span className="text-[#C4A04A] font-bold mt-0.5">1</span>
              <p>For USB barcode scanners — just scan. The scanner types the code and presses Enter automatically.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#C4A04A] font-bold mt-0.5">2</span>
              <p>Scan a <strong className="text-white">booking confirmation barcode</strong> (SSW-XXXXX) to pull up a customer's booking.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#C4A04A] font-bold mt-0.5">3</span>
              <p>Scan an <strong className="text-white">equipment serial number</strong> to find which booking that piece is assigned to.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#C4A04A] font-bold mt-0.5">4</span>
              <p>Use <strong className="text-white">Check Out</strong> when gear leaves the store, <strong className="text-white">Mark Returned</strong> when it comes back.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
