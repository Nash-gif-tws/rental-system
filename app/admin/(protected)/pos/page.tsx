import { prisma } from "@/lib/prisma"
import POSClient from "@/components/admin/POSClient"

export default async function POSPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      pricingTiers: { where: { isActive: true }, orderBy: { days: "asc" } },
      _count: { select: { units: true } },
      packageItems: { include: { product: true } },
    },
    orderBy: [{ isPackage: "desc" }, { category: { name: "asc" } }, { name: "asc" }],
  })

  return (
    <div className="-m-8 h-screen flex flex-col p-6 overflow-hidden">
      <div className="mb-4 flex-shrink-0">
        <h1 className="font-display text-xl font-bold tracking-wide text-white uppercase">In-Store POS</h1>
        <p className="text-xs text-[#B4B4B4] mt-0.5">Create bookings for walk-in customers</p>
      </div>
      <div className="flex-1 min-h-0">
        <POSClient products={products} />
      </div>
    </div>
  )
}
