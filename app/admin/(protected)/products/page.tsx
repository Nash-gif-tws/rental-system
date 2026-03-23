import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Plus, Package, Layers, Edit, Upload } from "lucide-react"

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
        <Icon className="h-4 w-4 text-[#B4B4B4]" />
        <h2 className="text-sm font-semibold tracking-widest uppercase text-[#B4B4B4]">{title}</h2>
        <span className="text-xs text-[#B4B4B4]">({items.length})</span>
      </div>
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden overflow-x-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center text-[#B4B4B4] text-sm">None yet</div>
        ) : (
          <table className="w-full text-sm min-w-[600px]">
            <thead className="border-b border-[#2e2e2e]">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Category</th>
                <th className="text-left px-5 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Pricing Tiers</th>
                <th className="text-left px-5 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Units</th>
                <th className="text-left px-5 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252525]">
              {items.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-white">{product.name}</p>
                    {product.isPackage && product.packageItems.length > 0 && (
                      <p className="text-xs text-[#B4B4B4] mt-0.5">
                        Includes: {product.packageItems.map((pi) => pi.product.name).join(", ")}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[#B4B4B4]">{product.category.name}</td>
                  <td className="px-5 py-3.5">
                    {product.pricingTiers.length === 0 ? (
                      <span className="text-red-400 text-xs">No pricing set</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {product.pricingTiers.map((t) => (
                          <span key={t.id} className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 text-xs text-[#E6E6E6]">
                            {t.label}: {formatCurrency(t.price)}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[#E6E6E6]">{product._count.units}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      product.isActive ? "bg-[#C4A04A]/20 text-[#C4A04A]" : "bg-zinc-500/20 text-zinc-400"
                    }`}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C4A04A]/10 text-[#C4A04A] text-xs font-medium hover:bg-[#C4A04A]/20 transition-colors"
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">Products & Packages</h1>
          <p className="text-sm text-[#B4B4B4] mt-0.5">Manage what's available to rent and how it's priced</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/import"
            className="flex items-center gap-2 bg-[#1e1e1e] border border-[#2e2e2e] text-[#B4B4B4] hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-[#C4A04A] text-[#121212] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4b565] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Product
          </Link>
        </div>
      </div>

      <Section title="Packages" icon={Layers} items={packages} />
      <Section title="Individual Items" icon={Package} items={individual} />
    </div>
  )
}
