import { prisma } from "@/lib/prisma"
import POSClient from "@/components/admin/POSClient"
import type { CartItem, DuplicateInfo } from "@/components/admin/POSClient"

export default async function POSPage({
  searchParams,
}: {
  searchParams: Promise<{ duplicate?: string }>
}) {
  const { duplicate } = await searchParams

  const [products, duplicateBooking] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        isPackage: true,
        isActive: true,
        category: true,
        pricingTiers: { where: { isActive: true }, orderBy: { days: "asc" } },
        _count: { select: { units: true } },
      },
      orderBy: [{ isPackage: "desc" }, { category: { name: "asc" } }, { name: "asc" }],
    }),
    duplicate
      ? prisma.booking.findUnique({
          where: { id: duplicate },
          include: {
            items: { include: { product: { include: { category: true } } } },
            customer: true,
          },
        })
      : null,
  ])

  const initialCart: CartItem[] | undefined = duplicateBooking
    ? duplicateBooking.items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        categoryName: item.product.category.name,
        qty: item.quantity,
        size: item.size ?? "",
        unitPrice: item.unitPrice,
      }))
    : undefined

  const duplicateInfo: DuplicateInfo | undefined = duplicateBooking
    ? {
        bookingNumber: duplicateBooking.bookingNumber,
        customerName: `${duplicateBooking.customer.firstName} ${duplicateBooking.customer.lastName}`,
        customerEmail: duplicateBooking.customer.email,
        customerPhone: duplicateBooking.customer.phone ?? "",
      }
    : undefined

  return (
    <div className="-m-8 h-screen flex flex-col p-6 overflow-hidden">
      <div className="mb-4 flex-shrink-0">
        <h1 className="font-display text-xl font-bold tracking-wide text-white uppercase">In-Store POS</h1>
        <p className="text-xs text-[#B4B4B4] mt-0.5">Create bookings for walk-in customers</p>
      </div>
      <div className="flex-1 min-h-0">
        <POSClient products={products} initialCart={initialCart} duplicateInfo={duplicateInfo} />
      </div>
    </div>
  )
}
