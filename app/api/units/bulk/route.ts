import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { ids, updates } = await req.json()
  if (!Array.isArray(ids) || !ids.length) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (updates.isActive !== undefined) data.isActive = updates.isActive
  if (updates.condition !== undefined) data.condition = updates.condition

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "No valid updates" }, { status: 400 })
  }

  await prisma.equipmentUnit.updateMany({ where: { id: { in: ids } }, data })
  return NextResponse.json({ updated: ids.length })
}
