"use client"

import { useState } from "react"
import { ArrowLeft, Calendar, Package, User, Tag } from "lucide-react"
import { format } from "date-fns"
import type { BookingState } from "./BookingWizard"

export default function StepConfirm({ state, onBack, onConfirmed }: {
  state: BookingState; onBack: () => void; onConfirmed: (booking: any) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [discountCode, setDiscountCode] = useState("ONLINE15")

  const subtotal = state.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const discount = discountCode.toUpperCase() === "ONLINE15" ? subtotal * 0.15 : 0
  const total = subtotal - discount

  async function handleConfirm() {
    setLoading(true)
    setError("")
    const res = await fetch("/api/bookings/public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { firstName: state.firstName, lastName: state.lastName, email: state.email, phone: state.phone || undefined },
        startDate: state.startDate, endDate: state.endDate,
        items: state.items.map((i) => ({ productId: i.productId, size: i.size || undefined, quantity: i.quantity, unitPrice: i.unitPrice })),
        height: state.height ? parseFloat(state.height) : undefined,
        weight: state.weight ? parseFloat(state.weight) : undefined,
        bootSize: state.bootSize ? parseFloat(state.bootSize) : undefined,
        skillLevel: state.skillLevel || undefined,
        notes: state.notes || undefined,
      }),
    })
    if (!res.ok) {
      setError("Something went wrong. Please try again or call us on (02) 9597 3422.")
      setLoading(false)
      return
    }
    onConfirmed(await res.json())
  }

  const SectionHeader = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 bg-sky-50 rounded-lg flex items-center justify-center">
        <Icon className="h-4 w-4 text-sky-500" />
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review your booking</h1>
        <p className="text-gray-500 text-sm mt-1">Looks good? Confirm and we'll prepare your gear.</p>
      </div>

      {/* Dates */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <SectionHeader icon={Calendar} label="Rental Period" />
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pickup</p>
            <p className="font-bold text-gray-900 text-sm mt-0.5">{format(new Date(state.startDate), "EEE d MMM")}</p>
          </div>
          <div className="text-gray-300 text-xl">→</div>
          <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Return</p>
            <p className="font-bold text-gray-900 text-sm mt-0.5">{format(new Date(state.endDate), "EEE d MMM")}</p>
          </div>
          <div className="bg-sky-50 rounded-xl px-3 py-3 text-center">
            <p className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">Days</p>
            <p className="font-bold text-sky-600 text-sm mt-0.5">{state.rentalDays}</p>
          </div>
        </div>
      </div>

      {/* Equipment */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <SectionHeader icon={Package} label="Equipment" />
        <div className="space-y-2.5">
          {state.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.productName}</p>
                {item.size && <p className="text-xs text-gray-400 mt-0.5">Size: {item.size}</p>}
              </div>
              <p className="text-sm font-bold text-gray-900">${(item.unitPrice * item.quantity).toFixed(2)}</p>
            </div>
          ))}

          {/* Discount code */}
          <div className="border-t border-gray-50 pt-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-xs font-semibold text-gray-500">Discount code</p>
            </div>
            <input
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
            />
            {discount > 0 && (
              <p className="text-xs text-emerald-600 font-semibold mt-1.5">✓ 15% discount applied</p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                <span>Discount (ONLINE15)</span>
                <span>−${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total</span>
              <span className="text-sky-500">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <SectionHeader icon={User} label="Your Details" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-gray-900">{state.firstName} {state.lastName}</p>
          <p className="text-gray-500">{state.email}</p>
          {state.phone && <p className="text-gray-500">{state.phone}</p>}
          {state.skillLevel && <p className="text-gray-400 text-xs mt-1 capitalize">Skill level: {state.skillLevel.toLowerCase()}</p>}
        </div>
      </div>

      {/* Notes */}
      <div className="flex gap-3 text-sm">
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4">
          <p className="font-semibold text-gray-700 mb-0.5">💳 Pay in store</p>
          <p className="text-gray-500 text-xs">Cash, card or EFTPOS at pickup. No payment needed to book.</p>
        </div>
        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="font-semibold text-amber-800 mb-0.5">👨‍👩‍👧 Under 18?</p>
          <p className="text-amber-700 text-xs">Parent or guardian must be present at pickup to sign.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="px-5 py-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all text-sm shadow-lg shadow-sky-100"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirming...</>
          ) : (
            <>Confirm Booking — ${total.toFixed(2)}</>
          )}
        </button>
      </div>
    </div>
  )
}
