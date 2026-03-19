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
        <Link href="/admin/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
            {product.isActive ? "Active" : "Inactive"}
          </span>
          {product.isPackage && (
            <span className="text-xs px-2 py-0.5 rounded font-medium bg-purple-100 text-purple-800">Package</span>
          )}
        </div>
      </div>
      <EditProductClient product={product as any} categories={categories} allProducts={allProducts as any} />
    </div>
  )
}
