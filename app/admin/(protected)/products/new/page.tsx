import { prisma } from "@/lib/prisma"
import NewProductForm from "@/components/admin/NewProductForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
      </div>
      <NewProductForm categories={categories} />
    </div>
  )
}
