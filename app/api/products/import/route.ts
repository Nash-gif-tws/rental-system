import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const RowSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  type: z.enum(["package", "item"]),
  price_5day: z.coerce.number().min(0),
  price_10day: z.coerce.number().min(0),
  price_season: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  active: z.string().optional(),
})

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.rows || !Array.isArray(body.rows)) {
    return NextResponse.json({ error: "Expected { rows: [...] }" }, { status: 400 })
  }

  const mode: "replace" | "merge" = body.mode === "replace" ? "replace" : "merge"
  const rows = body.rows as unknown[]

  const results: { row: number; name: string; status: "created" | "updated" | "skipped" | "error"; message?: string }[] = []

  // Validate all rows first
  const parsed: z.infer<typeof RowSchema>[] = []
  for (let i = 0; i < rows.length; i++) {
    const p = RowSchema.safeParse(rows[i])
    if (!p.success) {
      results.push({ row: i + 1, name: String((rows[i] as any)?.name ?? "?"), status: "error", message: p.error.issues[0].message })
    } else {
      parsed.push(p.data)
    }
  }

  if (results.some((r) => r.status === "error")) {
    return NextResponse.json({ ok: false, results }, { status: 422 })
  }

  // In replace mode: deactivate all existing products (don't delete — preserve booking history)
  if (mode === "replace") {
    await prisma.product.updateMany({ data: { isActive: false } })
  }

  // Upsert categories
  const categoryNames = [...new Set(parsed.map((r) => r.category))]
  const categoryMap: Record<string, string> = {}
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { slug: slugify(name) },
      create: { name, slug: slugify(name) },
      update: { name },
    })
    categoryMap[name] = cat.id
  }

  // Upsert products
  for (let i = 0; i < parsed.length; i++) {
    const row = parsed[i]
    const slug = slugify(row.name)
    const isActive = row.active ? !["false", "no", "0", "inactive"].includes(row.active.toLowerCase()) : true

    try {
      const existing = await prisma.product.findUnique({ where: { slug } })

      if (existing) {
        // Update existing
        await prisma.product.update({
          where: { slug },
          data: {
            name: row.name,
            categoryId: categoryMap[row.category],
            isPackage: row.type === "package",
            isActive,
            description: row.description ?? null,
          },
        })
        // Replace pricing tiers
        await prisma.pricingTier.deleteMany({ where: { productId: existing.id } })
        await createPricingTiers(existing.id, row)
        results.push({ row: i + 1, name: row.name, status: "updated" })
      } else {
        // Create new
        const product = await prisma.product.create({
          data: {
            name: row.name,
            slug,
            categoryId: categoryMap[row.category],
            isPackage: row.type === "package",
            isActive,
            description: row.description ?? null,
          },
        })
        await createPricingTiers(product.id, row)
        results.push({ row: i + 1, name: row.name, status: "created" })
      }
    } catch (err: any) {
      results.push({ row: i + 1, name: row.name, status: "error", message: err.message })
    }
  }

  const counts = {
    created: results.filter((r) => r.status === "created").length,
    updated: results.filter((r) => r.status === "updated").length,
    errors: results.filter((r) => r.status === "error").length,
  }

  return NextResponse.json({ ok: counts.errors === 0, counts, results })
}

async function createPricingTiers(productId: string, row: z.infer<typeof RowSchema>) {
  const tiers = [
    { label: "1–5 days", days: 5, price: row.price_5day },
    { label: "6–10 days", days: 10, price: row.price_10day },
  ]
  if (row.price_season && row.price_season > 0) {
    tiers.push({ label: "Season", days: 90, price: row.price_season })
  }
  await prisma.pricingTier.createMany({
    data: tiers.map((t) => ({ ...t, productId, isActive: true })),
  })
}
