import { prisma } from "@/lib/prisma"
import AddUnitForm from "@/components/admin/AddUnitForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AddUnitPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  })

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/admin/inventory" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Inventory
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Unit</h1>
        <p className="text-sm text-gray-500 mt-0.5">Add a new physical piece of equipment to inventory.</p>
      </div>
      <AddUnitForm products={products as any} />
    </div>
  )
}
