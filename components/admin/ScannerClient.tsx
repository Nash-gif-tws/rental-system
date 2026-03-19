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
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  CHECKED_OUT: "bg-purple-100 text-purple-800",
  RETURNED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
            <Scan className="h-5 w-5 text-sky-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Ready to scan</p>
            <p className="text-xs text-gray-400">Scan booking barcode or equipment serial number</p>
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
            className="w-full px-4 py-3 border-2 border-sky-200 rounded-xl text-sm font-mono focus:outline-none focus:border-sky-500 bg-sky-50 placeholder:text-gray-400 transition-colors"
            autoComplete="off"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handleScan(query)}
            disabled={!query.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors"
          >
            <Scan className="h-4 w-4" />
            Look Up
          </button>
          {result && (
            <button
              onClick={() => { setResult(null); setQuery(""); setActionMsg(""); inputRef.current?.focus() }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {actionMsg && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
            <CheckCircle2 className="h-4 w-4" />
            {actionMsg}
          </div>
        )}
      </div>

      {/* Not found */}
      {result?.type === "not_found" && (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Not found</p>
            <p className="text-xs text-gray-500">No booking or equipment matched that code. Check the barcode and try again.</p>
          </div>
        </div>
      )}

      {/* Unit found (no active booking) */}
      {unit && !booking && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{unit.product.name}</p>
              <p className="text-sm text-gray-500">{unit.size ? `Size ${unit.size}` : "No size"} · {unit.condition.replace("_", " ")}</p>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
            This unit has no active booking. It's currently available.
          </div>
        </div>
      )}

      {/* Booking result */}
      {booking && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Booking header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-sky-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{booking.bookingNumber}</p>
                <p className="text-xs text-gray-400">{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status]}`}>
              {booking.status.replace("_", " ")}
            </span>
          </div>

          {/* Customer */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{booking.customer.firstName} {booking.customer.lastName}</p>
              <p className="text-xs text-gray-500">{booking.customer.email}{booking.customer.phone ? ` · ${booking.customer.phone}` : ""}</p>
            </div>
          </div>

          {/* Equipment */}
          {booking.items && booking.items.length > 0 && (
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Equipment</p>
              <div className="space-y-1.5">
                {booking.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <Package className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                    <span className="text-gray-700">{item.product?.name ?? "Item"}</span>
                    {item.size && <span className="text-gray-400 text-xs">· {item.size}</span>}
                    {item.unit && <span className="text-gray-400 text-xs font-mono">· {item.unit.serialNumber ?? item.unit.id.slice(-8).toUpperCase()}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-5 py-4 bg-gray-50 flex gap-3">
            {booking.status === "CONFIRMED" && (
              <button
                onClick={() => updateStatus(booking.id, "CHECKED_OUT")}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                Check Out
              </button>
            )}
            {booking.status === "CHECKED_OUT" && (
              <button
                onClick={() => updateStatus(booking.id, "RETURNED")}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Mark Returned
              </button>
            )}
            {booking.status === "PENDING" && (
              <button
                onClick={() => updateStatus(booking.id, "CONFIRMED")}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Booking
              </button>
            )}
            {(booking.status === "RETURNED" || booking.status === "CANCELLED") && (
              <div className="flex-1 text-center text-sm text-gray-400 py-3">
                No actions available — booking is {booking.status.toLowerCase()}.
              </div>
            )}
            <Link
              href={`/admin/bookings/${booking.id}`}
              className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-white transition-colors"
            >
              View Full Booking
            </Link>
          </div>
        </div>
      )}

      {/* Tips */}
      {!result && !loading && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">How to use</p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-sky-500 font-bold mt-0.5">1</span>
              <p>For USB barcode scanners — just scan. The scanner types the code and presses Enter automatically.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sky-500 font-bold mt-0.5">2</span>
              <p>Scan a <strong>booking confirmation barcode</strong> (SSW-XXXXX) to pull up a customer's booking.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sky-500 font-bold mt-0.5">3</span>
              <p>Scan an <strong>equipment serial number</strong> to find which booking that piece is assigned to.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sky-500 font-bold mt-0.5">4</span>
              <p>Use <strong>Check Out</strong> when gear leaves the store, <strong>Mark Returned</strong> when it comes back.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
