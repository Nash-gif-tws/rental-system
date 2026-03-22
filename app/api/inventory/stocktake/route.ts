import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const RowSchema = z.object({
  product: z.string().min(1),   // product name or slug
  size: z.string().optional(),
  quantity: z.coerce.number().int().min(0).max(2000),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "NEEDS_SERVICE"]).default("GOOD"),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.rows || !Array.isArray(body.rows)) {
    return NextResponse.json({ error: "Expected { rows: [...], clearFirst?: boolean }" }, { status: 400 })
  }

  const clearFirst: boolean = body.clearFirst === true
  const rows = body.rows as unknown[]

  // Validate all rows
  const results: { row: number; product: string; status: "ok" | "error"; created?: number; message?: string }[] = []
  const parsed: z.infer<typeof RowSchema>[] = []

  for (let i = 0; i < rows.length; i++) {
    const p = RowSchema.safeParse(rows[i])
    if (!p.success) {
      results.push({ row: i + 1, product: String((rows[i] as any)?.product ?? "?"), status: "error", message: p.error.issues[0].message })
    } else {
      parsed.push(p.data)
    }
  }

  if (results.some((r) => r.status === "error")) {
    return NextResponse.json({ ok: false, results }, { status: 422 })
  }

  // Build product lookup: name/slug → id
  const productLookups = [...new Set(parsed.map((r) => r.product.toLowerCase().trim()))]
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
  })
  const productBySlug = Object.fromEntries(allProducts.map((p) => [p.slug, p]))
  const productByName = Object.fromEntries(allProducts.map((p) => [p.name.toLowerCase(), p]))

  function findProduct(identifier: string) {
    const slug = identifier.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    return productBySlug[slug] ?? productByName[identifier.toLowerCase()] ?? null
  }

  // Validate all products exist before touching DB
  const missingProducts: string[] = []
  for (const lookup of productLookups) {
    if (!findProduct(lookup)) missingProducts.push(lookup)
  }
  if (missingProducts.length > 0) {
    return NextResponse.json({
      ok: false,
      error: `Products not found: ${missingProducts.join(", ")}`,
      results: [],
    }, { status: 422 })
  }

  // Optionally clear existing units for products in this import
  if (clearFirst) {
    const productIds = [...new Set(parsed.map((r) => findProduct(r.product)!.id))]
    // Only delete units not currently assigned to an active booking
    const activeUnitIds = await prisma.bookingItem
      .findMany({
        where: {
          unitId: { not: null },
          booking: { status: { in: ["CONFIRMED", "CHECKED_OUT", "PENDING"] } },
        },
        select: { unitId: true },
      })
      .then((items) => new Set(items.map((i) => i.unitId!)))

    await prisma.equipmentUnit.deleteMany({
      where: {
        productId: { in: productIds },
        id: { notIn: [...activeUnitIds] }, // never delete units on active bookings
      },
    })
  }

  // Create units in bulk
  let totalCreated = 0
  for (let i = 0; i < parsed.length; i++) {
    const row = parsed[i]
    if (row.quantity === 0) {
      results.push({ row: i + 1, product: row.product, status: "ok", created: 0 })
      continue
    }

    const product = findProduct(row.product)!

    try {
      await prisma.equipmentUnit.createMany({
        data: Array.from({ length: row.quantity }, () => ({
          productId: product.id,
          size: row.size || null,
          condition: row.condition,
          notes: row.notes || null,
          isActive: true,
        })),
      })
      totalCreated += row.quantity
      results.push({ row: i + 1, product: row.product, status: "ok", created: row.quantity })
    } catch (err: any) {
      results.push({ row: i + 1, product: row.product, status: "error", message: err.message })
    }
  }

  return NextResponse.json({
    ok: results.every((r) => r.status === "ok"),
    totalCreated,
    results,
  })
}
