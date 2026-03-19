import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Plus, Package, Layers, Edit, ToggleLeft } from "lucide-react"

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        pricingTiers: { where: { isActive: true }, orderBy: { days: "asc" } },
        _count: { select: { units: true } },
        packageItems: { include: { product: true } },
      },
      orderBy: [{ isPackage: "desc" }, { category: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  const packages = products.filter((p) => p.isPackage)
  const individual = products.filter((p) => !p.isPackage)

  const Section = ({ title, icon: Icon, items }: { title: string; icon: any; items: typeof products }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-400">({items.length})</span>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">None yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Category</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Pricing Tiers</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Units</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    {product.isPackage && product.packageItems.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Includes: {product.packageItems.map((pi) => pi.product.name).join(", ")}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{product.category.name}</td>
                  <td className="px-5 py-3.5">
                    {product.pricingTiers.length === 0 ? (
                      <span className="text-red-400 text-xs">No pricing set</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {product.pricingTiers.map((t) => (
                          <span key={t.id} className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600">
                            {t.label}: {formatCurrency(t.price)}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{product._count.units}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                    }`}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium hover:bg-sky-100 transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products & Packages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage what's available to rent and how it's priced</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Product
        </Link>
      </div>

      <Section title="Packages" icon={Layers} items={packages} />
      <Section title="Individual Items" icon={Package} items={individual} />
    </div>
  )
}
