import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"

const CONDITION_COLORS: Record<string, string> = {
  EXCELLENT: "bg-green-100 text-green-800",
  GOOD: "bg-blue-100 text-blue-800",
  FAIR: "bg-yellow-100 text-yellow-800",
  NEEDS_SERVICE: "bg-red-100 text-red-800",
  RETIRED: "bg-gray-100 text-gray-800",
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
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <Link
          href="/admin/inventory/new"
          className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Unit
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/inventory"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !params.category ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/admin/inventory?category=${c.id}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                params.category === c.id ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                params.condition === c ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            No inventory items found. Add some units to get started.
          </div>
        ) : (
          Object.values(grouped).map(({ product, units }) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-xs text-gray-500">{product.category.name} · {units.length} units</p>
                </div>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="text-sm text-sky-600 hover:text-sky-700"
                >
                  Edit Product
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-2 font-medium text-gray-500">Serial / ID</th>
                      <th className="text-left px-6 py-2 font-medium text-gray-500">Size</th>
                      <th className="text-left px-6 py-2 font-medium text-gray-500">Condition</th>
                      <th className="text-left px-6 py-2 font-medium text-gray-500">Notes</th>
                      <th className="text-left px-6 py-2 font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-mono text-xs text-gray-600">
                          {unit.serialNumber ?? unit.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-3 text-gray-700">{unit.size ?? "—"}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CONDITION_COLORS[unit.condition]}`}>
                            {unit.condition.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500 text-xs">{unit.notes ?? "—"}</td>
                        <td className="px-6 py-3">
                          <Link
                            href={`/admin/inventory/${unit.id}`}
                            className="text-sky-600 hover:text-sky-700 text-xs"
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
