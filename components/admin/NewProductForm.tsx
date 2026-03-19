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

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <label className={labelClass}>Name</label>
        <input
          className={inputClass}
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Adult Ski Package"
          required
        />
      </div>

      <div>
        <label className={labelClass}>Slug</label>
        <input
          className={inputClass}
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          placeholder="auto-generated from name"
          required
        />
        <p className="text-xs text-gray-400 mt-1">URL-safe identifier. Auto-filled from name.</p>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          className={inputClass}
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Optional description shown to customers"
        />
      </div>

      <div>
        <label className={labelClass}>Category</label>
        <select
          className={inputClass}
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
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPackage}
            onChange={(e) => setForm((f) => ({ ...f, isPackage: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-400"
          />
          <span className="text-sm font-medium text-gray-700">This is a package</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-400"
          />
          <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
        </label>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating..." : "Create Product →"}
        </button>
      </div>
    </form>
  )
}
