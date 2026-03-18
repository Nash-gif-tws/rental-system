"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { differenceInDays } from "date-fns"

type PricingTier = { id: string; label: string; days: number; price: number }
type Product = {
  id: string
  name: string
  category: { name: string }
  pricingTiers: PricingTier[]
}

function getBestPrice(tiers: PricingTier[], days: number): number {
  if (!tiers.length || days === 0) return 0
  const sorted = [...tiers].sort((a, b) => b.days - a.days)
  const match = sorted.find((t) => t.days <= days)
  return match ? match.price : tiers[0].price
}

export default function NewBookingForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [bootSize, setBootSize] = useState("")
  const [skillLevel, setSkillLevel] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedItems, setSelectedItems] = useState<
    { productId: string; size: string; quantity: number }[]
  >([])

  const rentalDays =
    startDate && endDate
      ? Math.max(1, differenceInDays(new Date(endDate), new Date(startDate)))
      : 0

  function addItem() {
    setSelectedItems([...selectedItems, { productId: "", size: "", quantity: 1 }])
  }

  function updateItem(index: number, field: string, value: any) {
    const updated = [...selectedItems]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedItems(updated)
  }

  function removeItem(index: number) {
    setSelectedItems(selectedItems.filter((_, i) => i !== index))
  }

  const subtotal = selectedItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) return sum
    return sum + getBestPrice(product.pricingTiers, rentalDays) * item.quantity
  }, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedItems.length === 0) return setError("Add at least one item")
    if (!startDate || !endDate) return setError("Select rental dates")

    setLoading(true)
    setError("")

    const items = selectedItems
      .filter((i) => i.productId)
      .map((item) => {
        const product = products.find((p) => p.id === item.productId)!
        return {
          productId: item.productId,
          size: item.size || undefined,
          quantity: item.quantity,
          unitPrice: getBestPrice(product.pricingTiers, rentalDays),
        }
      })

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { firstName, lastName, email, phone: phone || undefined },
        startDate,
        endDate,
        items,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        bootSize: bootSize ? parseFloat(bootSize) : undefined,
        skillLevel: skillLevel || undefined,
        notes: notes || undefined,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Failed to create booking")
      setLoading(false)
      return
    }

    const booking = await res.json()
    router.push(`/bookings/${booking.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Customer Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Rental Period</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              required
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
            <input
              required
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        {rentalDays > 0 && (
          <p className="text-sm text-sky-600 font-medium">{rentalDays} day{rentalDays !== 1 ? "s" : ""}</p>
        )}
      </div>

      {/* Fitting */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Fitting Info</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Boot Size (EU)</label>
            <input
              type="number"
              step="0.5"
              value={bootSize}
              onChange={(e) => setBootSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Select...</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Equipment</h2>
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            + Add Item
          </button>
        </div>

        {selectedItems.length === 0 && (
          <p className="text-sm text-gray-400">No items added yet.</p>
        )}

        {selectedItems.map((item, i) => {
          const product = products.find((p) => p.id === item.productId)
          const price = product ? getBestPrice(product.pricingTiers, rentalDays) : 0

          return (
            <div key={i} className="flex gap-3 items-end p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(i, "productId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.category.name} — {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
                <input
                  value={item.size}
                  onChange={(e) => updateItem(i, "size", e.target.value)}
                  placeholder="e.g. 27.5"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="w-20">
                <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              {price > 0 && (
                <div className="text-sm font-medium text-gray-700 pb-2 whitespace-nowrap">
                  ${(price * item.quantity).toFixed(2)}
                </div>
              )}
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="pb-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
          )
        })}

        {subtotal > 0 && (
          <div className="flex justify-end border-t border-gray-100 pt-3">
            <p className="font-semibold text-gray-900">Total: ${subtotal.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-sky-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-sky-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Booking"}
        </button>
        <a
          href="/bookings"
          className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
