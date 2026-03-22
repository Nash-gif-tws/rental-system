import { prisma } from "@/lib/prisma"
import PickingListClient, { type GroupedCategory, type PickItem } from "@/components/admin/PickingListClient"

// Category display order for the picking list (warehouse walk order)
const CATEGORY_ORDER: Record<string, number> = {
  packages: 1,
  skis: 2,
  snowboards: 3,
  boots: 4,
  outerwear: 5,
  accessories: 6,
}

export default async function PickingListPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams

  // Default to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const defaultDate = tomorrow.toISOString().split("T")[0]

  const selectedDateStr = params.date ?? defaultDate
  const dayStart = new Date(selectedDateStr + "T00:00:00")
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "PENDING"] },
      startDate: { gte: dayStart, lt: dayEnd },
    },
    include: {
      customer: true,
      items: {
        include: {
          product: { include: { category: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  // Flatten all items into pick list entries
  const allItems: PickItem[] = []

  for (const booking of bookings) {
    for (const item of booking.items) {
      const categorySlug = item.product.category.slug.toLowerCase()
      const categoryName = item.product.category.name
      const order = CATEGORY_ORDER[categorySlug] ?? 99

      allItems.push({
        key: `${booking.id}-${item.id}`,
        bookingNumber: booking.bookingNumber,
        bookingId: booking.id,
        customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
        customerPhone: booking.customer.phone ?? "",
        productName: item.product.name,
        categoryName,
        categoryOrder: order,
        size: item.size ?? "",
        notes: booking.notes ?? "",
      })
    }
  }

  // Group: category → product → size
  const categoryMap = new Map<string, Map<string, Map<string, PickItem[]>>>()

  // Sort items by category order, then product name, then size
  const sorted = [...allItems].sort((a, b) => {
    if (a.categoryOrder !== b.categoryOrder) return a.categoryOrder - b.categoryOrder
    if (a.productName !== b.productName) return a.productName.localeCompare(b.productName)
    return (a.size || "ZZZ").localeCompare(b.size || "ZZZ")
  })

  for (const item of sorted) {
    if (!categoryMap.has(item.categoryName)) {
      categoryMap.set(item.categoryName, new Map())
    }
    const productMap = categoryMap.get(item.categoryName)!

    if (!productMap.has(item.productName)) {
      productMap.set(item.productName, new Map())
    }
    const sizeMap = productMap.get(item.productName)!

    if (!sizeMap.has(item.size)) {
      sizeMap.set(item.size, [])
    }
    sizeMap.get(item.size)!.push(item)
  }

  const groups: GroupedCategory[] = Array.from(categoryMap.entries()).map(([catName, productMap]) => ({
    name: catName,
    order: allItems.find(i => i.categoryName === catName)?.categoryOrder ?? 99,
    products: Array.from(productMap.entries()).map(([productName, sizeMap]) => ({
      name: productName,
      sizes: Array.from(sizeMap.entries()).map(([size, items]) => ({ size, items })),
    })),
  }))

  return (
    <PickingListClient
      groups={groups}
      selectedDate={selectedDateStr}
      totalBookings={bookings.length}
    />
  )
}
