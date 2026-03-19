"use client"

import { useEffect, useState } from "react"
import { ArrowRight, ArrowLeft, ChevronDown } from "lucide-react"
import type { BookingState, BookingItem } from "./BookingWizard"

type PricingTier = { id: string; label: string; days: number; price: number }
type SizeOption = { size: string; total: number; available: number }
type Product = {
  id: string
  slug: string
  name: string
  category: string
  categorySlug: string
  isPackage: boolean
  available: number
  totalUnits: number
  hasSizes: boolean
  sizes: SizeOption[]
  pricingTiers: PricingTier[]
}

// ─── Package component definitions ───────────────────────────────────────────
// Maps package slug → ordered list of size fields, each sourcing from one or
// more inventory product slugs.
type PackageComponent = {
  label: string
  productSlugs: string[]
  optional?: boolean
}

const PACKAGE_COMPONENTS: Record<string, PackageComponent[]> = {
  "adult-ski-package": [
    { label: "Ski Length", productSlugs: ["adult-skis"] },
    { label: "Boot Size", productSlugs: ["mens-ski-boots", "womens-ski-boots"] },
    { label: "Pole Length", productSlugs: ["ski-poles"] },
  ],
  "junior-ski-package": [
    { label: "Ski Length", productSlugs: ["kids-skis"] },
    { label: "Boot Size", productSlugs: ["kids-ski-boots"] },
    { label: "Pole Length", productSlugs: ["ski-poles"] },
  ],
  "adult-snowboard-package": [
    { label: "Board Length", productSlugs: ["mens-snowboards", "womens-snowboards"] },
    {
      label: "Boot Size",
      productSlugs: [
        "mens-snowboard-boots",
        "womens-snowboard-boots",
        "mens-stepon-boots",
        "womens-stepon-boots",
      ],
    },
  ],
  "junior-snowboard-package": [
    { label: "Board Length", productSlugs: ["kids-snowboards"] },
    { label: "Boot Size", productSlugs: ["kids-snowboard-boots"] },
  ],
}

const CATEGORY_ORDER = ["snowboards", "skis", "boots", "clothing", "accessories"]
const CATEGORY_EMOJI: Record<string, string> = {
  snowboards: "🏂",
  skis: "🎿",
  boots: "🥾",
  clothing: "🧥",
  accessories: "🪖",
}

function getBestPrice(tiers: PricingTier[], days: number): number {
  if (!tiers.length) return 0
  const sorted = [...tiers].sort((a, b) => b.days - a.days)
  return sorted.find((t) => t.days <= days)?.price ?? tiers[0].price
}

// Merge + deduplicate + sort sizes from multiple products
function mergeComponentSizes(productSlugs: string[], productsBySlug: Record<string, Product>): SizeOption[] {
  const merged: Record<string, SizeOption> = {}
  for (const slug of productSlugs) {
    const p = productsBySlug[slug]
    if (!p) continue
    for (const sz of p.sizes) {
      if (!merged[sz.size]) {
        merged[sz.size] = { size: sz.size, total: 0, available: 0 }
      }
      merged[sz.size].total += sz.total
      merged[sz.size].available += sz.available
    }
  }
  return Object.values(merged).sort((a, b) => sortSize(a.size, b.size))
}

function sortSize(a: string, b: string): number {
  const numA = parseFloat(a)
  const numB = parseFloat(b)
  if (!isNaN(numA) && !isNaN(numB)) return numA - numB
  const order = ["XS", "S", "M", "L", "XL", "2XL", "3XL"]
  const ia = order.indexOf(a.toUpperCase())
  const ib = order.indexOf(b.toUpperCase())
  if (ia !== -1 && ib !== -1) return ia - ib
  if (ia !== -1) return -1
  if (ib !== -1) return 1
  return a.localeCompare(b)
}

// Format package sizes as human-readable string
function formatPackageSize(sizes: Record<string, string>): string {
  return Object.entries(sizes)
    .map(([label, size]) => `${label}: ${size}`)
    .join(" · ")
}

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
  const [openProductId, setOpenProductId] = useState<string | null>(null)
  // Package component selections: productId → { componentLabel → selectedSize }
  const [packageSizes, setPackageSizes] = useState<Record<string, Record<string, string>>>({})

  useEffect(() => {
    fetch(`/api/availability?start=${state.startDate}&end=${state.endDate}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
  }, [state.startDate, state.endDate])

  // Build slug → product lookup
  const productsBySlug = products.reduce(
    (acc, p) => { acc[p.slug] = p; return acc },
    {} as Record<string, Product>
  )

  function getSelectedItem(productId: string) {
    return state.items.find((i) => i.productId === productId)
  }

  // ── Individual product size selection ──
  function selectSize(product: Product, size: string) {
    const price = getBestPrice(product.pricingTiers, state.rentalDays)
    const existing = state.items.find((i) => i.productId === product.id)
    let items: BookingItem[]
    if (existing) {
      if (existing.size === size) {
        items = state.items.filter((i) => i.productId !== product.id)
        setOpenProductId(null)
      } else {
        items = state.items.map((i) =>
          i.productId === product.id ? { ...i, size, unitPrice: price } : i
        )
      }
    } else {
      items = [
        ...state.items,
        { productId: product.id, productName: product.name, category: product.category, size, quantity: 1, unitPrice: price },
      ]
    }
    onUpdate({ items })
  }

  function removeProduct(productId: string) {
    onUpdate({ items: state.items.filter((i) => i.productId !== productId) })
    setPackageSizes((p) => { const n = { ...p }; delete n[productId]; return n })
    setOpenProductId(null)
  }

  function toggleProduct(product: Product) {
    if (!product.hasSizes && !PACKAGE_COMPONENTS[product.slug] && product.available > 0) {
      const exists = state.items.find((i) => i.productId === product.id)
      if (exists) {
        removeProduct(product.id)
      } else {
        const price = getBestPrice(product.pricingTiers, state.rentalDays)
        onUpdate({
          items: [...state.items, { productId: product.id, productName: product.name, category: product.category, size: "", quantity: 1, unitPrice: price }],
        })
      }
      return
    }
    setOpenProductId((prev) => (prev === product.id ? null : product.id))
  }

  // ── Package component selection ──
  function selectPackageComponentSize(product: Product, componentLabel: string, size: string) {
    const current = packageSizes[product.id] ?? {}
    const isDeselect = current[componentLabel] === size

    const updated = isDeselect
      ? Object.fromEntries(Object.entries(current).filter(([k]) => k !== componentLabel))
      : { ...current, [componentLabel]: size }

    setPackageSizes((p) => ({ ...p, [product.id]: updated }))

    // Check if all required components are now selected → update cart item
    const components = PACKAGE_COMPONENTS[product.slug] ?? []
    const required = components.filter((c) => !c.optional)
    const allSelected = required.every((c) => updated[c.label])

    const price = getBestPrice(product.pricingTiers, state.rentalDays)
    const existing = state.items.find((i) => i.productId === product.id)

    if (allSelected) {
      const sizeStr = formatPackageSize(updated)
      if (existing) {
        onUpdate({ items: state.items.map((i) => i.productId === product.id ? { ...i, size: sizeStr } : i) })
      } else {
        onUpdate({
          items: [...state.items, { productId: product.id, productName: product.name, category: product.category, size: sizeStr, quantity: 1, unitPrice: price }],
        })
      }
    } else {
      // Remove from cart if incomplete
      if (existing) {
        onUpdate({ items: state.items.filter((i) => i.productId !== product.id) })
      }
    }
  }

  // Check if a package is fully configured
  function packageComplete(product: Product): boolean {
    const components = PACKAGE_COMPONENTS[product.slug] ?? []
    const required = components.filter((c) => !c.optional)
    const current = packageSizes[product.id] ?? {}
    return required.every((c) => current[c.label])
  }

  // Determine if a package has any inventory at all
  function packageHasInventory(slug: string): boolean {
    const components = PACKAGE_COMPONENTS[slug]
    if (!components) return false
    return components.every((comp) =>
      comp.productSlugs.some((s) => (productsBySlug[s]?.available ?? 0) > 0)
    )
  }

  const subtotal = state.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const itemCount = state.items.length

  const grouped = products.reduce(
    (acc, p) => {
      if (!acc[p.categorySlug]) acc[p.categorySlug] = []
      acc[p.categorySlug].push(p)
      return acc
    },
    {} as Record<string, Product[]>
  )
  const sortedCategories = CATEGORY_ORDER.filter((s) => grouped[s])

  const canProceed =
    itemCount > 0 &&
    state.items.every((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return true
      if (PACKAGE_COMPONENTS[product.slug]) return packageComplete(product)
      return !product.hasSizes || item.size
    })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-2 border-[#C8FF00] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#B4B4B4]">Checking availability...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="w-5 h-px bg-[#C8FF00]" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C8FF00]">Step 2</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white leading-tight">
          Choose your<br />equipment
        </h1>
        <p className="text-[#B4B4B4] text-sm mt-2">
          Prices shown for your {state.rentalDays}-day rental. Tap a product to select your size.
        </p>
      </div>

      {sortedCategories.map((slug) => (
        <div key={slug}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{CATEGORY_EMOJI[slug]}</span>
            <h2 className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-[0.25em]">
              {grouped[slug][0].category}
            </h2>
          </div>
          <div className="space-y-2">
            {grouped[slug].map((product) => {
              const price = getBestPrice(product.pricingTiers, state.rentalDays)
              const selected = getSelectedItem(product.id)
              const isOpen = openProductId === product.id
              const isPackage = !!PACKAGE_COMPONENTS[product.slug]
              const outOfStock = isPackage
                ? !packageHasInventory(product.slug)
                : product.totalUnits > 0 && product.available === 0

              return (
                <div
                  key={product.id}
                  className={`bg-[#1e1e1e] border rounded-xl transition-all duration-200 overflow-hidden ${
                    selected
                      ? "border-[#C8FF00]/50"
                      : outOfStock
                        ? "border-[#2e2e2e] opacity-50"
                        : "border-[#2e2e2e] hover:border-[#444]"
                  }`}
                >
                  {/* Product row */}
                  <button
                    onClick={() => !outOfStock && toggleProduct(product)}
                    disabled={outOfStock}
                    className="w-full flex items-center justify-between p-4 gap-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white text-sm">{product.name}</p>
                        {product.isPackage && (
                          <span className="text-[9px] bg-[#C8FF00]/10 text-[#C8FF00] font-bold px-2 py-0.5 rounded border border-[#C8FF00]/20 tracking-wider uppercase">
                            Package
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <p className="text-[#C8FF00] font-bold text-sm">
                          ${price.toFixed(2)}
                          <span className="text-[#B4B4B4] font-normal text-xs"> / rental</span>
                        </p>
                        {selected?.size && !isPackage && (
                          <span className="text-xs bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20 px-2 py-0.5 rounded-full">
                            {selected.size}
                          </span>
                        )}
                      </div>
                    </div>

                    {outOfStock ? (
                      <span className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg flex-shrink-0">
                        Unavailable
                      </span>
                    ) : selected && (!isPackage || packageComplete(product)) ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-[#C8FF00] font-semibold bg-[#C8FF00]/10 border border-[#C8FF00]/20 px-3 py-1.5 rounded-lg">
                          ✓ Added
                        </span>
                        <ChevronDown className={`h-4 w-4 text-[#B4B4B4] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-[#B4B4B4] bg-white/5 border border-[#2e2e2e] px-3 py-1.5 rounded-lg">
                          {isPackage ? "Select sizes" : product.hasSizes ? "Select size" : "Add"}
                        </span>
                        {(product.hasSizes || isPackage) && (
                          <ChevronDown className={`h-4 w-4 text-[#B4B4B4] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    )}
                  </button>

                  {/* ── Package multi-component size picker ── */}
                  {isOpen && isPackage && (() => {
                    const components = PACKAGE_COMPONENTS[product.slug] ?? []
                    const current = packageSizes[product.id] ?? {}
                    return (
                      <div className="px-4 pb-4 border-t border-[#2a2a2a] pt-4 space-y-5">
                        {components.map((comp) => {
                          const sizes = mergeComponentSizes(comp.productSlugs, productsBySlug)
                          return (
                            <div key={comp.label}>
                              <p className="text-xs font-semibold text-[#B4B4B4] uppercase tracking-wider mb-2">
                                {comp.label}
                                {comp.optional && (
                                  <span className="ml-1.5 text-[#555] font-normal normal-case tracking-normal">
                                    (optional)
                                  </span>
                                )}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {sizes.length === 0 ? (
                                  <p className="text-xs text-[#555]">No sizes available</p>
                                ) : (
                                  sizes.map((sz) => {
                                    const isSelected = current[comp.label] === sz.size
                                    const unavailable = sz.available === 0
                                    return (
                                      <button
                                        key={sz.size}
                                        onClick={() => !unavailable && selectPackageComponentSize(product, comp.label, sz.size)}
                                        disabled={unavailable}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                          isSelected
                                            ? "bg-[#C8FF00] text-[#121212] border-[#C8FF00]"
                                            : unavailable
                                              ? "bg-white/[0.03] text-[#444] border-[#252525] line-through cursor-not-allowed"
                                              : "bg-white/5 text-white border-[#2e2e2e] hover:border-[#C8FF00]/50 hover:text-[#C8FF00]"
                                        }`}
                                      >
                                        {sz.size}
                                      </button>
                                    )
                                  })
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {/* Summary when complete */}
                        {packageComplete(product) && (
                          <div className="bg-[#C8FF00]/5 border border-[#C8FF00]/20 rounded-lg px-3 py-2.5 text-xs text-[#C8FF00]">
                            {formatPackageSize(current)}
                          </div>
                        )}

                        {selected && (
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Remove from cart
                          </button>
                        )}
                      </div>
                    )
                  })()}

                  {/* ── Individual product size picker ── */}
                  {isOpen && !isPackage && product.hasSizes && (
                    <div className="px-4 pb-4 border-t border-[#2a2a2a] pt-3">
                      <p className="text-xs text-[#B4B4B4] mb-2 uppercase tracking-wider">Select your size</p>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((sz) => {
                          const isSelected = selected?.size === sz.size
                          const unavailable = sz.available === 0
                          return (
                            <button
                              key={sz.size}
                              onClick={() => !unavailable && selectSize(product, sz.size)}
                              disabled={unavailable}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                isSelected
                                  ? "bg-[#C8FF00] text-[#121212] border-[#C8FF00]"
                                  : unavailable
                                    ? "bg-white/[0.03] text-[#555] border-[#2a2a2a] line-through cursor-not-allowed"
                                    : "bg-white/5 text-white border-[#2e2e2e] hover:border-[#C8FF00]/50 hover:text-[#C8FF00]"
                              }`}
                            >
                              {sz.size}
                              {unavailable && <span className="ml-1 text-[10px] opacity-60">×</span>}
                            </button>
                          )
                        })}
                      </div>
                      {selected && (
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove from cart
                        </button>
                      )}
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
        <div className="bg-[#1a1a1a] border border-[#C8FF00]/30 rounded-xl p-4 flex items-center justify-between shadow-xl shadow-black/40">
          <div>
            <p className="text-[#B4B4B4] text-xs">
              {itemCount} item{itemCount !== 1 ? "s" : ""} selected
            </p>
            <p className="text-white font-bold text-lg">${subtotal.toFixed(2)}</p>
          </div>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex items-center gap-2 font-bold px-5 py-3 rounded-lg transition-colors text-sm tracking-widest uppercase ${
              canProceed
                ? "bg-[#C8FF00] hover:bg-[#b3e600] text-[#121212]"
                : "bg-white/10 text-[#555] cursor-not-allowed"
            }`}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {!canProceed && itemCount > 0 && (
          <p className="text-center text-xs text-[#B4B4B4] mt-2">
            Please complete all size selections
          </p>
        )}
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[#B4B4B4] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dates
      </button>
    </div>
  )
}
