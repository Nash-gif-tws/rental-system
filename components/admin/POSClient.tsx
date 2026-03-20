"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Plus, Minus, X, User, Search, ChevronDown, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"
import { format, addDays } from "date-fns"
import { formatCurrency } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────

type PricingTier = { id: string; label: string; days: number; price: number }
type SizeOption = { size: string; total: number; available: number }
type Product = {
  id: string
  name: string
  slug: string
  isPackage: boolean
  isActive: boolean
  category: { id: string; name: string }
  pricingTiers: PricingTier[]
  _count: { units: number }
}

// ── Package component definitions ──────────────────────────────────────────

type PackageComponent = { label: string; productSlugs: string[]; optional?: boolean }

const PACKAGE_COMPONENTS: Record<string, PackageComponent[]> = {
  "adult-ski-package": [
    { label: "Ski Length", productSlugs: ["adult-skis"] },
    { label: "Boot Size", productSlugs: ["mens-ski-boots", "womens-ski-boots"] },
    { label: "Pole Length", productSlugs: ["ski-poles"] },
    { label: "Helmet Size", productSlugs: ["helmets"], optional: true },
    { label: "Jacket Size", productSlugs: ["mens-jackets", "womens-jackets"], optional: true },
    { label: "Pants Size", productSlugs: ["mens-pants", "womens-pants"], optional: true },
  ],
  "junior-ski-package": [
    { label: "Ski Length", productSlugs: ["kids-skis"] },
    { label: "Boot Size", productSlugs: ["kids-ski-boots"] },
    { label: "Pole Length", productSlugs: ["ski-poles"] },
    { label: "Helmet Size", productSlugs: ["helmets"], optional: true },
    { label: "Jacket Size", productSlugs: ["kids-boys-jackets", "kids-girls-jackets"], optional: true },
    { label: "Pants Size", productSlugs: ["kids-pants", "kids-snowsuits"], optional: true },
  ],
  "adult-snowboard-package": [
    { label: "Board Length", productSlugs: ["mens-snowboards", "womens-snowboards"] },
    { label: "Boot Size", productSlugs: ["mens-snowboard-boots", "womens-snowboard-boots", "mens-stepon-boots", "womens-stepon-boots"] },
    { label: "Helmet Size", productSlugs: ["helmets"], optional: true },
    { label: "Jacket Size", productSlugs: ["mens-jackets", "womens-jackets"], optional: true },
    { label: "Pants Size", productSlugs: ["mens-pants", "womens-pants"], optional: true },
  ],
  "junior-snowboard-package": [
    { label: "Board Length", productSlugs: ["kids-snowboards"] },
    { label: "Boot Size", productSlugs: ["kids-snowboard-boots"] },
    { label: "Helmet Size", productSlugs: ["helmets"], optional: true },
    { label: "Jacket Size", productSlugs: ["kids-boys-jackets", "kids-girls-jackets"], optional: true },
    { label: "Pants Size", productSlugs: ["kids-pants", "kids-snowsuits"], optional: true },
  ],
}
type CartItem = {
  productId: string
  name: string
  categoryName: string
  qty: number
  size: string
  unitPrice: number
}
type Customer = {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getBestPrice(tiers: PricingTier[], days: number): number {
  if (!tiers.length || days === 0) return 0
  const sorted = [...tiers].sort((a, b) => a.days - b.days)
  return sorted.find((t) => t.days >= days)?.price ?? sorted[sorted.length - 1].price
}

const CATEGORY_EMOJI: Record<string, string> = {
  Skis: "🎿", Snowboards: "🏂", Boots: "🥾", Clothing: "🧥", Accessories: "⛑️", Packages: "📦",
}

const DURATIONS = [
  { label: "1 day", days: 1 },
  { label: "2 days", days: 2 },
  { label: "3 days", days: 3 },
  { label: "4 days", days: 4 },
  { label: "5 days", days: 5 },
  { label: "7 days", days: 7 },
  { label: "14 days", days: 14 },
  { label: "21 days", days: 21 },
  { label: "28 days", days: 28 },
]

// ── Size tile grid ─────────────────────────────────────────────────────────

function SizeTiles({
  sizes,
  selected,
  onSelect,
}: {
  sizes: SizeOption[]
  selected?: string
  onSelect: (size: string) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {sizes.map((sz) => {
        const isSelected = selected === sz.size
        const unavailable = sz.available === 0
        return (
          <button
            key={sz.size}
            onClick={() => !unavailable && onSelect(sz.size)}
            disabled={unavailable}
            className={`flex flex-col items-center justify-center px-2 py-2.5 rounded-xl border transition-all ${
              isSelected
                ? "bg-[#C8FF00] text-[#121212] border-[#C8FF00]"
                : unavailable
                  ? "bg-white/[0.02] text-[#3a3a3a] border-[#222] cursor-not-allowed"
                  : "bg-[#252525] text-white border-[#2e2e2e] hover:border-[#C8FF00]/50 hover:text-[#C8FF00]"
            }`}
          >
            <span className="text-sm font-bold leading-tight">{sz.size}</span>
            <span className={`text-[10px] mt-0.5 font-medium ${
              isSelected ? "text-[#121212]/60" : unavailable ? "text-[#3a3a3a]" : "text-[#555]"
            }`}>
              {sz.available}/{sz.total}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function POSClient({ products }: { products: Product[] }) {
  const router = useRouter()
  const [mode, setMode] = useState<"book" | "reserve">("book")
  const [durationDays, setDurationDays] = useState(1)
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [showDurationPicker, setShowDurationPicker] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState("")
  const [rightPanel, setRightPanel] = useState<"order" | "customer">("order")
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState("")
  const [customerResults, setCustomerResults] = useState<any[]>([])
  const [customerForm, setCustomerForm] = useState({ firstName: "", lastName: "", email: "", phone: "" })
  const [customerMode, setCustomerMode] = useState<"search" | "new">("search")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState<string | null>(null)

  // Availability / size picker
  const [availMap, setAvailMap] = useState<Record<string, SizeOption[]>>({})
  const [availBySlug, setAvailBySlug] = useState<Record<string, SizeOption[]>>({})
  const [sizePicker, setSizePicker] = useState<{ product: Product; sizes: SizeOption[] } | null>(null)
  const [packagePicker, setPackagePicker] = useState<{ product: Product; selected: Record<string, string> } | null>(null)

  const searchTimeout = useRef<any>(null)
  const endDate = format(addDays(new Date(startDate), durationDays), "yyyy-MM-dd")

  // Fetch availability when dates change
  useEffect(() => {
    fetch(`/api/availability?start=${startDate}&end=${endDate}`)
      .then((r) => r.json())
      .then((data: any[]) => {
        const byId: Record<string, SizeOption[]> = {}
        const bySlug: Record<string, SizeOption[]> = {}
        for (const p of data) {
          byId[p.id] = p.sizes ?? []
          bySlug[p.slug] = p.sizes ?? []
        }
        setAvailMap(byId)
        setAvailBySlug(bySlug)
      })
      .catch(() => {})
  }, [startDate, endDate])

  // Category tabs
  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category.name)))]
  const filtered = products.filter(
    (p) => p.isActive && (categoryFilter === "all" || p.category.name === categoryFilter)
  )

  // Cart helpers
  function getCartItem(productId: string) {
    return cart.find((c) => c.productId === productId)
  }

  function mergeComponentSizes(productSlugs: string[]): SizeOption[] {
    const merged: Record<string, SizeOption> = {}
    for (const slug of productSlugs) {
      for (const sz of availBySlug[slug] ?? []) {
        if (!merged[sz.size]) merged[sz.size] = { size: sz.size, total: 0, available: 0 }
        merged[sz.size].total += sz.total
        merged[sz.size].available += sz.available
      }
    }
    return Object.values(merged).sort((a, b) => {
      const na = parseFloat(a.size), nb = parseFloat(b.size)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      const order = ["XS","S","M","L","XL","2XL","3XL"]
      const ia = order.indexOf(a.size.toUpperCase()), ib = order.indexOf(b.size.toUpperCase())
      if (ia !== -1 && ib !== -1) return ia - ib
      return a.size.localeCompare(b.size)
    })
  }

  function handleProductClick(product: Product) {
    const pkgComponents = PACKAGE_COMPONENTS[product.slug]
    if (pkgComponents) {
      const existing = cart.find((c) => c.productId === product.id)
      const currentSizes: Record<string, string> = {}
      if (existing?.size) {
        existing.size.split(" · ").forEach((part) => {
          const [label, val] = part.split(": ")
          if (label && val) currentSizes[label] = val
        })
      }
      setPackagePicker({ product, selected: currentSizes })
      return
    }
    const sizes = availMap[product.id] ?? []
    if (sizes.length > 0) {
      setSizePicker({ product, sizes })
    } else {
      addToCartWithSize(product, "")
    }
  }

  function selectPackageComponentSize(product: Product, label: string, size: string) {
    setPackagePicker((prev) => {
      if (!prev) return prev
      const isDeselect = prev.selected[label] === size
      const updated = isDeselect
        ? Object.fromEntries(Object.entries(prev.selected).filter(([k]) => k !== label))
        : { ...prev.selected, [label]: size }
      // Add to cart if all required filled
      const components = PACKAGE_COMPONENTS[product.slug] ?? []
      const required = components.filter((c) => !c.optional)
      if (required.every((c) => updated[c.label])) {
        const sizeStr = Object.entries(updated).map(([l, v]) => `${l}: ${v}`).join(" · ")
        const unitPrice = getBestPrice(product.pricingTiers, durationDays)
        setCart((prev) => {
          const existing = prev.find((c) => c.productId === product.id)
          if (existing) return prev.map((c) => c.productId === product.id ? { ...c, size: sizeStr, unitPrice } : c)
          return [...prev, { productId: product.id, name: product.name, categoryName: product.category.name, qty: 1, size: sizeStr, unitPrice }]
        })
      } else {
        setCart((prev) => prev.filter((c) => c.productId !== product.id))
      }
      return { ...prev, selected: updated }
    })
  }

  function addToCartWithSize(product: Product, size: string) {
    const unitPrice = getBestPrice(product.pricingTiers, durationDays)
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id)
      if (existing) {
        return prev.map((c) => c.productId === product.id ? { ...c, size, unitPrice } : c)
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        categoryName: product.category.name,
        qty: 1,
        size,
        unitPrice,
      }]
    })
    setSizePicker(null)
  }

  function incrementCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id)
      if (existing) {
        return prev.map((c) => c.productId === product.id ? { ...c, qty: c.qty + 1 } : c)
      }
      return prev
    })
  }

  function decrementCart(productId: string) {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId)
      if (existing && existing.qty > 1) {
        return prev.map((c) => c.productId === productId ? { ...c, qty: c.qty - 1 } : c)
      }
      return prev.filter((c) => c.productId !== productId)
    })
  }

  function removeItemFully(productId: string) {
    setCart((prev) => prev.filter((c) => c.productId !== productId))
  }

  // Recalculate prices when duration changes
  useEffect(() => {
    setCart((prev) =>
      prev.map((item) => {
        const product = products.find((p) => p.id === item.productId)
        return product ? { ...item, unitPrice: getBestPrice(product.pricingTiers, durationDays) } : item
      })
    )
  }, [durationDays, products])

  // Customer search
  useEffect(() => {
    clearTimeout(searchTimeout.current)
    if (customerSearch.length < 2) { setCustomerResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(customerSearch)}`)
      if (res.ok) setCustomerResults(await res.json())
    }, 300)
  }, [customerSearch])

  // Totals
  const subtotal = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0)
  const discountAmt = discount ? subtotal * (parseFloat(discount) / 100) : 0
  const total = subtotal - discountAmt

  async function handleSubmit() {
    if (!cart.length) return setError("Add at least one product")
    const cust = customer ?? (customerMode === "new" ? customerForm : null)
    if (!cust?.firstName || !cust?.email) return setError("Add customer details")

    setSubmitting(true)
    setError("")

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { firstName: cust.firstName, lastName: cust.lastName, email: cust.email, phone: cust.phone || undefined },
        startDate,
        endDate,
        items: cart.map((c) => ({ productId: c.productId, size: c.size || undefined, quantity: c.qty, unitPrice: c.unitPrice })),
      }),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Failed to create booking")
      setSubmitting(false)
      return
    }

    const booking = await res.json()
    if (mode === "book") {
      await fetch(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      })
    }
    setDone(booking.bookingNumber)
  }

  // ── Done state ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-[#C8FF00] mx-auto" />
          <h2 className="font-display text-3xl font-bold text-white tracking-wide">BOOKING CREATED</h2>
          <p className="text-[#B4B4B4]">Booking number: <span className="text-white font-semibold">{done}</span></p>
          <p className="text-sm text-[#B4B4B4]">Status: {mode === "book" ? "Confirmed" : "Pending (reserved)"}</p>
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={() => { setCart([]); setCustomer(null); setCustomerForm({ firstName: "", lastName: "", email: "", phone: "" }); setDiscount(""); setDone(null); setRightPanel("order") }}
              className="bg-[#C8FF00] text-[#121212] font-semibold px-6 py-3 rounded-lg text-sm hover:bg-[#b3e600] transition-colors"
            >
              New Order
            </button>
            <button
              onClick={() => router.push("/admin/bookings")}
              className="border border-[#333] text-[#B4B4B4] px-6 py-3 rounded-lg text-sm hover:bg-white/5 transition-colors"
            >
              View Bookings
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Individual size picker overlay ───────────────────────────────── */}
      {sizePicker && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSizePicker(null)}>
          <div
            className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl w-full max-w-lg p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{sizePicker.product.name}</p>
                <p className="text-xs text-[#B4B4B4] mt-0.5">Select a size to add to order</p>
              </div>
              <button onClick={() => setSizePicker(null)} className="text-[#B4B4B4] hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SizeTiles
              sizes={sizePicker.sizes}
              selected={getCartItem(sizePicker.product.id)?.size}
              onSelect={(size) => addToCartWithSize(sizePicker.product, size)}
            />
            <p className="text-center text-xs text-[#555]">
              {sizePicker.product.pricingTiers.length > 0 && (
                <span className="text-[#C8FF00] font-bold">
                  {formatCurrency(getBestPrice(sizePicker.product.pricingTiers, durationDays))}
                </span>
              )}{" "}
              for {durationDays} day{durationDays !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* ── Package multi-component picker overlay ───────────────────────── */}
      {packagePicker && (() => {
        const components = PACKAGE_COMPONENTS[packagePicker.product.slug] ?? []
        const required = components.filter((c) => !c.optional)
        const optional = components.filter((c) => c.optional)
        const allRequired = required.every((c) => packagePicker.selected[c.label])
        return (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPackagePicker(null)}>
            <div
              className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{packagePicker.product.name}</p>
                  <p className="text-xs text-[#B4B4B4] mt-0.5">Select sizes for all required components</p>
                </div>
                <button onClick={() => setPackagePicker(null)} className="text-[#B4B4B4] hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {required.map((comp) => {
                const sizes = mergeComponentSizes(comp.productSlugs)
                return (
                  <div key={comp.label}>
                    <p className="text-xs font-semibold text-[#B4B4B4] uppercase tracking-wider mb-2">{comp.label}</p>
                    {sizes.length === 0 ? (
                      <p className="text-xs text-[#555]">No stock available</p>
                    ) : (
                      <SizeTiles
                        sizes={sizes}
                        selected={packagePicker.selected[comp.label]}
                        onSelect={(size) => selectPackageComponentSize(packagePicker.product, comp.label, size)}
                      />
                    )}
                  </div>
                )
              })}

              {optional.length > 0 && (
                <div className="border-t border-[#2e2e2e] pt-4 space-y-4">
                  <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest">Optional Add-ons</p>
                  {optional.map((comp) => {
                    const sizes = mergeComponentSizes(comp.productSlugs)
                    return (
                      <div key={comp.label}>
                        <p className="text-xs font-semibold text-[#B4B4B4] uppercase tracking-wider mb-2">{comp.label}</p>
                        {sizes.length > 0 && (
                          <SizeTiles
                            sizes={sizes}
                            selected={packagePicker.selected[comp.label]}
                            onSelect={(size) => selectPackageComponentSize(packagePicker.product, comp.label, size)}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#2e2e2e]">
                <span className="text-[#C8FF00] font-bold">
                  {formatCurrency(getBestPrice(packagePicker.product.pricingTiers, durationDays))}
                  <span className="text-[#B4B4B4] font-normal text-xs"> / {durationDays}d</span>
                </span>
                <button
                  onClick={() => allRequired && setPackagePicker(null)}
                  disabled={!allRequired}
                  className="px-5 py-2 bg-[#C8FF00] text-[#121212] rounded-lg text-sm font-bold hover:bg-[#b3e600] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {allRequired ? "Done" : "Select required sizes"}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-5 border-b border-[#2e2e2e] flex-shrink-0">

        {/* Mode toggle */}
        <div className="flex bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg p-1">
          <button
            onClick={() => setMode("book")}
            className={`px-5 py-2 rounded-md text-xs font-semibold tracking-widest uppercase transition-all ${
              mode === "book" ? "bg-[#C8FF00] text-[#121212]" : "text-[#B4B4B4] hover:text-white"
            }`}
          >
            Book Now
          </button>
          <button
            onClick={() => setMode("reserve")}
            className={`px-5 py-2 rounded-md text-xs font-semibold tracking-widest uppercase transition-all ${
              mode === "reserve" ? "bg-[#C8FF00] text-[#121212]" : "text-[#B4B4B4] hover:text-white"
            }`}
          >
            Reserve
          </button>
        </div>

        {/* Duration picker */}
        <div className="relative">
          <button
            onClick={() => setShowDurationPicker(!showDurationPicker)}
            className="flex items-center gap-2 bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg px-4 py-2.5 text-sm text-white hover:border-[#C8FF00]/40 transition-colors"
          >
            <span className="font-medium">{durationDays} day{durationDays !== 1 ? "s" : ""}</span>
            <span className="text-[#B4B4B4] text-xs">
              {format(new Date(startDate), "d MMM")} → {format(new Date(endDate), "d MMM")}
            </span>
            <ChevronDown className="h-4 w-4 text-[#B4B4B4]" />
          </button>
          {showDurationPicker && (
            <div className="absolute top-full mt-1 left-0 z-50 bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl shadow-xl p-3 w-72">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {DURATIONS.map((d) => (
                  <button
                    key={d.days}
                    onClick={() => { setDurationDays(d.days); setShowDurationPicker(false) }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      durationDays === d.days ? "bg-[#C8FF00] text-[#121212]" : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-[#2e2e2e] pt-3 space-y-2">
                <label className="text-xs text-[#B4B4B4] tracking-widest uppercase">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C8FF00] transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto text-xs text-[#B4B4B4]">
          <span className="text-white font-medium">{cart.length}</span> item{cart.length !== 1 ? "s" : ""} in order
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-5 flex-1 min-h-0 pt-5">

        {/* ── Product catalog ──────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0">

          {/* Category tabs */}
          <div className="flex gap-1.5 flex-wrap mb-4 flex-shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-colors capitalize ${
                  categoryFilter === cat
                    ? "bg-[#C8FF00] text-[#121212]"
                    : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat === "all" ? "All Products" : cat}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {[true, false].map((isPackage) => {
              const group = filtered.filter((p) => p.isPackage === isPackage)
              if (!group.length) return null
              return (
                <div key={String(isPackage)} className="mb-6">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#B4B4B4] mb-3">
                    {isPackage ? "Packages" : "Individual Items"}
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {group.map((product) => {
                      const cartItem = getCartItem(product.id)
                      const price = getBestPrice(product.pricingTiers, durationDays)
                      const emoji = CATEGORY_EMOJI[product.category.name] ?? "📦"
                      const inCart = !!cartItem
                      const sizes = availMap[product.id] ?? []

                      return (
                        <div
                          key={product.id}
                          className={`relative rounded-xl border transition-all duration-150 overflow-hidden ${
                            inCart
                              ? "border-[#C8FF00]/60 bg-[#C8FF00]/5"
                              : "border-[#2e2e2e] bg-[#1e1e1e] hover:border-[#444]"
                          }`}
                        >
                          <button
                            className="w-full text-left p-4"
                            onClick={() => handleProductClick(product)}
                          >
                            <div className="text-2xl mb-2">{emoji}</div>
                            <p className="font-medium text-white text-sm leading-tight">{product.name}</p>
                            <p className="text-xs text-[#B4B4B4] mt-0.5">{product.category.name}</p>
                            {price > 0 ? (
                              <p className="text-[#C8FF00] font-bold text-sm mt-2">
                                {formatCurrency(price)}
                                <span className="text-[#B4B4B4] font-normal text-xs"> / {durationDays}d</span>
                              </p>
                            ) : (
                              <p className="text-[#B4B4B4] text-xs mt-2">No pricing set</p>
                            )}
                            {inCart && cartItem.size && (
                              <span className="inline-block mt-1.5 text-[10px] font-bold bg-[#C8FF00]/15 text-[#C8FF00] border border-[#C8FF00]/30 px-2 py-0.5 rounded">
                                {cartItem.size}
                              </span>
                            )}
                            {!inCart && sizes.length > 0 && (
                              <p className="text-[10px] text-[#555] mt-1">
                                {sizes.filter(s => s.available > 0).length} sizes available
                              </p>
                            )}
                          </button>

                          {inCart && (
                            <div className="flex items-center justify-between border-t border-[#C8FF00]/20 px-3 py-2 bg-[#C8FF00]/5">
                              <button
                                onClick={() => decrementCart(product.id)}
                                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                              >
                                <Minus className="h-3 w-3 text-white" />
                              </button>
                              <span className="font-bold text-white text-sm">{cartItem.qty}</span>
                              <button
                                onClick={() => incrementCart(product)}
                                className="w-7 h-7 rounded-lg bg-[#C8FF00] hover:bg-[#b3e600] flex items-center justify-center transition-colors"
                              >
                                <Plus className="h-3 w-3 text-[#121212]" />
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right panel ──────────────────────────────────────────────── */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">

          {rightPanel === "order" ? (
            <>
              {/* Order items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#B4B4B4] mb-3">Order</p>

                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <p className="text-[#B4B4B4] text-sm">No items yet</p>
                    <p className="text-[#B4B4B4]/50 text-xs mt-1">Tap a product to add it</p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const product = products.find((p) => p.id === item.productId)
                    const sizes = product ? (availMap[product.id] ?? []) : []
                    return (
                      <div key={item.productId} className="bg-[#252525] rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{item.name}</p>
                            <p className="text-xs text-[#B4B4B4]">{item.categoryName}</p>
                          </div>
                          <button onClick={() => removeItemFully(item.productId)} className="text-[#B4B4B4] hover:text-red-400 transition-colors mt-0.5">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Size — package multi-line or single tag */}
                        {(() => {
                          const isPkg = product && !!PACKAGE_COMPONENTS[product.slug]
                          if (isPkg) {
                            return (
                              <div className="space-y-0.5">
                                {item.size ? (
                                  item.size.split(" · ").map((part) => (
                                    <p key={part} className="text-[10px] text-[#B4B4B4]">{part}</p>
                                  ))
                                ) : (
                                  <p className="text-xs text-red-400 font-medium">⚠ Select sizes</p>
                                )}
                                <button
                                  onClick={() => product && setPackagePicker({ product, selected: item.size ? Object.fromEntries(item.size.split(" · ").map((p) => { const [l,v] = p.split(": "); return [l,v] })) : {} })}
                                  className="text-[10px] text-[#555] hover:text-[#B4B4B4] transition-colors"
                                >
                                  {item.size ? "Change sizes" : "Select sizes"}
                                </button>
                              </div>
                            )
                          }
                          if (sizes.length > 0) {
                            return (
                              <div className="flex items-center gap-2">
                                {item.size ? (
                                  <>
                                    <span className="text-xs font-bold bg-[#C8FF00]/15 text-[#C8FF00] border border-[#C8FF00]/30 px-2 py-0.5 rounded">
                                      {item.size}
                                    </span>
                                    <button
                                      onClick={() => product && setSizePicker({ product, sizes })}
                                      className="text-[10px] text-[#555] hover:text-[#B4B4B4] transition-colors"
                                    >
                                      Change
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => product && setSizePicker({ product, sizes })}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
                                  >
                                    ⚠ Select size
                                  </button>
                                )}
                              </div>
                            )
                          }
                          return item.size ? <span className="text-xs text-[#B4B4B4]">Size: {item.size}</span> : null
                        })()}

                        {/* Qty + price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button onClick={() => decrementCart(item.productId)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center">
                              <Minus className="h-3 w-3 text-white" />
                            </button>
                            <span className="text-white text-sm font-medium w-4 text-center">{item.qty}</span>
                            <button
                              onClick={() => product && incrementCart(product)}
                              className="w-6 h-6 rounded bg-[#C8FF00] hover:bg-[#b3e600] flex items-center justify-center"
                            >
                              <Plus className="h-3 w-3 text-[#121212]" />
                            </button>
                          </div>
                          <span className="text-[#C8FF00] font-bold text-sm">
                            {formatCurrency(item.unitPrice * item.qty)}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Customer section */}
              <div className="border-t border-[#2e2e2e] p-4">
                {customer ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#C8FF00]/20 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-[#C8FF00]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{customer.firstName} {customer.lastName}</p>
                        <p className="text-xs text-[#B4B4B4]">{customer.email}</p>
                      </div>
                    </div>
                    <button onClick={() => { setCustomer(null); setRightPanel("customer") }} className="text-xs text-[#B4B4B4] hover:text-white transition-colors">
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setRightPanel("customer")}
                    className="w-full flex items-center gap-2 border border-dashed border-[#333] hover:border-[#C8FF00]/40 rounded-lg px-3 py-2.5 text-sm text-[#B4B4B4] hover:text-white transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Add Customer
                  </button>
                )}
              </div>

              {/* Discount + totals */}
              <div className="border-t border-[#2e2e2e] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#B4B4B4] w-16">Discount</span>
                  <div className="flex-1 relative">
                    <input
                      type="number" min="0" max="100"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white pr-8 focus:outline-none focus:border-[#C8FF00] transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B4B4B4] text-xs">%</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[#B4B4B4]">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({discount}%)</span>
                      <span>−{formatCurrency(discountAmt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-base pt-1 border-t border-[#2e2e2e]">
                    <span>Total</span>
                    <span className="text-[#C8FF00]">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="text-xs text-[#B4B4B4] bg-[#252525] rounded-lg px-3 py-2 flex justify-between">
                  <span>{durationDays} day{durationDays !== 1 ? "s" : ""}</span>
                  <span>{format(new Date(startDate), "d MMM")} → {format(new Date(endDate), "d MMM")}</span>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !cart.length}
                  className="w-full bg-[#C8FF00] hover:bg-[#b3e600] text-[#121212] font-bold py-3 rounded-lg text-sm tracking-widest uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? "Creating..." : mode === "book" ? "Book Now" : "Reserve"}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </>
          ) : (
            /* ── Customer panel ──────────────────────────────────────── */
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-[#2e2e2e] flex items-center gap-3">
                <button onClick={() => setRightPanel("order")} className="text-[#B4B4B4] hover:text-white transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-semibold text-white">Customer</p>
              </div>

              <div className="p-4 border-b border-[#2e2e2e]">
                <div className="flex bg-[#252525] rounded-lg p-0.5 mb-3">
                  <button
                    onClick={() => setCustomerMode("search")}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      customerMode === "search" ? "bg-[#C8FF00] text-[#121212]" : "text-[#B4B4B4]"
                    }`}
                  >
                    Find Existing
                  </button>
                  <button
                    onClick={() => setCustomerMode("new")}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      customerMode === "new" ? "bg-[#C8FF00] text-[#121212]" : "text-[#B4B4B4]"
                    }`}
                  >
                    New Customer
                  </button>
                </div>

                {customerMode === "search" && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B4B4B4]" />
                    <input
                      autoFocus
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Search name, email or phone..."
                      className="w-full bg-[#121212] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C8FF00] transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {customerMode === "search" ? (
                  <>
                    {customerResults.length === 0 && customerSearch.length >= 2 && (
                      <p className="text-sm text-[#B4B4B4] text-center py-4">No customers found</p>
                    )}
                    {customerResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setCustomer(c); setRightPanel("order"); setCustomerSearch(""); setCustomerResults([]) }}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors mb-1"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#C8FF00]/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-[#C8FF00]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-[#B4B4B4] truncate">{c.email}</p>
                          {c.phone && <p className="text-xs text-[#B4B4B4]">{c.phone}</p>}
                        </div>
                      </button>
                    ))}
                    {customerSearch.length < 2 && (
                      <p className="text-xs text-[#B4B4B4] text-center py-4">Type to search customers</p>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: "First Name *", key: "firstName", type: "text" },
                      { label: "Last Name *", key: "lastName", type: "text" },
                      { label: "Email *", key: "email", type: "email" },
                      { label: "Phone", key: "phone", type: "tel" },
                    ].map(({ label, key, type }) => (
                      <div key={key}>
                        <label className="block text-[10px] tracking-widest uppercase text-[#B4B4B4] mb-1.5">{label}</label>
                        <input
                          type={type}
                          value={(customerForm as any)[key]}
                          onChange={(e) => setCustomerForm((f) => ({ ...f, [key]: e.target.value }))}
                          className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C8FF00] transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {customerMode === "new" && (
                <div className="p-4 border-t border-[#2e2e2e]">
                  <button
                    onClick={() => {
                      if (!customerForm.firstName || !customerForm.email) return
                      setCustomer(customerForm)
                      setRightPanel("order")
                    }}
                    disabled={!customerForm.firstName || !customerForm.email}
                    className="w-full bg-[#C8FF00] hover:bg-[#b3e600] text-[#121212] font-bold py-2.5 rounded-lg text-sm tracking-wide disabled:opacity-40 transition-colors"
                  >
                    Confirm Customer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
