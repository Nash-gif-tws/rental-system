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
    // Get all active products — exclude NEEDS_SERVICE and RETIRED units from available count
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
        },
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    })

    // Count booked quantities per product in the requested period
    const bookedCounts = await prisma.bookingItem.groupBy({
      by: ["productId"],
      where: {
        booking: {
          status: { in: ["CONFIRMED", "CHECKED_OUT", "PENDING"] },
          startDate: { lte: end },
          endDate: { gte: start },
        },
      },
      _sum: { quantity: true },
    })

    const bookedMap = Object.fromEntries(
      bookedCounts.map((b) => [b.productId, b._sum.quantity ?? 0])
    )

    // Count units blocked out during the requested period per product
    const blockouts = await prisma.blockout.findMany({
      where: {
        startDate: { lte: end },
        endDate: { gte: start },
        unit: {
          isActive: true,
          condition: { notIn: ["NEEDS_SERVICE", "RETIRED"] },
        },
      },
      select: { unitId: true, unit: { select: { productId: true } } },
    })

    // Deduplicate: a unit with multiple overlapping blockouts still counts as 1
    const blockedByProduct: Record<string, Set<string>> = {}
    for (const b of blockouts) {
      const pid = b.unit.productId
      if (!blockedByProduct[pid]) blockedByProduct[pid] = new Set()
      blockedByProduct[pid].add(b.unitId)
    }
    const blockedMap = Object.fromEntries(
      Object.entries(blockedByProduct).map(([k, v]) => [k, v.size])
    )

    const result = products.map((product) => {
      const totalUnits = product.units.length
      const booked = bookedMap[product.id] ?? 0
      const blocked = blockedMap[product.id] ?? 0
      const available = Math.max(0, totalUnits - booked - blocked)

      return {
        id: product.id,
        name: product.name,
        category: product.category.name,
        categorySlug: product.category.slug,
        isPackage: product.isPackage,
        available,
        totalUnits,
        pricingTiers: product.pricingTiers,
      }
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error("[availability] GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
