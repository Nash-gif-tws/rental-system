import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateBookingNumber } from "@/lib/utils"
import { sendBookingConfirmation } from "@/lib/email"
import { checkAvailability } from "@/lib/availability"
import { sydneyYesterdayStart } from "@/lib/tz"
import { z } from "zod"
import { differenceInDays } from "date-fns"

// ── Discount codes ────────────────────────────────────────────────────────────
// Key = code (uppercase), Value = percentage (0–100)
const DISCOUNT_CODES: Record<string, number> = {
  ONLINE15: 15,
}

function applyDiscount(subtotal: number, code: string | undefined): { discountAmount: number; discountPercent: number } {
  if (!code) return { discountAmount: 0, discountPercent: 0 }
  const pct = DISCOUNT_CODES[code.toUpperCase().trim()]
  if (!pct) return { discountAmount: 0, discountPercent: 0 }
  return { discountAmount: Math.round(subtotal * (pct / 100) * 100) / 100, discountPercent: pct }
}

// unitPrice is NOT accepted from client — calculated server-side to prevent manipulation
const Schema = z.object({
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
      productId: z.string().min(1),
      size: z.string().optional(),
      quantity: z.number().int().positive().default(1),
    })
  ).min(1, "At least one item is required"),
  height: z.number().optional(),
  weight: z.number().optional(),
  bootSize: z.number().optional(),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
})

function getBestPrice(
  tiers: { days: number; price: number; isActive: boolean }[],
  rentalDays: number
): number {
  const active = tiers.filter((t) => t.isActive)
  if (!active.length) return 0
  // Sort ASC — find smallest tier that covers the rental duration (same logic as UI/POS)
  const sorted = [...active].sort((a, b) => a.days - b.days)
  return sorted.find((t) => t.days >= rentalDays)?.price ?? sorted[sorted.length - 1].price
}

export async function POST(req: NextRequest) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  let data
  try {
    data = Schema.parse(body)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  const start = new Date(data.startDate)
  const end = new Date(data.endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 })
  }
  if (end <= start) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 })
  }
  if (start < sydneyYesterdayStart()) {
    return NextResponse.json({ error: "Start date cannot be in the past" }, { status: 400 })
  }
  const rentalDays = Math.max(1, differenceInDays(end, start))
  if (rentalDays > 180) {
    return NextResponse.json({ error: "Rental duration cannot exceed 180 days" }, { status: 400 })
  }

  // Look up actual prices server-side to prevent price manipulation
  const productIds = [...new Set(data.items.map((i) => i.productId))]
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { pricingTiers: true },
  })
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  // Validate all products exist
  const missingProduct = data.items.find((i) => !productMap[i.productId])
  if (missingProduct) {
    return NextResponse.json({ error: "One or more products not found" }, { status: 400 })
  }

  const itemsWithPrices = data.items.map((item) => ({
    productId: item.productId,
    size: item.size,
    quantity: item.quantity,
    unitPrice: getBestPrice(productMap[item.productId].pricingTiers, rentalDays),
  }))

  // Availability check — handles individual products AND packages (via component stock)
  const conflict = await checkAvailability(prisma as any, itemsWithPrices, start, end)
  if (conflict) {
    return NextResponse.json({ error: conflict }, { status: 409 })
  }

  // Upsert customer by email
  let customer = await prisma.customer.findFirst({
    where: { email: data.customer.email },
  })
  if (!customer) {
    customer = await prisma.customer.create({ data: data.customer })
  }

  const subtotal = itemsWithPrices.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const { discountAmount, discountPercent } = applyDiscount(subtotal, data.discountCode)

  const booking = await prisma.booking.create({
    data: {
      bookingNumber: generateBookingNumber(),
      customerId: customer.id,
      status: "PENDING",
      startDate: start,
      endDate: end,
      subtotal,
      discountCode: discountPercent > 0 ? data.discountCode?.toUpperCase().trim() : null,
      discountAmount,
      height: data.height,
      weight: data.weight,
      bootSize: data.bootSize,
      skillLevel: data.skillLevel,
      notes: data.notes,
      items: {
        create: itemsWithPrices,
      },
    },
    include: { customer: true, items: { include: { product: true } } },
  })

  // Send confirmation email (non-blocking — never throws)
  await sendBookingConfirmation({
    bookingNumber: booking.bookingNumber,
    customer: booking.customer,
    startDate: booking.startDate,
    endDate: booking.endDate,
    items: booking.items.map((i) => ({
      productName: i.product.name,
      size: i.size,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    subtotal: booking.subtotal,
    discountCode: booking.discountCode,
    discountAmount: booking.discountAmount,
    notes: booking.notes,
  })

  return NextResponse.json({ ...booking, discountApplied: discountPercent > 0, discountPercent }, { status: 201 })
}
