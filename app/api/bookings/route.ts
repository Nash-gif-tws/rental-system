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
  items: z.array(
    z.object({
      productId: z.string(),
      size: z.string().optional(),
      quantity: z.number().default(1),
      unitPrice: z.number(),
    })
  ),
  height: z.number().optional(),
  weight: z.number().optional(),
  bootSize: z.number().optional(),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const data = CreateBookingSchema.parse(body)

  // Upsert customer
  let customer = await prisma.customer.findFirst({
    where: { email: data.customer.email },
  })
  if (!customer) {
    customer = await prisma.customer.create({ data: data.customer })
  }

  const subtotal = data.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  const booking = await prisma.booking.create({
    data: {
      bookingNumber: generateBookingNumber(),
      customerId: customer.id,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
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

  return NextResponse.json(booking, { status: 201 })
}
