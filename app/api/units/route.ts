import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const CreateUnitSchema = z.object({
  productId: z.string().min(1),
  serialNumber: z.string().optional(),
  size: z.string().optional(),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "NEEDS_SERVICE", "RETIRED"]).default("GOOD"),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let data
  try {
    data = CreateUnitSchema.parse(await req.json())
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  try {
    const unit = await prisma.equipmentUnit.create({
      data,
      include: { product: true },
    })
    return NextResponse.json(unit, { status: 201 })
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "A unit with that serial number already exists" }, { status: 409 })
    }
    throw e
  }
}
