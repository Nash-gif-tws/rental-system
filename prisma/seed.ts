import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Admin user
  const password = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { email: "admin@snowskiers.com.au" },
    update: {},
    create: {
      email: "admin@snowskiers.com.au",
      name: "Admin",
      password,
      role: "ADMIN",
    },
  })

  // Categories
  const [skis, snowboards, boots, clothing, accessories] = await Promise.all([
    prisma.category.upsert({
      where: { slug: "skis" },
      update: {},
      create: { name: "Skis", slug: "skis" },
    }),
    prisma.category.upsert({
      where: { slug: "snowboards" },
      update: {},
      create: { name: "Snowboards", slug: "snowboards" },
    }),
    prisma.category.upsert({
      where: { slug: "boots" },
      update: {},
      create: { name: "Boots", slug: "boots" },
    }),
    prisma.category.upsert({
      where: { slug: "clothing" },
      update: {},
      create: { name: "Clothing", slug: "clothing" },
    }),
    prisma.category.upsert({
      where: { slug: "accessories" },
      update: {},
      create: { name: "Accessories", slug: "accessories" },
    }),
  ])

  // Products with pricing tiers
  const productData = [
    {
      name: "Adult Ski Package",
      slug: "adult-ski-package",
      categoryId: skis.id,
      isPackage: true,
      tiers: [
        { label: "1 Day", days: 1, price: 55 },
        { label: "2 Days", days: 2, price: 95 },
        { label: "3 Days", days: 3, price: 130 },
        { label: "Week", days: 7, price: 250 },
      ],
    },
    {
      name: "Junior Ski Package",
      slug: "junior-ski-package",
      categoryId: skis.id,
      isPackage: true,
      tiers: [
        { label: "1 Day", days: 1, price: 40 },
        { label: "2 Days", days: 2, price: 70 },
        { label: "3 Days", days: 3, price: 95 },
        { label: "Week", days: 7, price: 180 },
      ],
    },
    {
      name: "Adult Snowboard Package",
      slug: "adult-snowboard-package",
      categoryId: snowboards.id,
      isPackage: true,
      tiers: [
        { label: "1 Day", days: 1, price: 60 },
        { label: "2 Days", days: 2, price: 105 },
        { label: "3 Days", days: 3, price: 145 },
        { label: "Week", days: 7, price: 270 },
      ],
    },
    {
      name: "Junior Snowboard Package",
      slug: "junior-snowboard-package",
      categoryId: snowboards.id,
      isPackage: true,
      tiers: [
        { label: "1 Day", days: 1, price: 45 },
        { label: "2 Days", days: 2, price: 80 },
        { label: "3 Days", days: 3, price: 110 },
        { label: "Week", days: 7, price: 200 },
      ],
    },
    {
      name: "Ski Boots",
      slug: "ski-boots",
      categoryId: boots.id,
      tiers: [
        { label: "1 Day", days: 1, price: 20 },
        { label: "2 Days", days: 2, price: 35 },
        { label: "3 Days", days: 3, price: 45 },
        { label: "Week", days: 7, price: 80 },
      ],
    },
    {
      name: "Snowboard Boots",
      slug: "snowboard-boots",
      categoryId: boots.id,
      tiers: [
        { label: "1 Day", days: 1, price: 20 },
        { label: "2 Days", days: 2, price: 35 },
        { label: "3 Days", days: 3, price: 45 },
        { label: "Week", days: 7, price: 80 },
      ],
    },
    {
      name: "Ski Jacket",
      slug: "ski-jacket",
      categoryId: clothing.id,
      tiers: [
        { label: "1 Day", days: 1, price: 25 },
        { label: "2 Days", days: 2, price: 40 },
        { label: "3 Days", days: 3, price: 55 },
        { label: "Week", days: 7, price: 100 },
      ],
    },
    {
      name: "Ski Pants",
      slug: "ski-pants",
      categoryId: clothing.id,
      tiers: [
        { label: "1 Day", days: 1, price: 20 },
        { label: "2 Days", days: 2, price: 35 },
        { label: "3 Days", days: 3, price: 45 },
        { label: "Week", days: 7, price: 80 },
      ],
    },
    {
      name: "Helmet",
      slug: "helmet",
      categoryId: accessories.id,
      tiers: [
        { label: "1 Day", days: 1, price: 15 },
        { label: "2 Days", days: 2, price: 25 },
        { label: "3 Days", days: 3, price: 35 },
        { label: "Week", days: 7, price: 60 },
      ],
    },
    {
      name: "Goggles",
      slug: "goggles",
      categoryId: accessories.id,
      tiers: [
        { label: "1 Day", days: 1, price: 10 },
        { label: "2 Days", days: 2, price: 18 },
        { label: "3 Days", days: 3, price: 25 },
        { label: "Week", days: 7, price: 45 },
      ],
    },
  ]

  for (const { tiers, ...productFields } of productData) {
    const product = await prisma.product.upsert({
      where: { slug: productFields.slug },
      update: {},
      create: productFields,
    })

    // Add pricing tiers if not exist
    const existing = await prisma.pricingTier.count({ where: { productId: product.id } })
    if (existing === 0) {
      await prisma.pricingTier.createMany({
        data: tiers.map((t) => ({ ...t, productId: product.id })),
      })
    }
  }

  console.log("✅ Seed complete")
  console.log("   Admin login: admin@snowskiers.com.au / admin123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
