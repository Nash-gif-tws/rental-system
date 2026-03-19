import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const CreateProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  isPackage: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const products = await prisma.product.findMany({
    include: {
      category: true,
      pricingTiers: { orderBy: { days: "asc" } },
      _count: { select: { units: true } },
      packageItems: { include: { product: true } },
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  })

  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let data
  try {
    data = CreateProductSchema.parse(await req.json())
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  try {
    const product = await prisma.product.create({
      data,
      include: { category: true },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "A product with that slug already exists" }, { status: 409 })
    }
    throw e
  }
}