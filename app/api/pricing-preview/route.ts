import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Key packages to show in the pricing preview, in display order
const PREVIEW_SLUGS = [
  { slug: "mens-ski-package",        label: "Adult Ski Package",         group: "Ski Packages" },
  { slug: "kids-ski-package",        label: "Kids Ski Package",          group: "Ski Packages" },
  { slug: "mens-snowboard-package",  label: "Adult Snowboard Package",   group: "Snowboard Packages" },
  { slug: "kids-snowboard-package",  label: "Kids Snowboard Package",    group: "Snowboard Packages" },
  { slug: "mens-burton-stepon-package", label: "Burton Step-On Package", group: "Snowboard Packages" },
  { slug: "mens-outerwear-package",  label: "Adult Outerwear Package",   group: "Outerwear" },
  { slug: "kids-outerwear-package",  label: "Kids Outerwear Package",    group: "Outerwear" },
  { slug: "helmet",                  label: "Helmet",                    group: "Add-ons" },
  { slug: "adult-skis",              label: "Skis only",                 group: "Add-ons" },
]

function getBestPrice(
  tiers: { days: number; price: number; isActive: boolean }[],
  rentalDays: number
): number | null {
  const active = tiers.filter((t) => t.isActive)
  if (!active.length) return null
  const sorted = [...active].sort((a, b) => a.days - b.days)
  return sorted.find((t) => t.days >= rentalDays)?.price ?? sorted[sorted.length - 1].price
}

export async function GET(req: NextRequest) {
  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "1")
  if (isNaN(days) || days < 1) {
    return NextResponse.json({ error: "Invalid days" }, { status: 400 })
  }

  const slugs = PREVIEW_SLUGS.map((p) => p.slug)
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, isActive: true },
    include: { pricingTiers: { where: { isActive: true } } },
  })

  const productBySlug = Object.fromEntries(products.map((p) => [p.slug, p]))

  // Build grouped result in display order
  const groups: Record<string, { label: string; price: number; slug: string }[]> = {}

  for (const { slug, label, group } of PREVIEW_SLUGS) {
    const product = productBySlug[slug]
    if (!product) continue
    const price = getBestPrice(product.pricingTiers, days)
    if (price === null) continue
    if (!groups[group]) groups[group] = []
    groups[group].push({ slug, label, price })
  }

  return NextResponse.json(
    Object.entries(groups).map(([group, items]) => ({ group, items })),
    { headers: { "Cache-Control": "public, max-age=300" } }
  )
}
