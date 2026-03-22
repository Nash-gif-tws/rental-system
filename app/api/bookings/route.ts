import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateBookingNumber } from "@/lib/utils"
import { z } from "zod"

const CreateBookingSchema = z.object({
  customer: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["PENDING", "CONFIRMED"]).optional().default("PENDING"),
  items: z.array(
    z.object({
      productId: z.string(),
      size: z.string().optional(),
      quantity: z.number().int().min(1).default(1),
      unitPrice: z.number().min(0),
    })
  ).min(1),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  bootSize: z.number().positive().optional(),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = CreateBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 })
  }

  const data = parsed.data
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 422 })
  }
  if (start >= end) {
    return NextResponse.json({ error: "startDate must be before endDate" }, { status: 422 })
  }
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(0, 0, 0, 0)
  if (start < yesterday) {
    return NextResponse.json({ error: "startDate cannot be in the past" }, { status: 422 })
  }
  const rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  if (rentalDays > 180) {
    return NextResponse.json({ error: "Rental duration cannot exceed 180 days" }, { status: 422 })
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      // Upsert customer
      let customer = await tx.customer.findFirst({
        where: { email: data.customer.email },
      })
      if (!customer) {
        customer = await tx.customer.create({ data: data.customer })
      }

      // Overbooking check: for each product, verify stock is available in this window
      const productIds = [...new Set(data.items.map((i) => i.productId))]

      const availableUnits = await tx.equipmentUnit.groupBy({
        by: ["productId"],
        where: {
          productId: { in: productIds },
          isActive: true,
          condition: { notIn: ["NEEDS_SERVICE", "RETIRED"] },
          // Exclude units that are blocked out during this period
          NOT: {
            blockouts: {
              some: {
                startDate: { lte: end },
                endDate: { gte: start },
              },
            },
          },
        },
        _count: { id: true },
      })

      const unitCountMap = Object.fromEntries(
        availableUnits.map((u) => [u.productId, u._count.id])
      )

      const bookedCounts = await tx.bookingItem.groupBy({
        by: ["productId"],
        where: {
          productId: { in: productIds },
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

      for (const item of data.items) {
        const total = unitCountMap[item.productId] ?? 0
        const booked = bookedMap[item.productId] ?? 0
        if (item.quantity > total - booked) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { name: true },
          })
          return NextResponse.json(
            { error: `"${product?.name ?? item.productId}" is not available for the requested dates` },
            { status: 409 }
          )
        }
      }

      const subtotal = data.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

      return tx.booking.create({
        data: {
          bookingNumber: generateBookingNumber(),
          customerId: customer.id,
          status: data.status,
          startDate: start,
          endDate: end,
          subtotal,
          height: data.height,
          weight: data.weight,
          bootSize: data.bootSize,
          skillLevel: data.skillLevel,
          notes: data.notes,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              size: item.size,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: { customer: true, items: true },
      })
    })

    // If booking is a NextResponse (overbooking conflict), return it directly
    if (booking instanceof NextResponse) return booking

    return NextResponse.json(booking, { status: 201 })
  } catch (err) {
    console.error("[bookings] POST error:", err)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
