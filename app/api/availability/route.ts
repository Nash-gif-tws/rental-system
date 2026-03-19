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
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    })

    // Booked quantity per (productId, size) for the date range
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

    // Build booked map: productId -> size -> count
    const bookedMap: Record<string, Record<string, number>> = {}
    for (const item of bookedItems) {
      if (!bookedMap[item.productId]) bookedMap[item.productId] = {}
      const sz = item.size ?? "__any__"
      bookedMap[item.productId][sz] = (bookedMap[item.productId][sz] ?? 0) + (item.quantity ?? 1)
    }

    // Blocked units per unit id
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

    const result = products.map((product) => {
      const activeUnits = product.units.filter((u) => !blockedUnitIds.has(u.id))
      const productBooked = bookedMap[product.id] ?? {}

      // Build per-size breakdown
      const sizeMap: Record<string, { total: number; booked: number }> = {}
      for (const unit of activeUnits) {
        const sz = unit.size ?? "__none__"
        if (!sizeMap[sz]) sizeMap[sz] = { total: 0, booked: 0 }
        sizeMap[sz].total++
      }

      // Subtract booked per size
      for (const [sz, count] of Object.entries(productBooked)) {
        const key = sz === "__any__" ? "__none__" : sz
        if (sizeMap[key]) {
          sizeMap[key].booked = Math.min(sizeMap[key].booked + count, sizeMap[key].total)
        } else {
          // Booked size not in units — apply to any available size proportionally
          // (legacy bookings without a size assigned)
          const firstKey = Object.keys(sizeMap)[0]
          if (firstKey) {
            sizeMap[firstKey].booked = Math.min(
              (sizeMap[firstKey].booked ?? 0) + count,
              sizeMap[firstKey].total
            )
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

      // For products without size tracking (size=null on all units)
      const noSizeUnits = sizeMap["__none__"]
      const noSizeAvailable = noSizeUnits
        ? Math.max(0, noSizeUnits.total - noSizeUnits.booked)
        : 0

      const totalUnits = activeUnits.length
      const totalAvailable = sizes.reduce((s, sz) => s + sz.available, 0) + noSizeAvailable

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category.name,
        categorySlug: product.category.slug,
        isPackage: product.isPackage,
        available: totalAvailable,
        totalUnits,
        sizes,
        hasSizes: sizes.length > 0,
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

  // Size labels: XS < S < M < L < XL < 2XL < 3XL
  const order = ["XS", "S", "M", "L", "XL", "2XL", "3XL"]
  const ia = order.indexOf(a.toUpperCase())
  const ib = order.indexOf(b.toUpperCase())
  if (ia !== -1 && ib !== -1) return ia - ib
  if (ia !== -1) return -1
  if (ib !== -1) return 1
  return a.localeCompare(b)
}
