/**
 * Shared availability helpers used by booking creation routes (admin + public).
 *
 * Packages don't have their own EquipmentUnits — their availability is the
 * minimum available count across all their component products.
 */
import { Prisma } from "@prisma/client"

type TxClient = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export type AvailabilityCheckItem = {
  productId: string
  quantity: number
}

/**
 * Check whether all items in a prospective booking can be fulfilled.
 * Returns null if everything is available, or a string describing the conflict.
 *
 * Works correctly for both individual products (check own units) and packages
 * (check each component's units, accounting for other package bookings).
 *
 * @param tx - Prisma transaction client
 * @param items - items to check
 * @param start - rental start date
 * @param end - rental end date
 * @param excludeBookingId - booking ID to exclude from conflict count (for edits)
 */
export async function checkAvailability(
  tx: TxClient,
  items: AvailabilityCheckItem[],
  start: Date,
  end: Date,
  excludeBookingId?: string
): Promise<string | null> {
  const productIds = [...new Set(items.map((i) => i.productId))]

  // Load all involved products with their package component links
  const products = await tx.product.findMany({
    where: { id: { in: productIds } },
    include: {
      packageItems: true, // components of this package
    },
  })
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  // Collect all component productIds we need to check units for
  const componentProductIds = new Set<string>()
  for (const item of items) {
    const prod = productMap[item.productId]
    if (!prod) continue
    if (prod.isPackage && prod.packageItems.length > 0) {
      prod.packageItems.forEach((pi) => componentProductIds.add(pi.productId))
    } else if (!prod.isPackage) {
      componentProductIds.add(item.productId)
    }
    // Package with no configured components → skip (treated as unlimited)
  }

  if (componentProductIds.size === 0) return null

  // Count available units per component product (exclude blocked/retired)
  const unitCounts = await tx.equipmentUnit.groupBy({
    by: ["productId"],
    where: {
      productId: { in: [...componentProductIds] },
      isActive: true,
      condition: { notIn: ["NEEDS_SERVICE", "RETIRED"] },
      NOT: {
        blockouts: {
          some: { startDate: { lte: end }, endDate: { gte: start } },
        },
      },
    },
    _count: { id: true },
  })
  const unitCountMap: Record<string, number> = Object.fromEntries(
    unitCounts.map((u) => [u.productId, u._count.id])
  )

  // Count already-booked quantities per product for this date window
  const bookedItems = await tx.bookingItem.findMany({
    where: {
      productId: { in: [...componentProductIds, ...productIds] },
      booking: {
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        status: { in: ["CONFIRMED", "CHECKED_OUT", "PENDING"] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    },
    select: { productId: true, quantity: true },
  })

  // Direct bookings per product
  const directBooked: Record<string, number> = {}
  for (const bi of bookedItems) {
    directBooked[bi.productId] = (directBooked[bi.productId] ?? 0) + bi.quantity
  }

  // For each package booked, figure out how many of each component are consumed
  // We need to look at bookings of package products and expand them
  const allPackageProductIds = products.filter((p) => p.isPackage && p.packageItems.length > 0).map((p) => p.id)

  let componentConsumedByPackages: Record<string, number> = {}
  if (allPackageProductIds.length > 0) {
    const packageBookings = await tx.bookingItem.findMany({
      where: {
        productId: { in: allPackageProductIds },
        booking: {
          ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
          status: { in: ["CONFIRMED", "CHECKED_OUT", "PENDING"] },
          startDate: { lte: end },
          endDate: { gte: start },
        },
      },
      select: { productId: true, quantity: true },
    })

    for (const bi of packageBookings) {
      const pkg = productMap[bi.productId]
      if (!pkg) continue
      for (const pi of pkg.packageItems) {
        componentConsumedByPackages[pi.productId] =
          (componentConsumedByPackages[pi.productId] ?? 0) + bi.quantity * pi.quantity
      }
    }
  }

  // Now check each requested item
  for (const item of items) {
    const prod = productMap[item.productId]
    if (!prod) {
      return `Product not found: ${item.productId}`
    }

    if (prod.isPackage && prod.packageItems.length === 0) {
      // No component configuration — treat as unlimited, skip
      continue
    }

    if (!prod.isPackage) {
      // Individual product — check its own units
      const total = unitCountMap[item.productId] ?? 0
      const booked = (directBooked[item.productId] ?? 0) + (componentConsumedByPackages[item.productId] ?? 0)
      if (item.quantity > total - booked) {
        const productName = prod.name
        return `"${productName}" is not available for the requested dates`
      }
    } else {
      // Package — check each component
      for (const pi of prod.packageItems) {
        const total = unitCountMap[pi.productId] ?? 0
        const directComponent = directBooked[pi.productId] ?? 0
        const packageComponent = componentConsumedByPackages[pi.productId] ?? 0
        const needed = item.quantity * pi.quantity
        if (needed > total - directComponent - packageComponent) {
          return `"${prod.name}" is not available for the requested dates`
        }
      }
    }
  }

  return null // all good
}
