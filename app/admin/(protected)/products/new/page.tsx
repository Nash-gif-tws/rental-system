import { prisma } from "@/lib/prisma"
import NewProductForm from "@/components/admin/NewProductForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/products" className="flex items-center gap-1.5 text-sm text-[#B4B4B4] hover:text-white transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">New Product</h1>
      </div>
      <NewProductForm categories={categories} />
    </div>
  )
}
