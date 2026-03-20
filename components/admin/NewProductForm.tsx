"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Category } from "@prisma/client"

export default function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: categories[0]?.id ?? "",
    isPackage: false,
    isActive: true,
  })

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
      setLoading(false)
      return
    }
    const product = await res.json()
    router.push(`/admin/products/${product.id}/edit`)
  }

  const inputCls = "w-full px-3 py-2 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C8FF00] transition-colors"
  const labelCls = "block text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-[0.2em] mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-5">
      <div>
        <label className={labelCls}>Name</label>
        <input
          className={inputCls}
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Adult Ski Package"
          required
        />
      </div>

      <div>
        <label className={labelCls}>Slug</label>
        <input
          className={inputCls}
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          placeholder="auto-generated from name"
          required
        />
        <p className="text-xs text-[#555] mt-1">URL-safe identifier. Auto-filled from name.</p>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className={inputCls + " resize-none"}
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Optional description shown to customers"
        />
      </div>

      <div>
        <label className={labelCls}>Category</label>
        <select
          className={inputCls + " bg-[#121212]"}
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          required
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => setForm((f) => ({ ...f, isPackage: !f.isPackage }))}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${form.isPackage ? "bg-[#C8FF00]" : "bg-[#333]"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#121212] transition-transform ${form.isPackage ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-[#B4B4B4]">This is a package</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${form.isActive ? "bg-[#C8FF00]" : "bg-[#333]"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#121212] transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-[#B4B4B4]">Active (visible to customers)</span>
        </label>
      </div>

      {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex gap-3 pt-2 border-t border-[#2e2e2e]">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 border border-[#2e2e2e] rounded-lg text-sm font-medium text-[#B4B4B4] hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#C8FF00] text-[#121212] px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#b3e600] disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating..." : "Create Product →"}
        </button>
      </div>
    </form>
  )
}
