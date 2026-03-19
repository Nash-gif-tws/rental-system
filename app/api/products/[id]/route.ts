import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  isPackage: z.boolean().optional(),
  isActive: z.boolean().optional(),
  packageItemIds: z.array(z.string()).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      pricingTiers: { orderBy: { days: "asc" } },
      units: { where: { isActive: true }, orderBy: [{ size: "asc" }] },
      packageItems: { include: { product: { include: { category: true } } } },
    },
  })

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  let data
  try {
    data = UpdateProductSchema.parse(await req.json())
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  const { packageItemIds, ...productData } = data

  const product = await prisma.$transaction(async (tx) => {
    if (packageItemIds !== undefined) {
      await tx.packageItem.deleteMany({ where: { packageId: id } })
      if (packageItemIds.length > 0) {
        await tx.packageItem.createMany({
          data: packageItemIds.map((productId) => ({ packageId: id, productId })),
        })
      }
    }
    return tx.product.update({
      where: { id },
      data: productData,
      include: {
        category: true,
        pricingTiers: { orderBy: { days: "asc" } },
        units: { where: { isActive: true } },
        packageItems: { include: { product: { include: { category: true } } } },
      },
    })
  })

  return NextResponse.json(product)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await prisma.product.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
