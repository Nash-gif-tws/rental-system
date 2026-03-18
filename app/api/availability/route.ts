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

  // Get all active products with pricing
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      pricingTiers: { where: { isActive: true }, orderBy: { days: "asc" } },
      units: { where: { isActive: true } },
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  })

  // For each product, count how many units are booked during the requested period
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

  const result = products.map((product) => {
    const totalUnits = product.units.length
    const booked = bookedMap[product.id] ?? 0
    const available = Math.max(0, totalUnits - booked)

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
}
