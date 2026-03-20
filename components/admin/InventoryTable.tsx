"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"

type Unit = {
  id: string
  serialNumber: string | null
  size: string | null
  isActive: boolean
  product: {
    name: string
    images: string[]
    category: { name: string; slug: string }
  }
}

const CATEGORY_ICON: Record<string, string> = {
  skis: "🎿", snowboards: "🏂", boots: "🥾", clothing: "🧥", accessories: "🪖",
}

const CONDITIONS = ["EXCELLENT", "GOOD", "FAIR", "NEEDS_SERVICE", "RETIRED"] as const

function deriveSkuLabel(productName: string, size: string | null): string {
  const base = productName.replace(/\s+/g, "-").toUpperCase().replace(/[^A-Z0-9-]/g, "")
  return size ? `${base}-${size.replace(/\s+/g, "").toUpperCase()}` : base
}

export default function InventoryTable({
  units,
  checkedOutUnitIds,
}: {
  units: Unit[]
  checkedOutUnitIds: Set<string>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showConditionMenu, setShowConditionMenu] = useState(false)

  const allSelected = units.length > 0 && selected.size === units.length
  const someSelected = selected.size > 0 && !allSelected

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(units.map((u) => u.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function bulkUpdate(updates: { isActive?: boolean; condition?: string }) {
    setBulkLoading(true)
    await fetch("/api/units/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), updates }),
    })
    setSelected(new Set())
    setBulkLoading(false)
    setShowConditionMenu(false)
    startTransition(() => router.refresh())
  }

  return (
    <div className="relative">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky top-4 z-10 mb-3 flex items-center gap-3 bg-[#1a1a1a] border border-[#C8FF00]/30 rounded-xl px-4 py-3 shadow-xl shadow-black/40">
          <span className="text-sm font-semibold text-white">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => bulkUpdate({ isActive: true })}
              disabled={bulkLoading}
              className="px-3 py-1.5 text-xs font-bold bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/20 rounded-lg hover:bg-[#C8FF00]/20 transition-colors disabled:opacity-50"
            >
              Activate
            </button>
            <button
              onClick={() => bulkUpdate({ isActive: false })}
              disabled={bulkLoading}
              className="px-3 py-1.5 text-xs font-bold bg-white/5 text-[#B4B4B4] border border-[#2e2e2e] rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Deactivate
            </button>
            <div className="relative">
              <button
                onClick={() => setShowConditionMenu((v) => !v)}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white/5 text-[#B4B4B4] border border-[#2e2e2e] rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Set Condition <ChevronDown className="h-3 w-3" />
              </button>
              {showConditionMenu && (
                <div className="absolute left-0 top-full mt-1 bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl shadow-xl py-1 w-44 z-20">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => bulkUpdate({ condition: c })}
                      className="w-full text-left px-4 py-2 text-xs text-[#B4B4B4] hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {c.replace("_", " ")}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => bulkUpdate({ isActive: false, condition: "RETIRED" })}
              disabled={bulkLoading}
              className="px-3 py-1.5 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              Retire
            </button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-[#555] hover:text-[#B4B4B4] transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[#2e2e2e]">
            <tr>
              <th className="px-4 py-3 w-10">
                <button
                  onClick={toggleAll}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    allSelected
                      ? "bg-[#C8FF00] border-[#C8FF00]"
                      : someSelected
                        ? "bg-[#C8FF00]/40 border-[#C8FF00]/40"
                        : "border-[#444] hover:border-[#C8FF00]/50"
                  }`}
                >
                  {(allSelected || someSelected) && (
                    <span className="text-[#121212] text-[8px] font-black leading-none">
                      {allSelected ? "✓" : "–"}
                    </span>
                  )}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest w-12" />
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest">Product</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest">SKU</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest">Qty</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest">Status</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {units.map((unit) => {
              const inUse = checkedOutUnitIds.has(unit.id)
              const categorySlug = unit.product.category.slug
              const sku = deriveSkuLabel(unit.product.name, unit.size)
              const isSelected = selected.has(unit.id)

              const status = !unit.isActive
                ? { label: "Inactive", dot: "bg-[#444]", text: "text-[#666]" }
                : inUse
                  ? { label: "In Use", dot: "bg-orange-400", text: "text-orange-400" }
                  : { label: "Active", dot: "bg-[#C8FF00]", text: "text-[#C8FF00]" }

              return (
                <tr
                  key={unit.id}
                  className={`hover:bg-white/[0.025] transition-colors group ${isSelected ? "bg-[#C8FF00]/[0.03]" : ""}`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleOne(unit.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? "bg-[#C8FF00] border-[#C8FF00]" : "border-[#444] hover:border-[#C8FF00]/50"
                      }`}
                    >
                      {isSelected && <span className="text-[#121212] text-[8px] font-black leading-none">✓</span>}
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-[#252525] border border-[#2e2e2e] flex items-center justify-center text-xl">
                      {unit.product.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={unit.product.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        CATEGORY_ICON[categorySlug] ?? "📦"
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-white leading-tight">
                      {unit.product.name}
                      {unit.size && <span className="ml-2 text-[11px] text-[#B4B4B4] font-normal">{unit.size}</span>}
                    </p>
                    <p className="text-[11px] text-[#555] mt-0.5">{unit.product.category.name}</p>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-[#777]">
                    {unit.serialNumber ?? unit.id.slice(-8).toUpperCase()}
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-[#B4B4B4]">{sku}</td>

                  <td className="px-4 py-3 text-sm text-[#E6E6E6]">1</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
                      <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/inventory/${unit.id}`}
                      className="text-xs text-[#555] group-hover:text-[#C8FF00] transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="px-4 py-3 border-t border-[#2e2e2e] text-xs text-[#555]">
          {units.length.toLocaleString()} unit{units.length !== 1 ? "s" : ""}
          {selected.size > 0 && <span className="ml-2 text-[#C8FF00]">· {selected.size} selected</span>}
        </div>
      </div>
    </div>
  )
}
