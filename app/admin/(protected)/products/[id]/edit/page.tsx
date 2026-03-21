import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import EditProductClient from "@/components/admin/EditProductClient"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categories, allProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        pricingTiers: { orderBy: { days: "asc" } },
        units: { orderBy: [{ size: "asc" }, { createdAt: "asc" }] },
        packageItems: { include: { product: { include: { category: true } } } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { isPackage: false, isActive: true },
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
  ])

  if (!product) notFound()

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link href="/admin/products" className="flex items-center gap-1.5 text-sm text-[#B4B4B4] hover:text-white transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">{product.name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded font-bold ${product.isActive ? "bg-[#C4A04A]/15 text-[#C4A04A]" : "bg-white/5 text-[#555]"}`}>
            {product.isActive ? "Active" : "Inactive"}
          </span>
          {product.isPackage && (
            <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-500/15 text-blue-400">Package</span>
          )}
        </div>
      </div>
      <EditProductClient product={product as any} categories={categories} allProducts={allProducts as any} />
    </div>
  )
}
