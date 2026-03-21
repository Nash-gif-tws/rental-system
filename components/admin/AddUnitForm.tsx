"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const CONDITIONS = ["EXCELLENT", "GOOD", "FAIR", "NEEDS_SERVICE"] as const

export default function AddUnitForm({
  products,
  defaultProductId,
}: {
  products: { id: string; name: string; category: { name: string } }[]
  defaultProductId?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    productId: defaultProductId ?? products[0]?.id ?? "",
    serialNumber: "",
    size: "",
    condition: "GOOD",
    notes: "",
  })

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, serialNumber: form.serialNumber || undefined }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
      setLoading(false)
      return
    }
    router.push("/admin/inventory")
  }

  const inputClass =
    "w-full px-3 py-2.5 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C4A04A] transition-colors"
  const labelClass = "block text-xs font-medium text-[#B4B4B4] uppercase tracking-wider mb-1.5"

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1e1e1e] rounded-xl border border-[#2e2e2e] p-6 space-y-5"
    >
      <div>
        <label className={labelClass}>Product</label>
        <select
          className={inputClass}
          value={form.productId}
          onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
          required
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.category.name} — {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>
          Serial Number{" "}
          <span className="text-[#555] font-normal normal-case">(optional)</span>
        </label>
        <input
          className={inputClass}
          value={form.serialNumber}
          onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
          placeholder="e.g. 23267762"
        />
        <p className="text-xs text-[#555] mt-1">
          Used for barcode scanning. Leave blank to auto-assign an ID.
        </p>
      </div>

      <div>
        <label className={labelClass}>Size</label>
        <input
          className={inputClass}
          value={form.size}
          onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
          placeholder="e.g. 160cm · 27.5 · M · XL"
        />
      </div>

      <div>
        <label className={labelClass}>Condition</label>
        <select
          className={inputClass}
          value={form.condition}
          onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
        >
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>
          Notes <span className="text-[#555] font-normal normal-case">(optional)</span>
        </label>
        <input
          className={inputClass}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Any notes about this unit"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 border border-[#2e2e2e] rounded-lg text-sm font-medium text-[#B4B4B4] hover:bg-white/5 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#C4A04A] text-[#121212] px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#d4b565] disabled:opacity-50 transition-colors"
        >
          {loading ? "Adding..." : "Add Unit"}
        </button>
      </div>
    </form>
  )
}
