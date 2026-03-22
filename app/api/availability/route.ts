import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("start")
  const endDate = searchParams.get("end")

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "start and end required" }, { status: 400 })
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 })
  }

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        pricingTiers: { where: { isActive: true }, orderBy: { days: "asc" } },
        units: {
          where: {
            isActive: true,
            condition: { notIn: ["NEEDS_SERVICE", "RETIRED"] },
          },
          select: { id: true, size: true },
        },
        // Package → component links
        packageItems: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    })

    // All booked items for this date range (direct product bookings)
    const bookedItems = await prisma.bookingItem.findMany({
      where: {
        booking: {
          status: { in: ["CONFIRMED", "CHECKED_OUT", "PENDING"] },
          startDate: { lte: end },
          endDate: { gte: start },
        },
      },
      select: { productId: true, size: true, quantity: true },
    })

    // Blocked unit ids
    const blockouts = await prisma.blockout.findMany({
      where: {
        startDate: { lte: end },
        endDate: { gte: start },
        unit: {
          isActive: true,
          condition: { notIn: ["NEEDS_SERVICE", "RETIRED"] },
        },
      },
      select: { unitId: true },
    })
    const blockedUnitIds = new Set(blockouts.map((b) => b.unitId))

    // productId → all its package parents and qty required per booking
    // e.g. adult-skis → [{ packageId: mens-ski-package, qty: 1 }, ...]
    const componentOfPackages: Record<string, { packageId: string; qty: number }[]> = {}
    for (const prod of products) {
      for (const pi of prod.packageItems) {
        if (!componentOfPackages[pi.productId]) componentOfPackages[pi.productId] = []
        componentOfPackages[pi.productId].push({ packageId: prod.id, qty: pi.quantity })
      }
    }

    // Direct booking count: productId → size → count
    const directBookedMap: Record<string, Record<string, number>> = {}
    for (const item of bookedItems) {
      if (!directBookedMap[item.productId]) directBookedMap[item.productId] = {}
      const sz = item.size ?? "__any__"
      directBookedMap[item.productId][sz] =
        (directBookedMap[item.productId][sz] ?? 0) + (item.quantity ?? 1)
    }

    // Total package bookings per packageId (no size breakdown — packages don't track size at package level)
    const packageBookedCount: Record<string, number> = {}
    for (const item of bookedItems) {
      const prod = products.find((p) => p.id === item.productId)
      if (prod?.isPackage) {
        packageBookedCount[item.productId] = (packageBookedCount[item.productId] ?? 0) + (item.quantity ?? 1)
      }
    }

    // Helper: compute available count for a single non-package product,
    // accounting for direct bookings AND consumption via package bookings
    function computeComponentAvailable(
      productId: string,
      activeUnits: { id: string; size: string | null }[]
    ): { total: number; available: number; sizes: { size: string; total: number; available: number }[] } {
      const nonBlockedUnits = activeUnits.filter((u) => !blockedUnitIds.has(u.id))
      const total = nonBlockedUnits.length

      // Direct bookings against this component
      const directBooked = Object.values(directBookedMap[productId] ?? {}).reduce((s, n) => s + n, 0)

      // Indirect bookings: each package that contains this component consumes qty per booking
      const indirectBooked = (componentOfPackages[productId] ?? []).reduce((sum, { packageId, qty }) => {
        return sum + (packageBookedCount[packageId] ?? 0) * qty
      }, 0)

      const totalBooked = directBooked + indirectBooked
      const available = Math.max(0, total - totalBooked)

      // Per-size breakdown (direct bookings only — packages don't specify component sizes)
      const sizeMap: Record<string, { total: number; booked: number }> = {}
      for (const unit of nonBlockedUnits) {
        const sz = unit.size ?? "__none__"
        if (!sizeMap[sz]) sizeMap[sz] = { total: 0, booked: 0 }
        sizeMap[sz].total++
      }
      const productBooked = directBookedMap[productId] ?? {}
      for (const [sz, count] of Object.entries(productBooked)) {
        const key = sz === "__any__" ? "__none__" : sz
        if (sizeMap[key]) {
          sizeMap[key].booked = Math.min(sizeMap[key].booked + count, sizeMap[key].total)
        } else {
          const firstKey = Object.keys(sizeMap)[0]
          if (firstKey) {
            sizeMap[firstKey].booked = Math.min((sizeMap[firstKey].booked ?? 0) + count, sizeMap[firstKey].total)
          }
        }
      }
      const sizes = Object.entries(sizeMap)
        .filter(([sz]) => sz !== "__none__")
        .map(([size, { total, booked }]) => ({
          size,
          total,
          available: Math.max(0, total - booked),
        }))
        .sort((a, b) => sortSize(a.size, b.size))

      return { total, available, sizes }
    }

    // Build a lookup of non-package product availability keyed by productId
    const componentAvailMap: Record<string, ReturnType<typeof computeComponentAvailable>> = {}
    for (const product of products) {
      if (!product.isPackage) {
        componentAvailMap[product.id] = computeComponentAvailable(product.id, product.units)
      }
    }

    const result = products.map((product) => {
      if (!product.isPackage) {
        // Non-package: use computed availability
        const avail = componentAvailMap[product.id]
        const noSizeUnits = product.units.filter((u) => !blockedUnitIds.has(u.id) && !u.size)
        const directBooked = Object.values(directBookedMap[product.id] ?? {}).reduce((s, n) => s + n, 0)
        const indirectBooked = (componentOfPackages[product.id] ?? []).reduce((sum, { packageId, qty }) => {
          return sum + (packageBookedCount[packageId] ?? 0) * qty
        }, 0)
        const noSizeAvailable = Math.max(0, noSizeUnits.length - directBooked - indirectBooked)

        return {
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category.name,
          categorySlug: product.category.slug,
          isPackage: false,
          available: avail.available,
          totalUnits: avail.total,
          sizes: avail.sizes,
          hasSizes: avail.sizes.length > 0,
          pricingTiers: product.pricingTiers,
        }
      }

      // Package: availability = min(floor(componentAvailable / qtyRequired)) across all components
      // If no components are configured, treat as unlimited (null = ∞)
      const components = product.packageItems
      if (components.length === 0) {
        return {
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category.name,
          categorySlug: product.category.slug,
          isPackage: true,
          available: null, // unlimited — no components configured
          totalUnits: null,
          sizes: [],
          hasSizes: false,
          pricingTiers: product.pricingTiers,
        }
      }

      // Each already-booked package consumes qty of each component — account for that
      const alreadyBooked = packageBookedCount[product.id] ?? 0
      const packageAvailable = components.reduce((minSoFar, pi) => {
        const compAvail = componentAvailMap[pi.productId]
        if (!compAvail) return minSoFar // component not found — skip
        // Available units for this component after existing package bookings
        const netAvail = Math.max(0, compAvail.total - (alreadyBooked * pi.quantity) -
          Object.values(directBookedMap[pi.productId] ?? {}).reduce((s, n) => s + n, 0))
        const packagesFromThis = Math.floor(netAvail / pi.quantity)
        return Math.min(minSoFar, packagesFromThis)
      }, Infinity)

      const finalAvailable = packageAvailable === Infinity ? null : Math.max(0, packageAvailable)

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category.name,
        categorySlug: product.category.slug,
        isPackage: true,
        available: finalAvailable,
        totalUnits: finalAvailable,
        sizes: [],
        hasSizes: false,
        pricingTiers: product.pricingTiers,
      }
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error("[availability] GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Sort sizes: numeric (by number) then alpha
function sortSize(a: string, b: string): number {
  const numA = parseFloat(a)
  const numB = parseFloat(b)
  if (!isNaN(numA) && !isNaN(numB)) return numA - numB
  const order = ["XS", "S", "M", "L", "XL", "2XL", "3XL"]
  const ia = order.indexOf(a.toUpperCase())
  const ib = order.indexOf(b.toUpperCase())
  if (ia !== -1 && ib !== -1) return ia - ib
  if (ia !== -1) return -1
  if (ib !== -1) return 1
  return a.localeCompare(b)
}
