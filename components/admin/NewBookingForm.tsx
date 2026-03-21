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
    router.push(`/admin/bookings/${booking.id}`)
  }

  const inputCls = "w-full px-3 py-2 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C4A04A] transition-colors"
  const labelCls = "block text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-[0.2em] mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-wide">Customer Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>First Name *</label>
            <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Last Name *</label>
            <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-wide">Rental Period</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Start Date *</label>
            <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>End Date *</label>
            <input required type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
          </div>
        </div>
        {rentalDays > 0 && (
          <p className="text-sm text-[#C4A04A] font-medium">{rentalDays} day{rentalDays !== 1 ? "s" : ""}</p>
        )}
      </div>

      {/* Fitting */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-wide">Fitting Info</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Boot Size (EU)</label>
            <input type="number" step="0.5" value={bootSize} onChange={(e) => setBootSize(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Skill Level</label>
            <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className={inputCls + " bg-[#121212]"}>
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
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white tracking-wide">Equipment</h2>
          <button type="button" onClick={addItem} className="text-sm text-[#C4A04A] hover:text-[#d4b565] font-medium transition-colors">
            + Add Item
          </button>
        </div>

        {selectedItems.length === 0 && (
          <p className="text-sm text-[#B4B4B4]">No items added yet.</p>
        )}

        {selectedItems.map((item, i) => {
          const product = products.find((p) => p.id === item.productId)
          const price = product ? getBestPrice(product.pricingTiers, rentalDays) : 0

          return (
            <div key={i} className="flex gap-3 items-end p-3 bg-[#252525] rounded-lg">
              <div className="flex-1">
                <label className={labelCls}>Product</label>
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(i, "productId", e.target.value)}
                  className={inputCls + " bg-[#121212]"}
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
                <label className={labelCls}>Size</label>
                <input value={item.size} onChange={(e) => updateItem(i, "size", e.target.value)} placeholder="e.g. 27.5" className={inputCls} />
              </div>
              <div className="w-20">
                <label className={labelCls}>Qty</label>
                <input
                  type="number" min={1} value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                  className={inputCls}
                />
              </div>
              {price > 0 && (
                <div className="text-sm font-medium text-[#C4A04A] pb-2 whitespace-nowrap">
                  ${(price * item.quantity).toFixed(2)}
                </div>
              )}
              <button type="button" onClick={() => removeItem(i)} className="pb-2 text-[#B4B4B4] hover:text-red-400 transition-colors">
                ✕
              </button>
            </div>
          )
        })}

        {subtotal > 0 && (
          <div className="flex justify-end border-t border-[#2e2e2e] pt-3">
            <p className="font-semibold text-[#C4A04A]">Total: ${subtotal.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6">
        <label className={labelCls}>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls + " resize-none"} />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#C4A04A] text-[#121212] px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#d4b565] transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Booking"}
        </button>
        <a
          href="/admin/bookings"
          className="border border-[#2e2e2e] text-[#B4B4B4] px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-white/5 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
