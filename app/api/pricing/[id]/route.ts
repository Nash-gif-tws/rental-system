import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.pricingTier.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  let isActive: boolean
  try {
    const body = await req.json()
    if (typeof body.isActive !== "boolean") throw new Error("isActive must be a boolean")
    isActive = body.isActive
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
  const tier = await prisma.pricingTier.update({ where: { id }, data: { isActive } })
  return NextResponse.json(tier)
}
