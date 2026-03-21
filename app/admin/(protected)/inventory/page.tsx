import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import InventorySearch from "./InventorySearch"
import InventoryTable from "@/components/admin/InventoryTable"

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


  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">
          Inventory
        </h1>
        <Link
          href="/admin/inventory/new"
          className="flex items-center gap-2 bg-[#C4A04A] text-[#121212] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4b565] transition-colors"
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
                  ? "border-[#C4A04A] text-white"
                  : "border-transparent text-[#B4B4B4] hover:text-white"
              }`}
            >
              {label}
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded font-bold ${
                  params.status === key
                    ? "bg-[#C4A04A]/15 text-[#C4A04A]"
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
                  ? "bg-[#C4A04A] text-[#121212]"
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
                    ? "bg-[#C4A04A] text-[#121212]"
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
          <InventoryTable units={allUnits} checkedOutUnitIds={checkedOutUnitIds} />
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
