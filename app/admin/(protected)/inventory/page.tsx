import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"

const CONDITION_COLORS: Record<string, string> = {
  EXCELLENT: "bg-emerald-500/20 text-emerald-300",
  GOOD: "bg-[#C8FF00]/20 text-[#C8FF00]",
  FAIR: "bg-yellow-500/20 text-yellow-300",
  NEEDS_SERVICE: "bg-red-500/20 text-red-300",
  RETIRED: "bg-zinc-500/20 text-zinc-400",
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; condition?: string }>
}) {
  const params = await searchParams

  const [categories, units] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.equipmentUnit.findMany({
      where: {
        isActive: true,
        ...(params.category ? { product: { categoryId: params.category } } : {}),
        ...(params.condition ? { condition: params.condition as any } : {}),
      },
      include: { product: { include: { category: true } } },
      orderBy: [{ product: { name: "asc" } }, { size: "asc" }],
    }),
  ])

  // Group by product
  const grouped = units.reduce(
    (acc, unit) => {
      const key = unit.productId
      if (!acc[key]) acc[key] = { product: unit.product, units: [] }
      acc[key].units.push(unit)
      return acc
    },
    {} as Record<string, { product: any; units: typeof units }>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">Inventory</h1>
        <Link
          href="/admin/inventory/new"
          className="flex items-center gap-2 bg-[#C8FF00] text-[#121212] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b3e600] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Unit
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4 flex flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/inventory"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-colors ${
              !params.category ? "bg-[#C8FF00] text-[#121212]" : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
            }`}
          >
            All Categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/admin/inventory?category=${c.id}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-colors ${
                params.category === c.id ? "bg-[#C8FF00] text-[#121212]" : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {["NEEDS_SERVICE", "FAIR"].map((c) => (
            <Link
              key={c}
              href={`/admin/inventory?condition=${c}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-colors ${
                params.condition === c ? "bg-[#C8FF00] text-[#121212]" : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
              }`}
            >
              {c === "NEEDS_SERVICE" ? "Needs Service" : "Fair Condition"}
            </Link>
          ))}
        </div>
      </div>

      {/* Inventory grouped by product */}
      <div className="space-y-4">
        {Object.values(grouped).length === 0 ? (
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-12 text-center text-[#B4B4B4]">
            No inventory items found. Add some units to get started.
          </div>
        ) : (
          Object.values(grouped).map(({ product, units }) => (
            <div key={product.id} className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2e2e2e] flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="text-xs text-[#B4B4B4] mt-0.5">{product.category.name} · {units.length} units</p>
                </div>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="text-xs text-[#C8FF00] hover:text-[#b3e600] transition-colors"
                >
                  Edit Product
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#2e2e2e]">
                    <tr>
                      <th className="text-left px-6 py-2 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Serial / ID</th>
                      <th className="text-left px-6 py-2 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Size</th>
                      <th className="text-left px-6 py-2 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Condition</th>
                      <th className="text-left px-6 py-2 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Notes</th>
                      <th className="text-left px-6 py-2 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252525]">
                    {units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-[#E6E6E6]">
                          {unit.serialNumber ?? unit.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-3 text-[#E6E6E6]">{unit.size ?? "—"}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CONDITION_COLORS[unit.condition]}`}>
                            {unit.condition.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-[#B4B4B4] text-xs">{unit.notes ?? "—"}</td>
                        <td className="px-6 py-3">
                          <Link
                            href={`/admin/inventory/${unit.id}`}
                            className="text-[#C8FF00] hover:text-[#b3e600] text-xs transition-colors"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
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
