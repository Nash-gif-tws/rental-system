"use client"

import { useEffect, useState } from "react"
import { ArrowRight, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"
import type { BookingState, BookingItem } from "./BookingWizard"
import type { QuizAnswers } from "./StepQuiz"

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
type PackageComponent = { label: string; productSlugs: string[]; optional?: boolean }

const PACKAGE_COMPONENTS: Record<string, PackageComponent[]> = {
  "mens-ski-package": [
    { label: "Ski Length", productSlugs: ["adult-skis"] },
    { label: "Boot Size", productSlugs: ["mens-ski-boots"] },
    { label: "Pole Length", productSlugs: ["ski-poles"] },
  ],
  "womens-ski-package": [
    { label: "Ski Length", productSlugs: ["adult-skis"] },
    { label: "Boot Size", productSlugs: ["womens-ski-boots"] },
    { label: "Pole Length", productSlugs: ["ski-poles"] },
  ],
  "kids-ski-package": [
    { label: "Ski Length", productSlugs: ["kids-skis"] },
    { label: "Boot Size", productSlugs: ["kids-ski-boots"] },
    { label: "Pole Length", productSlugs: ["ski-poles"] },
  ],
  "mens-snowboard-package": [
    { label: "Board Length", productSlugs: ["mens-snowboards"] },
    { label: "Boot Size", productSlugs: ["mens-snowboard-boots"] },
  ],
  "womens-snowboard-package": [
    { label: "Board Length", productSlugs: ["womens-snowboards"] },
    { label: "Boot Size", productSlugs: ["womens-snowboard-boots"] },
  ],
  "kids-snowboard-package": [
    { label: "Board Length", productSlugs: ["kids-snowboards"] },
    { label: "Boot Size", productSlugs: ["kids-snowboard-boots"] },
  ],
  "mens-burton-stepon-package": [
    { label: "Board Length", productSlugs: ["mens-snowboards"] },
    { label: "Boot Size", productSlugs: ["mens-stepon-boots"] },
  ],
  "womens-burton-stepon-package": [
    { label: "Board Length", productSlugs: ["womens-snowboards"] },
    { label: "Boot Size", productSlugs: ["womens-stepon-boots"] },
  ],
  "mens-outerwear-package": [
    { label: "Jacket Size", productSlugs: ["mens-jackets"] },
    { label: "Pants Size", productSlugs: ["mens-pants"] },
  ],
  "womens-outerwear-package": [
    { label: "Jacket Size", productSlugs: ["womens-jackets"] },
    { label: "Pants Size", productSlugs: ["womens-pants"] },
  ],
  "kids-outerwear-package": [
    { label: "Jacket Size", productSlugs: ["kids-boys-jackets", "kids-girls-jackets"] },
    { label: "Pants Size", productSlugs: ["kids-pants", "kids-snowsuits"] },
  ],
}

// ─── Category definitions (display order) ────────────────────────────────────
const CATEGORIES = [
  { slug: "packages",    label: "Packages",    emoji: "📦", desc: "Everything bundled — best value" },
  { slug: "skis",        label: "Skis",         emoji: "🎿", desc: "Individual skis & poles" },
  { slug: "snowboards",  label: "Snowboards",   emoji: "🏂", desc: "Boards & bindings" },
  { slug: "boots",       label: "Boots",        emoji: "🥾", desc: "Ski & snowboard boots" },
  { slug: "clothing",    label: "Outerwear",    emoji: "🧥", desc: "Jackets, pants & suits" },
  { slug: "accessories", label: "Accessories",  emoji: "🪖", desc: "Helmets, bags & more" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getBestPrice(tiers: PricingTier[], days: number): number {
  if (!tiers.length) return 0
  const sorted = [...tiers].sort((a, b) => a.days - b.days)
  return sorted.find((t) => t.days >= days)?.price ?? sorted[sorted.length - 1].price
}

function getActiveTier(tiers: PricingTier[], days: number): PricingTier | null {
  if (!tiers.length) return null
  const sorted = [...tiers].sort((a, b) => a.days - b.days)
  return sorted.find((t) => t.days >= days) ?? sorted[sorted.length - 1]
}

function mergeComponentSizes(productSlugs: string[], productsBySlug: Record<string, Product>): SizeOption[] {
  const merged: Record<string, SizeOption> = {}
  for (const slug of productSlugs) {
    const p = productsBySlug[slug]
    if (!p) continue
    for (const sz of p.sizes) {
      if (!merged[sz.size]) merged[sz.size] = { size: sz.size, total: 0, available: 0 }
      merged[sz.size].total += sz.total
      merged[sz.size].available += sz.available
    }
  }
  return Object.values(merged).sort((a, b) => sortSize(a.size, b.size))
}

function sortSize(a: string, b: string): number {
  const numA = parseFloat(a), numB = parseFloat(b)
  if (!isNaN(numA) && !isNaN(numB)) return numA - numB
  const order = ["XS", "S", "M", "L", "XL", "2XL", "3XL"]
  const ia = order.indexOf(a.toUpperCase()), ib = order.indexOf(b.toUpperCase())
  if (ia !== -1 && ib !== -1) return ia - ib
  if (ia !== -1) return -1
  if (ib !== -1) return 1
  return a.localeCompare(b)
}

function formatPackageSize(sizes: Record<string, string>): string {
  return Object.entries(sizes).map(([label, size]) => `${label}: ${size}`).join(" · ")
}

// ─── Main component ───────────────────────────────────────────────────────────
// ── Quiz → recommendation mapping ────────────────────────────────────────────
function getRecommendation(quiz: QuizAnswers, products: Product[]): { slug: string; title: string; desc: string } | null {
  const { sport, experience, group } = quiz
  if (!sport || !experience) return null

  if (group === "family") {
    const slug = sport === "snowboard" ? "kids-snowboard-package" : "kids-ski-package"
    return { slug, title: group === "family" ? "Kids Package" : "Junior Package", desc: "Properly fitted kids gear — sized right and safe." }
  }
  if (sport === "ski" || sport === "both") {
    if (experience === "advanced") return { slug: "mens-ski-package", title: "Adult Ski Package", desc: "Sharp Atomic skis, fitted boots & poles. Perfect for experienced skiers." }
    return { slug: "mens-ski-package", title: "Adult Ski Package", desc: "Our most popular rental. Skis, boots & poles — everything set up for you in store." }
  }
  if (sport === "snowboard") {
    if (experience === "advanced") return { slug: "mens-burton-stepon-package", title: "Burton Step-On Package", desc: "Fastest in/out on the mountain. Our premium setup for confident riders." }
    return { slug: "mens-snowboard-package", title: "Adult Snowboard Package", desc: "Burton board & boots, beginner through intermediate. Staff will dial in the fit." }
  }
  return null
}

export default function StepEquipment({ state, onUpdate, onNext, onBack, quizAnswers }: {
  state: BookingState
  onUpdate: (u: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
  quizAnswers?: QuizAnswers | null
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openProductId, setOpenProductId] = useState<string | null>(null)
  const [packageSizes, setPackageSizes] = useState<Record<string, Record<string, string>>>({})
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideActivity, setGuideActivity] = useState<"ski" | "snowboard" | null>(null)
  const [guideLevel, setGuideLevel] = useState<"first" | "some" | "regular" | null>(null)

  useEffect(() => {
    fetch(`/api/availability?start=${state.startDate}&end=${state.endDate}`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        const visible = data.filter((p) => {
          if (PACKAGE_COMPONENTS[p.slug]) return true
          if (p.isPackage) return false
          return p.totalUnits > 0
        })
        setProducts(visible)
        setLoading(false)
      })
  }, [state.startDate, state.endDate])

  const productsBySlug = products.reduce((acc, p) => { acc[p.slug] = p; return acc }, {} as Record<string, Product>)

  // ── Virtual "packages" category ──
  const packageProducts = products.filter((p) => PACKAGE_COMPONENTS[p.slug])
  const nonPackageProducts = products.filter((p) => !PACKAGE_COMPONENTS[p.slug])
  const grouped = nonPackageProducts.reduce((acc, p) => {
    if (!acc[p.categorySlug]) acc[p.categorySlug] = []
    acc[p.categorySlug].push(p)
    return acc
  }, {} as Record<string, Product[]>)

  function getProductsForCategory(slug: string): Product[] {
    if (slug === "packages") return packageProducts
    return grouped[slug] ?? []
  }

  function getSelectedItem(productId: string) {
    return state.items.find((i) => i.productId === productId)
  }

  function selectedCountForCategory(slug: string): number {
    const prods = getProductsForCategory(slug)
    return prods.filter((p) => state.items.some((i) => i.productId === p.id)).length
  }

  function lowestPrice(prods: Product[]): number | null {
    const prices = prods.flatMap((p) => p.pricingTiers).map((t) => t.price)
    return prices.length ? Math.min(...prices) : null
  }

  // ── Item actions ──
  function selectSize(product: Product, size: string) {
    const price = getBestPrice(product.pricingTiers, state.rentalDays)
    const existing = state.items.find((i) => i.productId === product.id)
    let items: BookingItem[]
    if (existing) {
      if (existing.size === size) { items = state.items.filter((i) => i.productId !== product.id); setOpenProductId(null) }
      else items = state.items.map((i) => i.productId === product.id ? { ...i, size, unitPrice: price } : i)
    } else {
      items = [...state.items, { productId: product.id, productName: product.name, category: product.category, size, quantity: 1, unitPrice: price }]
    }
    onUpdate({ items })
  }

  function removeProduct(productId: string) {
    onUpdate({ items: state.items.filter((i) => i.productId !== productId) })
    setPackageSizes((p) => { const n = { ...p }; delete n[productId]; return n })
    setOpenProductId(null)
  }

  function toggleProduct(product: Product) {
    const isPackage = !!PACKAGE_COMPONENTS[product.slug]
    if (!product.hasSizes && !isPackage && product.available > 0) {
      const exists = state.items.find((i) => i.productId === product.id)
      if (exists) removeProduct(product.id)
      else {
        const price = getBestPrice(product.pricingTiers, state.rentalDays)
        onUpdate({ items: [...state.items, { productId: product.id, productName: product.name, category: product.category, size: "", quantity: 1, unitPrice: price }] })
      }
      return
    }
    setOpenProductId((prev) => prev === product.id ? null : product.id)
  }

  function selectPackageComponentSize(product: Product, componentLabel: string, size: string) {
    const current = packageSizes[product.id] ?? {}
    const isDeselect = current[componentLabel] === size
    const updated = isDeselect
      ? Object.fromEntries(Object.entries(current).filter(([k]) => k !== componentLabel))
      : { ...current, [componentLabel]: size }
    setPackageSizes((p) => ({ ...p, [product.id]: updated }))
    const components = PACKAGE_COMPONENTS[product.slug] ?? []
    const required = components.filter((c) => !c.optional)
    const allRequired = required.every((c) => updated[c.label])
    const price = getBestPrice(product.pricingTiers, state.rentalDays)
    const existing = state.items.find((i) => i.productId === product.id)
    if (allRequired) {
      const sizeStr = formatPackageSize(updated)
      if (existing) onUpdate({ items: state.items.map((i) => i.productId === product.id ? { ...i, size: sizeStr } : i) })
      else onUpdate({ items: [...state.items, { productId: product.id, productName: product.name, category: product.category, size: sizeStr, quantity: 1, unitPrice: price }] })
    } else if (existing) {
      onUpdate({ items: state.items.filter((i) => i.productId !== product.id) })
    }
  }

  function packageComplete(product: Product): boolean {
    const required = (PACKAGE_COMPONENTS[product.slug] ?? []).filter((c) => !c.optional)
    const current = packageSizes[product.id] ?? {}
    return required.every((c) => current[c.label])
  }

  function packageHasInventory(slug: string): boolean {
    const components = PACKAGE_COMPONENTS[slug]
    if (!components) return false
    return components.filter((c) => !c.optional).every((comp) => comp.productSlugs.some((s) => (productsBySlug[s]?.available ?? 0) > 0))
  }

  const subtotal = state.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const itemCount = state.items.length
  const canProceed = itemCount > 0 && state.items.every((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) return true
    if (PACKAGE_COMPONENTS[product.slug]) return packageComplete(product)
    return !product.hasSizes || item.size
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-2 border-[#C4A04A] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#B4B4B4]">Checking availability...</p>
      </div>
    )
  }

  const categoryProducts = activeCategory ? getProductsForCategory(activeCategory) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="w-5 h-px bg-[#C4A04A]" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C4A04A]">Step 2</span>
        </div>
        {activeCategory ? (
          <div className="flex items-start gap-3">
            <button
              onClick={() => { setActiveCategory(null); setOpenProductId(null) }}
              className="mt-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#B4B4B4] hover:text-white transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-display text-3xl font-bold text-white leading-tight">
                {CATEGORIES.find((c) => c.slug === activeCategory)?.emoji}{" "}
                {CATEGORIES.find((c) => c.slug === activeCategory)?.label}
              </h1>
              <p className="text-[#B4B4B4] text-sm mt-1">
                Prices for your {state.rentalDays}-day rental. Tap a product to select your size.
              </p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold text-white leading-tight">Choose your<br />equipment</h1>
            <p className="text-[#B4B4B4] text-sm mt-2">Select a category to browse gear for your {state.rentalDays}-day rental.</p>
          </>
        )}
      </div>

      {/* ── Category grid ── */}
      {!activeCategory && (
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map(({ slug, label, emoji, desc }) => {
            const prods = getProductsForCategory(slug)
            if (prods.length === 0) return null
            const selected = selectedCountForCategory(slug)
            const from = lowestPrice(prods)
            return (
              <button
                key={slug}
                onClick={() => setActiveCategory(slug)}
                className={`relative text-left bg-[#1e1e1e] border rounded-xl p-5 hover:border-[#C4A04A]/40 transition-all group ${
                  selected > 0 ? "border-[#C4A04A]/40" : "border-[#2e2e2e]"
                }`}
              >
                {selected > 0 && (
                  <span className="absolute top-3 right-3 bg-[#C4A04A] text-[#121212] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {selected}
                  </span>
                )}
                <span className="text-3xl block mb-3">{emoji}</span>
                <p className="font-bold text-white text-sm">{label}</p>
                <p className="text-[#B4B4B4] text-xs mt-0.5 leading-snug">{desc}</p>
                {from !== null && (
                  <p className="text-[#C4A04A] text-xs font-semibold mt-2">From ${from}</p>
                )}
                <div className="mt-3 flex items-center gap-1 text-[#555] group-hover:text-[#B4B4B4] transition-colors">
                  <span className="text-xs">{prods.length} option{prods.length !== 1 ? "s" : ""}</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Category product list ── */}
      {activeCategory && (
        <div className="space-y-4">

          {/* Quiz recommendation banner — packages only */}
          {activeCategory === "packages" && quizAnswers && (() => {
            const rec = getRecommendation(quizAnswers, products)
            if (!rec) return null
            const product = products.find((p) => p.slug === rec.slug)
            return (
              <div className="bg-[#C4A04A]/8 border border-[#C4A04A]/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">✦</span>
                  <p className="text-[10px] font-bold text-[#C4A04A] uppercase tracking-[0.2em]">Based on your answers</p>
                </div>
                <p className="text-sm font-bold text-white">{rec.title}</p>
                <p className="text-xs text-[#B4B4B4] mt-1 leading-relaxed">{rec.desc}</p>
                {product && (
                  <button
                    onClick={() => {
                      setOpenProductId(product.id)
                      setTimeout(() => document.getElementById(`product-${product.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50)
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#C4A04A] hover:text-white transition-colors"
                  >
                    Jump to this package <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )
          })()}

          {/* Guidance panel — packages only */}
          {activeCategory === "packages" && (
            <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
              <button
                onClick={() => setGuideOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🤔</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Not sure which package?</p>
                    <p className="text-xs text-[#B4B4B4] mt-0.5">Answer 2 quick questions</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-[#B4B4B4] transition-transform flex-shrink-0 ${guideOpen ? "rotate-180" : ""}`} />
              </button>
              {guideOpen && (
                <div className="border-t border-[#2e2e2e] px-5 pb-5 pt-4 space-y-5">
                  <div>
                    <p className="text-xs font-bold text-[#B4B4B4] uppercase tracking-[0.2em] mb-3">What do you want to ride?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([["ski", "🎿", "Skiing"], ["snowboard", "🏂", "Snowboarding"]] as const).map(([val, emoji, label]) => (
                        <button key={val} onClick={() => setGuideActivity(guideActivity === val ? null : val)}
                          className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm font-semibold transition-colors ${guideActivity === val ? "bg-[#C4A04A]/10 border-[#C4A04A] text-[#C4A04A]" : "bg-[#121212] border-[#333] text-[#B4B4B4] hover:border-[#555]"}`}>
                          <span>{emoji}</span>{label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#B4B4B4] uppercase tracking-[0.2em] mb-3">How experienced are you?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([["first", "First timer"], ["some", "Some experience"], ["regular", "Confident"]] as const).map(([val, label]) => (
                        <button key={val} onClick={() => setGuideLevel(guideLevel === val ? null : val)}
                          className={`px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${guideLevel === val ? "bg-[#C4A04A]/10 border-[#C4A04A] text-[#C4A04A]" : "bg-[#121212] border-[#333] text-[#B4B4B4] hover:border-[#555]"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {guideActivity && guideLevel && (() => {
                    const pkgSlug = guideActivity === "ski"
                      ? (guideLevel === "regular" ? "adult-skis" : "mens-ski-package")
                      : (guideLevel === "regular" ? "mens-burton-stepon-package" : "mens-snowboard-package")
                    const pkg = guideActivity === "ski"
                      ? { name: guideLevel === "regular" ? "Skis only" : "Ski Package", desc: guideLevel === "first" ? "Skis, boots & poles — everything fitted in store." : guideLevel === "some" ? "Full setup. Staff will dial in the right fit." : "Skis included. Add boots and poles separately." }
                      : { name: guideLevel === "regular" ? "Burton Step-On Package" : "Snowboard Package", desc: guideLevel === "first" ? "Board & boots — easiest way to get started." : guideLevel === "some" ? "Board and boots. Great all-mountain setup." : "Our premium Step-On system — fastest in/out on the hill." }
                    const product = products.find((p) => p.slug === pkgSlug) ?? products.find((p) => p.slug.includes(guideActivity))
                    return (
                      <div className="bg-[#C4A04A]/5 border border-[#C4A04A]/20 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-[#C4A04A] uppercase tracking-[0.2em] mb-2">We recommend</p>
                        <p className="text-sm font-bold text-white">{pkg.name}</p>
                        <p className="text-xs text-[#B4B4B4] mt-1 leading-relaxed">{pkg.desc}</p>
                        {product && (
                          <button onClick={() => { setGuideOpen(false); setOpenProductId(product.id); setTimeout(() => document.getElementById(`product-${product.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50) }}
                            className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#C4A04A] hover:text-white transition-colors">
                            Select this <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Product list */}
          <div className="space-y-2">
            {categoryProducts.map((product) => {
              const price = getBestPrice(product.pricingTiers, state.rentalDays)
              const activeTier = getActiveTier(product.pricingTiers, state.rentalDays)
              const selected = getSelectedItem(product.id)
              const isOpen = openProductId === product.id
              const isPkg = !!PACKAGE_COMPONENTS[product.slug]
              const outOfStock = isPkg ? !packageHasInventory(product.slug) : product.available === 0

              return (
                <div key={product.id} id={`product-${product.id}`}
                  className={`bg-[#1e1e1e] border rounded-xl transition-all duration-200 overflow-hidden ${selected ? "border-[#C4A04A]/50" : outOfStock ? "border-[#2e2e2e] opacity-40" : "border-[#2e2e2e] hover:border-[#444]"}`}
                >
                  <button onClick={() => !outOfStock && toggleProduct(product)} disabled={outOfStock}
                    className="w-full flex items-center justify-between p-4 gap-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white text-sm">{product.name}</p>
                        {product.isPackage && (
                          <span className="text-[9px] bg-[#C4A04A]/10 text-[#C4A04A] font-bold px-2 py-0.5 rounded border border-[#C4A04A]/20 tracking-wider uppercase">Package</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <p className="text-[#C4A04A] font-bold text-sm">
                          ${price.toFixed(2)}
                          {activeTier && <span className="text-[#B4B4B4] font-normal text-xs"> / {activeTier.label.toLowerCase()}</span>}
                        </p>
                        {selected?.size && !isPkg && (
                          <span className="text-xs bg-[#C4A04A]/10 text-[#C4A04A] border border-[#C4A04A]/20 px-2 py-0.5 rounded-full">{selected.size}</span>
                        )}
                      </div>
                      {product.pricingTiers.length > 0 && (
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {[...product.pricingTiers].sort((a, b) => a.days - b.days).map((tier) => {
                            const isActive = activeTier?.id === tier.id
                            return (
                              <span key={tier.id} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isActive ? "bg-[#C4A04A]/15 text-[#C4A04A] border border-[#C4A04A]/30" : "bg-white/[0.04] text-[#555] border border-transparent"}`}>
                                {tier.label} ${tier.price}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    {outOfStock ? (
                      <span className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg flex-shrink-0">Unavailable</span>
                    ) : selected && (!isPkg || packageComplete(product)) ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-[#C4A04A] font-semibold bg-[#C4A04A]/10 border border-[#C4A04A]/20 px-3 py-1.5 rounded-lg">✓ Added</span>
                        {(product.hasSizes || isPkg) && <ChevronDown className={`h-4 w-4 text-[#B4B4B4] transition-transform ${isOpen ? "rotate-180" : ""}`} />}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-[#B4B4B4] bg-white/5 border border-[#2e2e2e] px-3 py-1.5 rounded-lg">{isPkg ? "Select sizes" : product.hasSizes ? "Select size" : "Add"}</span>
                        {(product.hasSizes || isPkg) && <ChevronDown className={`h-4 w-4 text-[#B4B4B4] transition-transform ${isOpen ? "rotate-180" : ""}`} />}
                      </div>
                    )}
                  </button>

                  {/* Package multi-component picker */}
                  {isOpen && isPkg && (() => {
                    const components = PACKAGE_COMPONENTS[product.slug] ?? []
                    const required = components.filter((c) => !c.optional)
                    const optional = components.filter((c) => c.optional)
                    const current = packageSizes[product.id] ?? {}
                    return (
                      <div className="border-t border-[#2a2a2a] px-4 pb-4 pt-4 space-y-5">
                        {required.map((comp) => (
                          <SizeField key={comp.label} label={comp.label}
                            sizes={mergeComponentSizes(comp.productSlugs, productsBySlug)}
                            selected={current[comp.label]}
                            onSelect={(size) => selectPackageComponentSize(product, comp.label, size)} />
                        ))}
                        {optional.length > 0 && (
                          <div className="border-t border-[#252525] pt-4 space-y-5">
                            <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest">Optional add-ons</p>
                            {optional.map((comp) => (
                              <SizeField key={comp.label} label={comp.label}
                                sizes={mergeComponentSizes(comp.productSlugs, productsBySlug)}
                                selected={current[comp.label]}
                                onSelect={(size) => selectPackageComponentSize(product, comp.label, size)} />
                            ))}
                          </div>
                        )}
                        {packageComplete(product) && (
                          <div className="bg-[#C4A04A]/5 border border-[#C4A04A]/20 rounded-lg px-3 py-2.5 text-xs text-[#C4A04A]">{formatPackageSize(current)}</div>
                        )}
                        {selected && <button onClick={() => removeProduct(product.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove from cart</button>}
                      </div>
                    )
                  })()}

                  {/* Individual size picker */}
                  {isOpen && !isPkg && product.hasSizes && (
                    <div className="border-t border-[#2a2a2a] px-4 pb-4 pt-3">
                      <SizeTiles label="Select your size" sizes={product.sizes} selected={selected?.size} onSelect={(size) => selectSize(product, size)} />
                      {selected && <button onClick={() => removeProduct(product.id)} className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors">Remove from cart</button>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add more button */}
          <button
            onClick={() => { setActiveCategory(null); setOpenProductId(null) }}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-[#333] rounded-xl py-4 text-sm text-[#555] hover:border-[#555] hover:text-[#B4B4B4] transition-colors"
          >
            + Add gear from another category
          </button>
        </div>
      )}

      {/* Sticky cart bar */}
      <div className={`sticky bottom-4 transition-all duration-300 ${subtotal > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <div className="bg-[#1a1a1a] border border-[#C4A04A]/30 rounded-xl p-4 flex items-center justify-between shadow-xl shadow-black/40">
          <div>
            <p className="text-[#B4B4B4] text-xs">{itemCount} item{itemCount !== 1 ? "s" : ""} selected</p>
            <p className="text-white font-bold text-lg">${subtotal.toFixed(2)}</p>
          </div>
          <button onClick={onNext} disabled={!canProceed}
            className={`flex items-center gap-2 font-bold px-5 py-3 rounded-lg transition-colors text-sm tracking-widest uppercase ${canProceed ? "bg-[#C4A04A] hover:bg-[#b3e600] text-[#121212]" : "bg-white/10 text-[#555] cursor-not-allowed"}`}>
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {!canProceed && itemCount > 0 && (
          <p className="text-center text-xs text-[#B4B4B4] mt-2">Please complete all required size selections</p>
        )}
      </div>

      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#B4B4B4] hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to dates
      </button>
    </div>
  )
}

// ── Size tile grid ─────────────────────────────────────────────────────────────
function SizeTiles({ label, sizes, selected, onSelect }: {
  label: string; sizes: SizeOption[]; selected?: string; onSelect: (size: string) => void
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#B4B4B4] uppercase tracking-wider mb-2.5">{label}</p>
      {sizes.length === 0 ? (
        <p className="text-xs text-[#555]">No sizes available</p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {sizes.map((sz) => {
            const isSelected = selected === sz.size
            const unavailable = sz.available === 0
            return (
              <button key={sz.size} onClick={() => !unavailable && onSelect(sz.size)} disabled={unavailable}
                className={`flex flex-col items-center justify-center px-2 py-2.5 rounded-xl border transition-all ${isSelected ? "bg-[#C4A04A] text-[#121212] border-[#C4A04A]" : unavailable ? "bg-white/[0.02] text-[#3a3a3a] border-[#222] cursor-not-allowed" : "bg-[#252525] text-white border-[#2e2e2e] hover:border-[#C4A04A]/50 hover:text-[#C4A04A]"}`}
              >
                <span className="text-sm font-bold leading-tight">{sz.size}</span>
                <span className={`text-[10px] mt-0.5 font-medium ${isSelected ? "text-[#121212]/60" : unavailable ? "text-[#3a3a3a]" : "text-[#555]"}`}>
                  {sz.available}/{sz.total}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SizeField({ label, sizes, selected, onSelect }: {
  label: string; sizes: SizeOption[]; selected?: string; onSelect: (size: string) => void
}) {
  return <SizeTiles label={label} sizes={sizes} selected={selected} onSelect={onSelect} />
}
