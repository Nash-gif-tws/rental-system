"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Package, DollarSign, Layers, ChevronRight } from "lucide-react"
import type { Category, PricingTier, EquipmentUnit } from "@prisma/client"

type ProductWithRelations = {
  id: string
  name: string
  slug: string
  description: string | null
  categoryId: string
  isPackage: boolean
  isActive: boolean
  pricingTiers: PricingTier[]
  units: EquipmentUnit[]
  packageItems: { id: string; productId: string; product: { id: string; name: string; category: { name: string } } }[]
}

const CONDITIONS = ["EXCELLENT", "GOOD", "FAIR", "NEEDS_SERVICE", "RETIRED"] as const
const CONDITION_STYLE: Record<string, string> = {
  EXCELLENT: "bg-[#C4A04A]/15 text-[#C4A04A] border-[#C4A04A]/30",
  GOOD: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  FAIR: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  NEEDS_SERVICE: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  RETIRED: "bg-white/5 text-[#555] border-white/10",
}

const inputCls = "w-full px-3 py-2 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C4A04A] transition-colors"
const labelCls = "block text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-[0.2em] mb-1.5"

function Card({ title, icon: Icon, children, action }: { title: string; icon: any; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#2e2e2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#B4B4B4]" />
          <h3 className="font-semibold text-white text-sm">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function EditProductClient({
  product: initial,
  categories,
  allProducts,
}: {
  product: ProductWithRelations
  categories: Category[]
  allProducts: { id: string; name: string; category: { name: string } }[]
}) {
  const router = useRouter()
  const [product, setProduct] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")

  const [newTier, setNewTier] = useState({ label: "", days: "", price: "" })
  const [addingTier, setAddingTier] = useState(false)

  const [newUnit, setNewUnit] = useState({ serialNumber: "", size: "", condition: "GOOD", notes: "" })
  const [addingUnit, setAddingUnit] = useState(false)

  async function saveDetails() {
    setSaving(true)
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        isPackage: product.isPackage,
        isActive: product.isActive,
      }),
    })
    if (res.ok) {
      setSaveMsg("Saved")
      router.refresh()
      setTimeout(() => setSaveMsg(""), 2000)
    }
    setSaving(false)
  }

  async function addPricingTier() {
    if (!newTier.label || !newTier.days || !newTier.price) return
    setAddingTier(true)
    const res = await fetch(`/api/products/${product.id}/pricing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newTier.label, days: parseInt(newTier.days), price: parseFloat(newTier.price) }),
    })
    if (res.ok) {
      const tier = await res.json()
      setProduct((p) => ({ ...p, pricingTiers: [...p.pricingTiers, tier].sort((a, b) => a.days - b.days) }))
      setNewTier({ label: "", days: "", price: "" })
    }
    setAddingTier(false)
  }

  async function deleteTier(tierId: string) {
    await fetch(`/api/pricing/${tierId}`, { method: "DELETE" })
    setProduct((p) => ({ ...p, pricingTiers: p.pricingTiers.filter((t) => t.id !== tierId) }))
  }

  async function addUnit() {
    if (!newUnit.size && !newUnit.serialNumber) return
    setAddingUnit(true)
    const res = await fetch("/api/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newUnit, productId: product.id, serialNumber: newUnit.serialNumber || undefined }),
    })
    if (res.ok) {
      const unit = await res.json()
      setProduct((p) => ({ ...p, units: [...p.units, unit] }))
      setNewUnit({ serialNumber: "", size: "", condition: "GOOD", notes: "" })
    }
    setAddingUnit(false)
  }

  async function updateUnit(unitId: string, data: Record<string, unknown>) {
    await fetch(`/api/units/${unitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setProduct((p) => ({
      ...p,
      units: p.units.map((u) => (u.id === unitId ? { ...u, ...data } : u)),
    }))
  }

  async function savePackageItems(selectedIds: string[]) {
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageItemIds: selectedIds }),
    })
    if (res.ok) {
      const updated = await res.json()
      setProduct((p) => ({ ...p, packageItems: updated.packageItems }))
    }
  }

  const activeUnits = product.units.filter((u) => u.isActive)
  const inactiveUnits = product.units.filter((u) => !u.isActive)

  return (
    <div className="space-y-5">

      {/* Details */}
      <Card title="Product Details" icon={Package}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Name</label>
            <input className={inputCls} value={product.name} onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Description</label>
            <textarea className={inputCls + " resize-none"} rows={2} value={product.description ?? ""} onChange={(e) => setProduct((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select className={inputCls + " bg-[#121212]"} value={product.categoryId} onChange={(e) => setProduct((p) => ({ ...p, categoryId: e.target.value }))}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-5 pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setProduct((p) => ({ ...p, isActive: !p.isActive }))}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${product.isActive ? "bg-[#C4A04A]" : "bg-[#333]"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#121212] transition-transform ${product.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-[#B4B4B4]">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setProduct((p) => ({ ...p, isPackage: !p.isPackage }))}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${product.isPackage ? "bg-[#C4A04A]" : "bg-[#333]"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#121212] transition-transform ${product.isPackage ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-[#B4B4B4]">Package</span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-[#2e2e2e]">
          <button
            onClick={saveDetails}
            disabled={saving}
            className="bg-[#C4A04A] text-[#121212] px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#d4b565] disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saveMsg && <span className="text-sm text-[#C4A04A] font-medium">✓ {saveMsg}</span>}
        </div>
      </Card>

      {/* Package Contents */}
      {product.isPackage && (
        <Card title="Package Contents" icon={Layers}>
          <p className="text-xs text-[#555] mb-4">Select which individual products are included in this package.</p>
          <div className="space-y-1.5">
            {allProducts.map((p) => {
              const selected = product.packageItems.some((pi) => pi.productId === p.id)
              return (
                <label key={p.id} className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-lg transition-colors border ${selected ? "border-[#C4A04A]/30 bg-[#C4A04A]/5" : "border-transparent hover:bg-white/[0.03]"}`}>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selected ? "bg-[#C4A04A] border-[#C4A04A]" : "border-[#444]"}`}
                    onClick={() => {
                      const ids = selected
                        ? product.packageItems.filter((pi) => pi.productId !== p.id).map((pi) => pi.productId)
                        : [...product.packageItems.map((pi) => pi.productId), p.id]
                      savePackageItems(ids)
                    }}
                  >
                    {selected && <span className="text-[#121212] text-[10px] font-bold">✓</span>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-[#555]">{p.category.name}</p>
                  </div>
                </label>
              )
            })}
          </div>
          {product.packageItems.length > 0 && (
            <div className="mt-4 bg-[#C4A04A]/5 border border-[#C4A04A]/20 rounded-lg px-3 py-2.5 text-xs text-[#C4A04A]">
              <span className="font-bold">Includes:</span> {product.packageItems.map((pi) => pi.product.name).join(", ")}
            </div>
          )}
        </Card>
      )}

      {/* Pricing Tiers */}
      <Card title="Pricing Tiers" icon={DollarSign}>
        {product.pricingTiers.length === 0 ? (
          <p className="text-sm text-red-400 mb-4">No pricing tiers — this product won&apos;t appear as bookable.</p>
        ) : (
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2e2e2e]">
                  <th className="text-left pb-2.5 text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-widest">Label</th>
                  <th className="text-left pb-2.5 text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-widest">Duration</th>
                  <th className="text-left pb-2.5 text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-widest">Price</th>
                  <th className="pb-2.5 text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-widest text-right">Per Day</th>
                  <th className="pb-2.5 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252525]">
                {product.pricingTiers.map((tier) => (
                  <tr key={tier.id}>
                    <td className="py-2.5 font-medium text-white">{tier.label}</td>
                    <td className="py-2.5 text-[#B4B4B4]">{tier.days} day{tier.days !== 1 ? "s" : ""}</td>
                    <td className="py-2.5 text-[#C4A04A] font-bold">${tier.price.toFixed(2)}</td>
                    <td className="py-2.5 text-[#555] text-xs text-right">${(tier.price / tier.days).toFixed(2)}/d</td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => deleteTier(tier.id)} className="p-1.5 rounded hover:bg-red-500/10 text-[#444] hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-[#2e2e2e] pt-4">
          <p className={labelCls}>Add Tier</p>
          <div className="flex gap-2 items-end flex-wrap">
            <div>
              <label className={labelCls}>Label</label>
              <input className={inputCls + " w-28"} placeholder="e.g. 1 Day" value={newTier.label} onChange={(e) => setNewTier((t) => ({ ...t, label: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Days</label>
              <input className={inputCls + " w-20"} type="number" min="1" placeholder="1" value={newTier.days} onChange={(e) => setNewTier((t) => ({ ...t, days: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Price ($)</label>
              <input className={inputCls + " w-24"} type="number" step="0.01" min="0" placeholder="0.00" value={newTier.price} onChange={(e) => setNewTier((t) => ({ ...t, price: e.target.value }))} />
            </div>
            <button
              onClick={addPricingTier}
              disabled={addingTier || !newTier.label || !newTier.days || !newTier.price}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#C4A04A] text-[#121212] rounded-lg text-sm font-bold hover:bg-[#d4b565] disabled:opacity-40 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      </Card>

      {/* Inventory Units */}
      <Card
        title={`Inventory Units (${activeUnits.length} active${inactiveUnits.length > 0 ? `, ${inactiveUnits.length} inactive` : ""})`}
        icon={Package}
      >
        {product.units.length === 0 ? (
          <p className="text-sm text-[#555] mb-4">No units yet. Add units below to track physical stock.</p>
        ) : (
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2e2e2e]">
                  <th className="text-left pb-2.5 text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-widest">ID</th>
                  <th className="text-left pb-2.5 text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-widest">Size</th>
                  <th className="text-left pb-2.5 text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-widest">Condition</th>
                  <th className="text-left pb-2.5 text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-widest">Status</th>
                  <th className="text-left pb-2.5 text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-widest">Notes</th>
                  <th className="pb-2.5 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252525]">
                {product.units.map((unit) => (
                  <tr key={unit.id} className={unit.isActive ? "" : "opacity-50"}>
                    <td className="py-2.5 font-mono text-xs text-[#777]">
                      {unit.serialNumber ?? unit.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-2.5 text-[#E6E6E6]">{unit.size ?? "—"}</td>
                    <td className="py-2.5">
                      <select
                        value={unit.condition}
                        onChange={(e) => updateUnit(unit.id, { condition: e.target.value })}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer focus:outline-none bg-transparent ${CONDITION_STYLE[unit.condition]}`}
                      >
                        {CONDITIONS.map((c) => <option key={c} value={c} className="bg-[#1e1e1e] text-white">{c.replace("_", " ")}</option>)}
                      </select>
                    </td>
                    <td className="py-2.5">
                      <button
                        onClick={() => updateUnit(unit.id, { isActive: !unit.isActive })}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                          unit.isActive
                            ? "bg-[#C4A04A]/10 text-[#C4A04A] border-[#C4A04A]/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                            : "bg-white/5 text-[#555] border-white/10 hover:bg-[#C4A04A]/10 hover:text-[#C4A04A] hover:border-[#C4A04A]/20"
                        }`}
                      >
                        {unit.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-2.5 text-[#555] text-xs max-w-[12rem] truncate">{unit.notes ?? "—"}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => updateUnit(unit.id, { isActive: false, condition: "RETIRED" })}
                        className="p-1.5 rounded hover:bg-red-500/10 text-[#333] hover:text-red-400 transition-colors"
                        title="Retire unit"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-[#2e2e2e] pt-4">
          <p className={labelCls}>Add Unit</p>
          <div className="flex gap-2 items-end flex-wrap">
            <div>
              <label className={labelCls}>Serial # (optional)</label>
              <input className={inputCls + " w-36"} placeholder="e.g. SKI-001" value={newUnit.serialNumber} onChange={(e) => setNewUnit((u) => ({ ...u, serialNumber: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Size</label>
              <input className={inputCls + " w-28"} placeholder="e.g. 160, 42" value={newUnit.size} onChange={(e) => setNewUnit((u) => ({ ...u, size: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Condition</label>
              <select className={inputCls + " w-36 bg-[#121212]"} value={newUnit.condition} onChange={(e) => setNewUnit((u) => ({ ...u, condition: e.target.value }))}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <input className={inputCls + " w-40"} placeholder="Optional" value={newUnit.notes} onChange={(e) => setNewUnit((u) => ({ ...u, notes: e.target.value }))} />
            </div>
            <button
              onClick={addUnit}
              disabled={addingUnit || (!newUnit.size && !newUnit.serialNumber)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#C4A04A] text-[#121212] rounded-lg text-sm font-bold hover:bg-[#d4b565] disabled:opacity-40 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Unit
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
