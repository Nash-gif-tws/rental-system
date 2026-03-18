"use client"

import { useEffect, useState } from "react"
import { ArrowRight, ArrowLeft, Plus, Minus } from "lucide-react"
import type { BookingState, BookingItem } from "./BookingWizard"

type PricingTier = { id: string; label: string; days: number; price: number }
type Product = {
  id: string; name: string; category: string; categorySlug: string
  isPackage: boolean; available: number; totalUnits: number; pricingTiers: PricingTier[]
}

const CATEGORY_ORDER = ["snowboards", "skis", "boots", "clothing", "accessories"]
const CATEGORY_EMOJI: Record<string, string> = {
  snowboards: "🏂", skis: "🎿", boots: "🥾", clothing: "🧥", accessories: "🪖"
}

function getBestPrice(tiers: PricingTier[], days: number): number {
  if (!tiers.length) return 0
  const sorted = [...tiers].sort((a, b) => b.days - a.days)
  return sorted.find((t) => t.days <= days)?.price ?? tiers[0].price
}

export default function StepEquipment({ state, onUpdate, onNext, onBack }: {
  state: BookingState; onUpdate: (u: Partial<BookingState>) => void
  onNext: () => void; onBack: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sizes, setSizes] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch(`/api/availability?start=${state.startDate}&end=${state.endDate}`)
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false) })
  }, [state.startDate, state.endDate])

  function getQty(id: string) { return state.items.find((i) => i.productId === id)?.quantity ?? 0 }

  function setQty(product: Product, qty: number) {
    const price = getBestPrice(product.pricingTiers, state.rentalDays)
    let items: BookingItem[]
    if (qty === 0) {
      items = state.items.filter((i) => i.productId !== product.id)
    } else if (state.items.find((i) => i.productId === product.id)) {
      items = state.items.map((i) => i.productId === product.id ? { ...i, quantity: qty, unitPrice: price } : i)
    } else {
      items = [...state.items, { productId: product.id, productName: product.name, category: product.category, size: sizes[product.id] ?? "", quantity: qty, unitPrice: price }]
    }
    onUpdate({ items })
  }

  function updateSize(productId: string, size: string) {
    setSizes((p) => ({ ...p, [productId]: size }))
    onUpdate({ items: state.items.map((i) => i.productId === productId ? { ...i, size } : i) })
  }

  const subtotal = state.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const grouped = products.reduce((acc, p) => {
    if (!acc[p.categorySlug]) acc[p.categorySlug] = []
    acc[p.categorySlug].push(p)
    return acc
  }, {} as Record<string, Product[]>)
  const sortedCategories = CATEGORY_ORDER.filter((s) => grouped[s])

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Checking availability...</p>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Choose your equipment</h1>
        <p className="text-gray-500 text-sm mt-1">
          Prices shown for your {state.rentalDays}-day rental. Packages include board/skis + boots.
        </p>
      </div>

      {sortedCategories.map((slug) => (
        <div key={slug}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{CATEGORY_EMOJI[slug]}</span>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {grouped[slug][0].category}
            </h2>
          </div>
          <div className="space-y-3">
            {grouped[slug].map((product) => {
              const price = getBestPrice(product.pricingTiers, state.rentalDays)
              const qty = getQty(product.id)
              const outOfStock = product.totalUnits > 0 && product.available === 0

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    qty > 0 ? "border-sky-300 shadow-md shadow-sky-50"
                    : outOfStock ? "border-gray-100 opacity-50"
                    : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between p-4 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                        {product.isPackage && (
                          <span className="text-[10px] bg-sky-50 text-sky-600 font-bold px-1.5 py-0.5 rounded-full border border-sky-100">
                            PACKAGE
                          </span>
                        )}
                      </div>
                      <p className="text-sky-500 font-bold text-sm mt-0.5">
                        ${price.toFixed(2)}
                        <span className="text-gray-400 font-normal text-xs"> / rental</span>
                      </p>
                    </div>

                    {outOfStock ? (
                      <span className="text-xs text-red-400 font-semibold bg-red-50 border border-red-100 px-3 py-1.5 rounded-full flex-shrink-0">
                        Fully booked
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {qty > 0 && (
                          <button
                            onClick={() => setQty(product, qty - 1)}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5 text-gray-600" />
                          </button>
                        )}
                        {qty > 0 && (
                          <span className="w-5 text-center font-bold text-gray-900 text-sm">{qty}</span>
                        )}
                        <button
                          onClick={() => setQty(product, qty + 1)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            qty > 0 ? "bg-sky-500 hover:bg-sky-600 text-white" : "bg-gray-100 hover:bg-sky-50 hover:text-sky-600"
                          }`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {qty > 0 && (
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                      <input
                        placeholder="Size? (e.g. 42 EU boots · 160cm skis · M jacket)"
                        value={sizes[product.id] ?? ""}
                        onChange={(e) => updateSize(product.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Sticky cart */}
      <div className={`sticky bottom-4 transition-all duration-300 ${subtotal > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <div className="bg-[#0f172a] rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-slate-900/20">
          <div>
            <p className="text-slate-400 text-xs">{state.items.length} item{state.items.length !== 1 ? "s" : ""} selected</p>
            <p className="text-white font-bold text-lg">${subtotal.toFixed(2)}</p>
          </div>
          <button
            onClick={onNext}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold px-5 py-3 rounded-xl transition-all text-sm"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to dates
      </button>
    </div>
  )
}
