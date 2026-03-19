import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const CreateTierSchema = z.object({
  label: z.string().min(1),
  days: z.number().int().positive(),
  price: z.number().positive(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  let data
  try {
    data = CreateTierSchema.parse(await req.json())
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  const tier = await prisma.pricingTier.create({
    data: { ...data, productId: id },
  })

  return NextResponse.json(tier, { status: 201 })
}
