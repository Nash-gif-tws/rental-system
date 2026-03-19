"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const CONDITIONS = ["EXCELLENT", "GOOD", "FAIR", "NEEDS_SERVICE", "RETIRED"] as const

export default function EditUnitForm({ unit }: {
  unit: {
    id: string
    serialNumber: string | null
    size: string | null
    condition: string
    notes: string | null
    isActive: boolean
    product: { name: string }
  }
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    serialNumber: unit.serialNumber ?? "",
    size: unit.size ?? "",
    condition: unit.condition,
    notes: unit.notes ?? "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch(`/api/units/${unit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, serialNumber: form.serialNumber || undefined }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setLoading(false)
  }

  async function handleRetire() {
    if (!confirm("Retire this unit? It will be hidden from inventory.")) return
    await fetch(`/api/units/${unit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    })
    router.push("/admin/inventory")
  }

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <label className={labelClass}>Serial Number <span className="text-gray-400 font-normal">(optional)</span></label>
        <input className={inputClass} value={form.serialNumber} onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
          placeholder="e.g. SKI-2024-001" />
      </div>

      <div>
        <label className={labelClass}>Size</label>
        <input className={inputClass} value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
          placeholder="e.g. 160cm, 42 EU, M" />
      </div>

      <div>
        <label className={labelClass}>Condition</label>
        <select className={inputClass} value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <input className={inputClass} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Any notes about this unit" />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors">
          {loading ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
        </button>
        <button type="button" onClick={handleRetire}
          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
          Retire Unit
        </button>
      </div>
    </form>
  )
}
