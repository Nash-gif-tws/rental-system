import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q) return NextResponse.json({ error: "q is required" }, { status: 400 })

  // 1. Try booking number match (SSW- prefix or direct match)
  const booking = await prisma.booking.findFirst({
    where: { bookingNumber: { equals: q, mode: "insensitive" } },
    include: {
      customer: true,
      items: {
        include: {
          product: { include: { category: true } },
          unit: true,
        },
      },
    },
  })

  if (booking) {
    return NextResponse.json({ type: "booking", booking })
  }

  // 2. Try equipment unit serial number
  const unit = await prisma.equipmentUnit.findFirst({
    where: { serialNumber: { equals: q, mode: "insensitive" } },
    include: {
      product: { include: { category: true } },
      bookingItems: {
        where: {
          booking: { status: { in: ["CONFIRMED", "CHECKED_OUT", "PENDING"] } },
        },
        include: {
          booking: { include: { customer: true } },
        },
        orderBy: { booking: { startDate: "asc" } },
        take: 1,
      },
    },
  })

  if (unit) {
    return NextResponse.json({ type: "unit", unit })
  }

  return NextResponse.json({ type: "not_found" }, { status: 404 })
}
