import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const UpdateUnitSchema = z.object({
  serialNumber: z.string().optional(),
  size: z.string().optional(),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "NEEDS_SERVICE", "RETIRED"]).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  let data
  try {
    data = UpdateUnitSchema.parse(await req.json())
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  const unit = await prisma.equipmentUnit.update({
    where: { id },
    data,
    include: { product: true },
  })
  return NextResponse.json(unit)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.equipmentUnit.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
