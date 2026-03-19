import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditUnitForm from "@/components/admin/EditUnitForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const unit = await prisma.equipmentUnit.findUnique({
    where: { id },
    include: { product: { include: { category: true } } },
  })

  if (!unit) notFound()

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/admin/inventory" className="flex items-center gap-1 text-sm text-[#B4B4B4] hover:text-white mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Inventory
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">Edit Unit</h1>
        <p className="text-sm text-[#B4B4B4] mt-0.5">{unit.product.name} · {unit.product.category.name}</p>
      </div>
      <EditUnitForm unit={unit as any} />
    </div>
  )
}
