"use client"

import { useEffect, useState } from "react"
import { ChevronRight, ChevronLeft, Plus, Minus, Package } from "lucide-react"
import type { BookingState, BookingItem } from "./BookingWizard"

type PricingTier = { id: string; label: string; days: number; price: number }
type Product = {
  id: string
  name: string
  category: string
  categorySlug: string
  isPackage: boolean
  available: number
  totalUnits: number
  pricingTiers: PricingTier[]
}

function getBestPrice(tiers: PricingTier[], days: number): number {
  if (!tiers.length) return 0
  const sorted = [...tiers].sort((a, b) => b.days - a.days)
  const match = sorted.find((t) => t.days <= days)
  return match ? match.price : tiers[0].price
}

const CATEGORY_ORDER = ["snowboards", "skis", "boots", "clothing", "accessories"]

export default function StepEquipment({
  state,
  onUpdate,
  onNext,
  onBack,
}: {
  state: BookingState
  onUpdate: (u: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sizes, setSizes] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch(`/api/availability?start=${state.startDate}&end=${state.endDate}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
  }, [state.startDate, state.endDate])

  function getItemQty(productId: string): number {
    return state.items.find((i) => i.productId === productId)?.quantity ?? 0
  }

  function setQty(product: Product, qty: number) {
    const price = getBestPrice(product.pricingTiers, state.rentalDays)
    const existing = state.items.find((i) => i.productId === product.id)

    let items: BookingItem[]
    if (qty === 0) {
      items = state.items.filter((i) => i.productId !== product.id)
    } else if (existing) {
      items = state.items.map((i) =>
        i.productId === product.id ? { ...i, quantity: qty, unitPrice: price } : i
      )
    } else {
      items = [
        ...state.items,
        {
          productId: product.id,
          productName: product.name,
          category: product.category,
          size: sizes[product.id] ?? "",
          quantity: qty,
          unitPrice: price,
        },
      ]
    }
    onUpdate({ items })
  }

  function updateSize(productId: string, size: string) {
    setSizes((prev) => ({ ...prev, [productId]: size }))
    onUpdate({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, size } : i
      ),
    })
  }

  const subtotal = state.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  // Group by category
  const grouped = products.reduce(
    (acc, p) => {
      if (!acc[p.categorySlug]) acc[p.categorySlug] = []
      acc[p.categorySlug].push(p)
      return acc
    },
    {} as Record<string, Product[]>
  )

  const sortedCategories = CATEGORY_ORDER.filter((s) => grouped[s])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Choose your equipment</h1>
        <p className="text-gray-500 mt-1">
          Prices shown for your {state.rentalDays}-day rental. Packages include board/skis + boots + bindings.
        </p>
      </div>

      {sortedCategories.map((slug) => (
        <div key={slug}>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {grouped[slug][0].category}
          </h2>
          <div className="space-y-3">
            {grouped[slug].map((product) => {
              const price = getBestPrice(product.pricingTiers, state.rentalDays)
              const qty = getItemQty(product.id)
              const outOfStock = product.totalUnits > 0 && product.available === 0

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border p-4 transition-all ${
                    qty > 0
                      ? "border-sky-400 ring-1 ring-sky-200"
                      : outOfStock
                      ? "border-gray-100 opacity-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {product.isPackage && (
                        <div className="bg-sky-50 p-2 rounded-lg">
                          <Package className="h-4 w-4 text-sky-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-sky-600 font-medium">
                          ${price.toFixed(2)}
                          <span className="text-gray-400 font-normal"> / rental</span>
                        </p>
                      </div>
                    </div>

                    {outOfStock ? (
                      <span className="text-xs text-red-500 font-medium bg-red-50 px-3 py-1.5 rounded-full">
                        Fully booked
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {qty > 0 && (
                          <button
                            onClick={() => setQty(product, qty - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        )}
                        {qty > 0 && (
                          <span className="w-6 text-center font-semibold text-gray-900">{qty}</span>
                        )}
                        <button
                          onClick={() => setQty(product, qty + 1)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            qty > 0
                              ? "bg-sky-600 text-white hover:bg-sky-700"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Size input when added */}
                  {qty > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <input
                        placeholder="Size (e.g. 27.5 EU boots, 160cm skis, M jacket)"
                        value={sizes[product.id] ?? ""}
                        onChange={(e) => updateSize(product.id, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Sticky total */}
      {subtotal > 0 && (
        <div className="sticky bottom-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">{state.items.length} item{state.items.length !== 1 ? "s" : ""}</p>
            <p className="text-xl font-bold text-gray-900">${subtotal.toFixed(2)}</p>
          </div>
          <button
            onClick={onNext}
            className="bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-sky-700 transition-colors flex items-center gap-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
    </div>
  )
}
