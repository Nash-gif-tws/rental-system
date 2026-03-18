import { prisma } from "@/lib/prisma"
import NewBookingForm from "@/components/admin/NewBookingForm"

export default async function NewBookingPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true, pricingTiers: { where: { isActive: true } } },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  })

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Booking</h1>
      <NewBookingForm products={products} />
    </div>
  )
}
