import { prisma } from "@/lib/prisma"
import AddUnitForm from "@/components/admin/AddUnitForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AddUnitPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>
}) {
  const { productId } = await searchParams

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  })

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link
          href="/admin/inventory"
          className="flex items-center gap-1 text-sm text-[#B4B4B4] hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Inventory
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">
          Add Unit
        </h1>
        <p className="text-sm text-[#B4B4B4] mt-0.5">
          Add a new physical piece of equipment to inventory.
        </p>
      </div>
      <AddUnitForm products={products as any} defaultProductId={productId} />
    </div>
  )
}
