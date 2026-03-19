import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import InventorySearch from "./InventorySearch"

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; view?: string; status?: string }>
}) {
  const params = await searchParams
  const view = params.view ?? "summary"

  // Get units currently checked out (in use)
  const checkedOutUnitIds = await prisma.bookingItem.findMany({
    where: {
      unitId: { not: null },
      booking: { status: "CHECKED_OUT" },
    },
    select: { unitId: true },
  }).then((items) => new Set(items.map((i) => i.unitId!)))

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(params.category ? { categoryId: params.category } : {}),
        ...(params.q ? { name: { contains: params.q, mode: "insensitive" } } : {}),
      },
      include: {
        category: true,
        units: {
          orderBy: [{ size: "asc" }],
        },
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
  ])

  // Apply status filter after fetch
  const filteredProducts = products
    .map((p) => {
      let units = p.units
      if (params.status === "in-use") {
        units = units.filter((u) => checkedOutUnitIds.has(u.id))
      } else if (params.status === "available") {
        units = units.filter((u) => u.isActive && !checkedOutUnitIds.has(u.id))
      } else if (params.status === "inactive") {
        units = units.filter((u) => !u.isActive)
      }
      return { ...p, units }
    })
    .filter((p) => p.units.length > 0 || !params.status)

  const totalUnits = filteredProducts.reduce((s, p) => s + p.units.length, 0)
  const totalActive = filteredProducts.reduce(
    (s, p) => s + p.units.filter((u) => u.isActive).length,
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">
            Inventory
          </h1>
          <p className="text-xs text-[#B4B4B4] mt-1">
            {totalUnits.toLocaleString()} units · {filteredProducts.length} products
            {totalActive !== totalUnits && (
              <> · <span className="text-[#C8FF00]">{totalActive} active</span></>
            )}
          </p>
        </div>
        <Link
          href="/admin/inventory/new"
          className="flex items-center gap-2 bg-[#C8FF00] text-[#121212] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b3e600] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Unit
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 space-y-3">
        <InventorySearch defaultValue={params.q} />

        <div className="flex gap-2 flex-wrap">
          <Link
            href={buildUrl(params, { category: undefined })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-colors ${
              !params.category
                ? "bg-[#C8FF00] text-[#121212]"
                : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
            }`}
          >
            All Categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={buildUrl(params, { category: c.id })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-colors ${
                params.category === c.id
                  ? "bg-[#C8FF00] text-[#121212]"
                  : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "available", label: "Available" },
              { key: "in-use", label: "In Use" },
              { key: "inactive", label: "Inactive" },
            ].map(({ key, label }) => (
              <Link
                key={key}
                href={buildUrl(params, { status: params.status === key ? undefined : key })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-colors ${
                  params.status === key
                    ? "bg-[#C8FF00] text-[#121212]"
                    : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="flex gap-1 bg-[#121212] rounded-lg p-1">
            <Link
              href={buildUrl(params, { view: "summary" })}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                view === "summary" ? "bg-[#2e2e2e] text-white" : "text-[#B4B4B4] hover:text-white"
              }`}
            >
              Summary
            </Link>
            <Link
              href={buildUrl(params, { view: "detail" })}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                view === "detail" ? "bg-[#2e2e2e] text-white" : "text-[#B4B4B4] hover:text-white"
              }`}
            >
              Detail
            </Link>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-12 text-center text-[#B4B4B4]">
            {params.q ? `No products matching "${params.q}"` : "No inventory items found."}
          </div>
        ) : view === "summary" ? (
          filteredProducts.map((product) => {
            const bySize = product.units.reduce(
              (acc, u) => {
                const sz = u.size ?? "—"
                if (!acc[sz]) acc[sz] = { total: 0, active: 0, inUse: 0 }
                acc[sz].total++
                if (u.isActive) acc[sz].active++
                if (checkedOutUnitIds.has(u.id)) acc[sz].inUse++
                return acc
              },
              {} as Record<string, { total: number; active: number; inUse: number }>
            )

            const sizeEntries = Object.entries(bySize).sort(([a], [b]) => sortSize(a, b))
            const totalAvailable = product.units.filter(
              (u) => u.isActive && !checkedOutUnitIds.has(u.id)
            ).length
            const totalInUse = product.units.filter((u) => checkedOutUnitIds.has(u.id)).length

            return (
              <div
                key={product.id}
                className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden"
              >
                <div className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-white text-sm">{product.name}</h3>
                      <span className="text-[10px] text-[#B4B4B4] bg-white/5 px-2 py-0.5 rounded">
                        {product.category.name}
                      </span>
                      {totalInUse > 0 && (
                        <span className="text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
                          {totalInUse} in use
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#B4B4B4] mt-1">
                      {totalAvailable} available · {product.units.length} total
                    </p>
                    {sizeEntries.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {sizeEntries.map(([size, counts]) => (
                          <span
                            key={size}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border ${
                              counts.active === 0
                                ? "bg-white/[0.03] border-[#2a2a2a] text-[#555]"
                                : counts.inUse > 0
                                  ? "bg-orange-500/5 border-orange-500/20 text-orange-300"
                                  : "bg-white/5 border-[#2e2e2e] text-[#E6E6E6]"
                            }`}
                          >
                            <span className="font-medium">{size}</span>
                            <span className="text-[#777]">
                              {counts.active - counts.inUse}/{counts.total}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <Link
                      href={buildUrl(params, { view: "detail", q: product.name })}
                      className="text-xs text-[#B4B4B4] hover:text-white transition-colors"
                    >
                      Units
                    </Link>
                    <Link
                      href={`/admin/inventory/new?productId=${product.id}`}
                      className="text-xs text-[#C8FF00] hover:text-[#b3e600] transition-colors"
                    >
                      + Add
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[#2e2e2e] flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="text-xs text-[#B4B4B4] mt-0.5">
                    {product.category.name} · {product.units.length} units
                  </p>
                </div>
                <Link
                  href={`/admin/inventory/new?productId=${product.id}`}
                  className="text-xs text-[#C8FF00] hover:text-[#b3e600] transition-colors"
                >
                  + Add Unit
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#2e2e2e]">
                    <tr>
                      <th className="text-left px-6 py-2 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">
                        SKU
                      </th>
                      <th className="text-left px-6 py-2 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">
                        Size
                      </th>
                      <th className="text-left px-6 py-2 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">
                        Status
                      </th>
                      <th className="text-left px-6 py-2 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">
                        Notes
                      </th>
                      <th />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252525]">
                    {product.units.map((unit) => {
                      const inUse = checkedOutUnitIds.has(unit.id)
                      const status = !unit.isActive
                        ? { label: "Inactive", className: "text-[#555]" }
                        : inUse
                          ? { label: "In Use", className: "text-orange-400" }
                          : { label: "Available", className: "text-[#C8FF00]" }

                      return (
                        <tr key={unit.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3 font-mono text-xs text-[#E6E6E6]">
                            {unit.serialNumber ?? unit.id.slice(-8).toUpperCase()}
                          </td>
                          <td className="px-6 py-3 text-[#E6E6E6]">{unit.size ?? "—"}</td>
                          <td className="px-6 py-3">
                            <span className={`text-xs font-semibold ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-[#B4B4B4] text-xs">
                            {unit.notes ?? "—"}
                          </td>
                          <td className="px-6 py-3">
                            <Link
                              href={`/admin/inventory/${unit.id}`}
                              className="text-[#C8FF00] hover:text-[#b3e600] text-xs transition-colors"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function buildUrl(
  current: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
): string {
  const merged = { ...current, ...overrides }
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined) p.set(k, v)
  }
  const qs = p.toString()
  return `/admin/inventory${qs ? `?${qs}` : ""}`
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
