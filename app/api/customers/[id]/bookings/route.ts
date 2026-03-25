import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const bookings = await prisma.booking.findMany({
    where: {
      customerId: id,
      status: { not: "CANCELLED" },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      bookingNumber: true,
      startDate: true,
      endDate: true,
      status: true,
      items: {
        select: {
          productId: true,
          size: true,
          quantity: true,
          unitPrice: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              isPackage: true,
              category: { select: { name: true } },
              pricingTiers: { select: { id: true, label: true, days: true, price: true } },
            },
          },
        },
      },
    },
  })

  return NextResponse.json(bookings)
}
