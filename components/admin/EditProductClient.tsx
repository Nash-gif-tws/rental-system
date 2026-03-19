"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Package, DollarSign, Layers, ToggleLeft, ToggleRight } from "lucide-react"
import type { Category, PricingTier, EquipmentUnit } from "@prisma/client"

type ProductWithRelations = {
  id: string
  name: string
  description: string | null
  categoryId: string
  isPackage: boolean
  isActive: boolean
  pricingTiers: PricingTier[]
  units: EquipmentUnit[]
  packageItems: { id: string; productId: string; product: { id: string; name: string; category: { name: string } } }[]
}

const CONDITIONS = ["EXCELLENT", "GOOD", "FAIR", "NEEDS_SERVICE", "RETIRED"] as const
const CONDITION_COLORS: Record<string, string> = {
  EXCELLENT: "bg-green-100 text-green-800",
  GOOD: "bg-blue-100 text-blue-800",
  FAIR: "bg-yellow-100 text-yellow-800",
  NEEDS_SERVICE: "bg-red-100 text-red-800",
  RETIRED: "bg-gray-100 text-gray-800",
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

  // Pricing tier form
  const [newTier, setNewTier] = useState({ label: "", days: "", price: "" })
  const [addingTier, setAddingTier] = useState(false)

  // Unit form
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

  async function updateUnitCondition(unitId: string, condition: string) {
    await fetch(`/api/units/${unitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ condition }),
    })
    setProduct((p) => ({
      ...p,
      units: p.units.map((u) => (u.id === unitId ? { ...u, condition: condition as any } : u)),
    }))
  }

  async function retireUnit(unitId: string) {
    await fetch(`/api/units/${unitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    })
    setProduct((p) => ({ ...p, units: p.units.filter((u) => u.id !== unitId) }))
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

  const inputClass = "px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
  const labelClass = "block text-xs font-medium text-gray-500 mb-1"

  const Card = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Details */}
      <Card title="Product Details" icon={Package}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Name</label>
            <input className={`${inputClass} w-full`} value={product.name} onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Description</label>
            <textarea className={`${inputClass} w-full`} rows={2} value={product.description ?? ""} onChange={(e) => setProduct((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select className={`${inputClass} w-full`} value={product.categoryId} onChange={(e) => setProduct((p) => ({ ...p, categoryId: e.target.value }))}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-4 pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={product.isPackage} onChange={(e) => setProduct((p) => ({ ...p, isPackage: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-sky-600" />
              <span className="text-sm text-gray-700">Is a package</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={product.isActive} onChange={(e) => setProduct((p) => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-sky-600" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <button onClick={saveDetails} disabled={saving} className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saveMsg && <span className="text-sm text-green-600 font-medium">✓ {saveMsg}</span>}
        </div>
      </Card>

      {/* Package Items */}
      {product.isPackage && (
        <Card title="Package Contents" icon={Layers}>
          <p className="text-xs text-gray-500 mb-3">Select which individual products are included in this package.</p>
          <div className="space-y-2 mb-4">
            {allProducts.map((p) => {
              const selected = product.packageItems.some((pi) => pi.productId === p.id)
              return (
                <label key={p.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                      const ids = e.target.checked
                        ? [...product.packageItems.map((pi) => pi.productId), p.id]
                        : product.packageItems.filter((pi) => pi.productId !== p.id).map((pi) => pi.productId)
                      savePackageItems(ids)
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-sky-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category.name}</p>
                  </div>
                </label>
              )
            })}
          </div>
          {product.packageItems.length > 0 && (
            <div className="bg-sky-50 rounded-lg p-3 text-xs text-sky-700">
              <strong>Selected:</strong> {product.packageItems.map((pi) => pi.product.name).join(", ")}
            </div>
          )}
        </Card>
      )}

      {/* Pricing Tiers */}
      <Card title="Pricing Tiers" icon={DollarSign}>
        {product.pricingTiers.length > 0 ? (
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="pb-2 font-medium">Label</th>
                <th className="pb-2 font-medium">Days</th>
                <th className="pb-2 font-medium">Price</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {product.pricingTiers.map((tier) => (
                <tr key={tier.id}>
                  <td className="py-2 font-medium text-gray-800">{tier.label}</td>
                  <td className="py-2 text-gray-500">{tier.days} day{tier.days !== 1 ? "s" : ""}</td>
                  <td className="py-2 text-gray-800">${tier.price.toFixed(2)}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => deleteTier(tier.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-red-500 mb-4">No pricing tiers — this product won't appear as bookable.</p>
        )}

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-3">Add Tier</p>
          <div className="flex gap-2 items-end flex-wrap">
            <div>
              <label className={labelClass}>Label</label>
              <input className={`${inputClass} w-28`} placeholder="e.g. 1 Day" value={newTier.label} onChange={(e) => setNewTier((t) => ({ ...t, label: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Days</label>
              <input className={`${inputClass} w-20`} type="number" min="1" placeholder="1" value={newTier.days} onChange={(e) => setNewTier((t) => ({ ...t, days: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Price ($)</label>
              <input className={`${inputClass} w-24`} type="number" step="0.01" min="0" placeholder="0.00" value={newTier.price} onChange={(e) => setNewTier((t) => ({ ...t, price: e.target.value }))} />
            </div>
            <button onClick={addPricingTier} disabled={addingTier || !newTier.label || !newTier.days || !newTier.price}
              className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors">
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </Card>

      {/* Inventory Units */}
      <Card title={`Inventory Units (${product.units.length})`} icon={Package}>
        {product.units.length > 0 ? (
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="pb-2 font-medium">Serial / ID</th>
                <th className="pb-2 font-medium">Size</th>
                <th className="pb-2 font-medium">Condition</th>
                <th className="pb-2 font-medium">Notes</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {product.units.map((unit) => (
                <tr key={unit.id}>
                  <td className="py-2 font-mono text-xs text-gray-500">{unit.serialNumber ?? unit.id.slice(-8).toUpperCase()}</td>
                  <td className="py-2 text-gray-700">{unit.size ?? "—"}</td>
                  <td className="py-2">
                    <select
                      value={unit.condition}
                      onChange={(e) => updateUnitCondition(unit.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-0.5 rounded border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 ${CONDITION_COLORS[unit.condition]}`}
                    >
                      {CONDITIONS.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                    </select>
                  </td>
                  <td className="py-2 text-gray-400 text-xs">{unit.notes ?? "—"}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => retireUnit(unit.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Retire unit">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400 mb-4">No units yet. Add units below to track physical stock.</p>
        )}

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-3">Add Unit</p>
          <div className="flex gap-2 items-end flex-wrap">
            <div>
              <label className={labelClass}>Serial # (optional)</label>
              <input className={`${inputClass} w-36`} placeholder="e.g. SKI-001" value={newUnit.serialNumber} onChange={(e) => setNewUnit((u) => ({ ...u, serialNumber: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Size</label>
              <input className={`${inputClass} w-28`} placeholder="e.g. 160cm, 42" value={newUnit.size} onChange={(e) => setNewUnit((u) => ({ ...u, size: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Condition</label>
              <select className={`${inputClass} w-36`} value={newUnit.condition} onChange={(e) => setNewUnit((u) => ({ ...u, condition: e.target.value }))}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Notes</label>
              <input className={`${inputClass} w-40`} placeholder="Optional" value={newUnit.notes} onChange={(e) => setNewUnit((u) => ({ ...u, notes: e.target.value }))} />
            </div>
            <button onClick={addUnit} disabled={addingUnit || (!newUnit.size && !newUnit.serialNumber)}
              className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors">
              <Plus className="h-4 w-4" />
              Add Unit
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
