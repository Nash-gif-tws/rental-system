import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import InventorySearch from "./InventorySearch"

// Category → emoji icon for thumbnail placeholder
const CATEGORY_ICON: Record<string, string> = {
  skis: "🎿",
  snowboards: "🏂",
  boots: "🥾",
  clothing: "🧥",
  accessories: "🪖",
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; status?: string }>
}) {
  const params = await searchParams

  // Units currently checked out
  const checkedOutUnitIds = await prisma.bookingItem
    .findMany({
      where: { unitId: { not: null }, booking: { status: "CHECKED_OUT" } },
      select: { unitId: true },
    })
    .then((items) => new Set(items.map((i) => i.unitId!)))

  const [categories, units] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.equipmentUnit.findMany({
      where: {
        ...(params.category ? { product: { categoryId: params.category } } : {}),
        ...(params.q
          ? {
              OR: [
                { product: { name: { contains: params.q, mode: "insensitive" } } },
                { serialNumber: { contains: params.q, mode: "insensitive" } },
                { size: { contains: params.q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { product: { include: { category: true } } },
      orderBy: [
        { product: { category: { name: "asc" } } },
        { product: { name: "asc" } },
        { size: "asc" },
      ],
    }),
  ])

  // Apply status filter
  const allUnits = units.filter((u) => {
    if (params.status === "in-use") return checkedOutUnitIds.has(u.id)
    if (params.status === "available") return u.isActive && !checkedOutUnitIds.has(u.id)
    if (params.status === "inactive") return !u.isActive
    return true
  })

  // Counts for status tabs
  const totalCount = units.length
  const availableCount = units.filter((u) => u.isActive && !checkedOutUnitIds.has(u.id)).length
  const inUseCount = units.filter((u) => checkedOutUnitIds.has(u.id)).length
  const inactiveCount = units.filter((u) => !u.isActive).length

  // Derive SKU from product slug + size
  function deriveSkuLabel(productName: string, size: string | null): string {
    const base = productName
      .replace(/\s+/g, "-")
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "")
    return size ? `${base}-${size.replace(/\s+/g, "").toUpperCase()}` : base
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">
          Inventory
        </h1>
        <Link
          href="/admin/inventory/new"
          className="flex items-center gap-2 bg-[#C8FF00] text-[#121212] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b3e600] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Unit
        </Link>
      </div>

      {/* Tabs + search */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
        {/* Status tabs */}
        <div className="flex border-b border-[#2e2e2e] overflow-x-auto">
          {[
            { key: undefined, label: "All", count: totalCount },
            { key: "available", label: "Active", count: availableCount },
            { key: "inactive", label: "Draft", count: inactiveCount },
            { key: "in-use", label: "In Use", count: inUseCount },
          ].map(({ key, label, count }) => (
            <Link
              key={label}
              href={buildUrl(params, { status: key })}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                params.status === key
                  ? "border-[#C8FF00] text-white"
                  : "border-transparent text-[#B4B4B4] hover:text-white"
              }`}
            >
              {label}
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded font-bold ${
                  params.status === key
                    ? "bg-[#C8FF00]/15 text-[#C8FF00]"
                    : "bg-white/5 text-[#555]"
                }`}
              >
                {count}
              </span>
            </Link>
          ))}
        </div>

        {/* Search + category filters */}
        <div className="p-3 flex flex-wrap items-center gap-2 border-b border-[#2e2e2e]">
          <div className="flex-1 min-w-48">
            <InventorySearch defaultValue={params.q} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Link
              href={buildUrl(params, { category: undefined })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !params.category
                  ? "bg-[#C8FF00] text-[#121212]"
                  : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
              }`}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={buildUrl(params, { category: c.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  params.category === c.id
                    ? "bg-[#C8FF00] text-[#121212]"
                    : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
                }`}
              >
                {CATEGORY_ICON[c.slug] ?? ""} {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Table */}
        {allUnits.length === 0 ? (
          <div className="py-16 text-center text-[#B4B4B4] text-sm">
            {params.q ? `No results for "${params.q}"` : "No units found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#2e2e2e]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest w-12" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest">
                    SKU
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest">
                    Quantity
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#B4B4B4] uppercase tracking-widest">
                    Status
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {allUnits.map((unit) => {
                  const inUse = checkedOutUnitIds.has(unit.id)
                  const categorySlug = unit.product.category.slug
                  const sku = deriveSkuLabel(unit.product.name, unit.size)

                  const status = !unit.isActive
                    ? { label: "Inactive", dot: "bg-[#444]", text: "text-[#666]" }
                    : inUse
                      ? { label: "In Use", dot: "bg-orange-400", text: "text-orange-400" }
                      : { label: "Active", dot: "bg-[#C8FF00]", text: "text-[#C8FF00]" }

                  return (
                    <tr
                      key={unit.id}
                      className="hover:bg-white/[0.025] transition-colors group"
                    >
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-[#252525] border border-[#2e2e2e] flex items-center justify-center text-xl">
                          {unit.product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={unit.product.images[0]}
                              alt=""
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            CATEGORY_ICON[categorySlug] ?? "📦"
                          )}
                        </div>
                      </td>

                      {/* Product + size */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white leading-tight">
                          {unit.product.name}
                          {unit.size && (
                            <span className="ml-2 text-[11px] text-[#B4B4B4] font-normal">
                              {unit.size}
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-[#555] mt-0.5">
                          {unit.product.category.name}
                        </p>
                      </td>

                      {/* ID */}
                      <td className="px-4 py-3 font-mono text-xs text-[#777]">
                        {unit.serialNumber ?? unit.id.slice(-8).toUpperCase()}
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3 font-mono text-xs text-[#B4B4B4]">
                        {sku}
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3 text-sm text-[#E6E6E6]">
                        1
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
                          <span className={`text-xs font-medium ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                      </td>

                      {/* Edit */}
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

            {/* Footer count */}
            <div className="px-4 py-3 border-t border-[#2e2e2e] text-xs text-[#555]">
              {allUnits.length.toLocaleString()} unit{allUnits.length !== 1 ? "s" : ""}
            </div>
          </div>
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
