"use client"

import { useState } from "react"
import { ChevronLeft, Calendar, Package, User } from "lucide-react"
import { format } from "date-fns"
import type { BookingState } from "./BookingWizard"

export default function StepConfirm({
  state,
  onBack,
  onConfirmed,
}: {
  state: BookingState
  onBack: () => void
  onConfirmed: (booking: any) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [discountCode, setDiscountCode] = useState("ONLINE15")

  const subtotal = state.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const discount = discountCode.toUpperCase() === "ONLINE15" ? subtotal * 0.15 : 0
  const total = subtotal - discount

  async function handleConfirm() {
    setLoading(true)
    setError("")

    const res = await fetch("/api/bookings/public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          firstName: state.firstName,
          lastName: state.lastName,
          email: state.email,
          phone: state.phone || undefined,
        },
        startDate: state.startDate,
        endDate: state.endDate,
        items: state.items.map((i) => ({
          productId: i.productId,
          size: i.size || undefined,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
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

    const booking = await res.json()
    onConfirmed(booking)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review your booking</h1>
        <p className="text-gray-500 mt-1">Check everything looks right before confirming.</p>
      </div>

      {/* Dates */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-sky-600" />
          <h2 className="font-semibold text-gray-900">Rental Period</h2>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="bg-sky-50 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-gray-500">Pickup</p>
            <p className="font-semibold text-gray-900">{format(new Date(state.startDate), "EEE d MMM")}</p>
          </div>
          <div className="text-gray-400">→</div>
          <div className="bg-sky-50 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-gray-500">Return</p>
            <p className="font-semibold text-gray-900">{format(new Date(state.endDate), "EEE d MMM")}</p>
          </div>
          <div className="ml-auto text-sky-600 font-medium text-sm">{state.rentalDays} days</div>
        </div>
      </div>

      {/* Equipment */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-sky-600" />
          <h2 className="font-semibold text-gray-900">Equipment</h2>
        </div>
        <div className="space-y-2">
          {state.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                {item.size && <p className="text-gray-500 text-xs">Size: {item.size}</p>}
              </div>
              <p className="font-medium text-gray-900">${(item.unitPrice * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2 space-y-1.5">
            {discount > 0 && (
              <>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount (ONLINE15 · 15% off)</span>
                  <span>−${discount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-sky-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-sky-600" />
          <h2 className="font-semibold text-gray-900">Your Details</h2>
        </div>
        <div className="text-sm space-y-1 text-gray-700">
          <p className="font-medium">{state.firstName} {state.lastName}</p>
          <p>{state.email}</p>
          {state.phone && <p>{state.phone}</p>}
          {state.skillLevel && (
            <p className="text-gray-500 capitalize">Skill: {state.skillLevel.toLowerCase()}</p>
          )}
        </div>
      </div>

      {/* Discount code */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Discount code</label>
        <div className="flex gap-2">
          <input
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
          />
        </div>
        {discount > 0 && (
          <p className="text-green-600 text-xs font-medium mt-2">✓ 15% discount applied — you save ${discount.toFixed(2)}</p>
        )}
      </div>

      {/* Payment note */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-800 mb-1">💳 Payment in store</p>
        <p>Payment is collected when you pick up your gear. We accept cash, card, and EFTPOS.</p>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-medium mb-0.5">👨‍👩‍👧 Booking for someone under 18?</p>
        <p className="text-amber-700">A parent or guardian must be present in store to sign the rental agreement for minors.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-5 py-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 bg-sky-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Confirming...
            </>
          ) : (
            "Confirm Booking"
          )}
        </button>
      </div>
    </div>
  )
}
