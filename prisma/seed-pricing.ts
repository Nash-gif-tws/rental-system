import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// days: 5 = "1-5 Days", 10 = "6-10 Days", 90 = "Season"
type Tier = { label: string; days: number; price: number }

const t15 = (price: number): Tier => ({ label: "1-5 Days", days: 5, price })
const t610 = (price: number): Tier => ({ label: "6-10 Days", days: 10, price })
const tSeason = (price: number): Tier => ({ label: "Season", days: 90, price })

// Reusable tier sets
const recSki = [t15(100), t610(130), tSeason(450)]
const exDemoSki = [t15(130), t610(160)]
const demoSki = [t15(160), t610(200)]
const kidsSkis = [t15(50), t610(60)]

const recBoard = [t15(100), t610(120), tSeason(450)]
const exDemoBoard = [t15(130), t610(160)]
const demoBoard = [t15(160), t610(200)]
const kidsBoard = [t15(60), t610(70)]
const kidsDemoBoard = [t15(80), t610(100)]

const adultSkiBoot = [t15(50), t610(60)]
const kidsSkiBoot = [t15(30), t610(40)]
const adultBoardBoot = [t15(60), t610(70)]
const stepOnBoot = [t15(80), t610(100)]
const kidsBoardBoot = [t15(30), t610(35)]

const adultJacket = [t15(50), t610(60)]
const adultPants = [t15(40), t610(50)]
const kidsJacket = [t15(30), t610(35)]
const kidsPants = [t15(25), t610(30)]
const kidsOnePiece = [t15(35), t610(40)]

const PRICING: Record<string, Tier[]> = {
  // ── Hardware Packages ────────────────────────────────────────────────────────
  "mens-ski-package": [t15(135), t610(160), tSeason(550)],
  "womens-ski-package": [t15(135), t610(160), tSeason(550)],
  "kids-ski-package": [t15(70), t610(85), tSeason(300)],
  "mens-snowboard-package": [t15(130), t610(160), tSeason(550)],
  "womens-snowboard-package": [t15(130), t610(160), tSeason(550)],
  "kids-snowboard-package": [t15(75), t610(90), tSeason(275)],
  "mens-burton-stepon-package": [t15(170), t610(200), tSeason(650)],
  "womens-burton-stepon-package": [t15(170), t610(200), tSeason(650)],

  // ── Outerwear Packages ───────────────────────────────────────────────────────
  "mens-outerwear-package": [t15(80), t610(95), tSeason(300)],
  "womens-outerwear-package": [t15(80), t610(95), tSeason(300)],
  "kids-outerwear-package": [t15(45), t610(60), tSeason(200)],

  // ── Skis (fleet categories) ──────────────────────────────────────────────────
  "adult-skis": recSki,
  "kids-skis": kidsSkis,

  // ── Individual ski models → demo pricing ─────────────────────────────────────
  "ski-bent-24": demoSki,
  "ski-brahma-24": demoSki,
  "ski-wingman82ti-24": demoSki,
  "ski-wingman86ti-21": exDemoSki,
  "ski-wingman86ti-24": demoSki,
  "ski-ripstick88-24": demoSki,
  "ski-ripstick88w-20": exDemoSki,
  "ski-ripstick88w-22": exDemoSki,
  "ski-ripstick-94w-24": demoSki,
  "ski-ripstick96-22": exDemoSki,
  "ski-mindbender90w-24": demoSki,
  "ski-santa-ana-24": demoSki,
  "ski-experience84-22": exDemoSki,
  "ski-experience84w-21": exDemoSki,
  "ski-addikt-24": demoSki,
  "ski-kendo-24": demoSki,
  "ski-kenja-2020": exDemoSki,
  "ski-revolt104": demoSki,
  "ski-revolt95-23": exDemoSki,
  "ski-revolt96-24": demoSki,
  "ski-yumi-23": demoSki,

  // ── Snowboards (fleet categories) ────────────────────────────────────────────
  "mens-snowboards": recBoard,
  "womens-snowboards": recBoard,
  "kids-snowboards": kidsBoard,

  // ── Individual snowboard models → demo pricing ───────────────────────────────
  "board-cadence-24": demoBoard,
  "board-carter-24": demoBoard,
  "board-cheater-24": demoBoard,
  "board-coda-24": demoBoard,
  "board-westmark-24": demoBoard,
  "board-cartographer-22": exDemoBoard,
  "board-custom-25": demoBoard,
  "board-customfv-22": exDemoBoard,
  "board-customfv-23": exDemoBoard,
  "board-custom-k-22": exDemoBoard,
  "board-customx-23": demoBoard,
  "board-deepthinker-23": demoBoard,
  "board-feelgood-fv-22": exDemoBoard,
  "board-feelgoodsmalls-22": kidsDemoBoard,
  "board-f-attendant-23": demoBoard,
  "board-goodcompany-23": demoBoard,
  "board-instigator-21": exDemoBoard,
  "board-namedropper-23": demoBoard,
  "board-processfv-23": demoBoard,
  "board-process-k": kidsDemoBoard,
  "board-rewind-2022": exDemoBoard,
  "board-rewind-23": exDemoBoard,
  "board-skeletonkey-23": demoBoard,
  "board-storyboard23": demoBoard,
  "board-storyboard-23": demoBoard,
  "board-talent-22": exDemoBoard,
  "board-talentscout-23": demoBoard,
  "board-yeasayer-22": exDemoBoard,
  "board-yeasayer-23": demoBoard,
  "board-yeasayerfv-23": demoBoard,
  "board-birds-22": exDemoBoard,
  "board-birds-24": demoBoard,
  "board-pathfinder-21": exDemoBoard,
  "board-ultrafear-23": demoBoard,
  "board-headspace-24": demoBoard,
  "board-huckpro-22": exDemoBoard,
  "board-nodrama-24": demoBoard,
  "board-atv-24": demoBoard,
  "board-beast-2023": exDemoBoard,
  "board-nomad-23": demoBoard,
  "board-volta-23": demoBoard,
  "board-warpig-25": demoBoard,
  "board-stale-23": exDemoBoard,
  "board-basic-23": exDemoBoard,

  // ── Ski Boots ────────────────────────────────────────────────────────────────
  "ski-boots": adultSkiBoot,
  "mens-ski-boots": adultSkiBoot,
  "womens-ski-boots": adultSkiBoot,
  "kids-ski-boots": kidsSkiBoot,

  // ── Snowboard Boots ──────────────────────────────────────────────────────────
  "snowboard-boots": adultBoardBoot,
  "mens-snowboard-boots": adultBoardBoot,
  "womens-snowboard-boots": adultBoardBoot,
  "mens-stepon-boots": stepOnBoot,
  "womens-stepon-boots": stepOnBoot,
  "kids-snowboard-boots": kidsBoardBoot,

  // ── Adult Outerwear ──────────────────────────────────────────────────────────
  "ski-jacket": adultJacket,
  "mens-jackets": adultJacket,
  "womens-jackets": adultJacket,
  "ski-pants": adultPants,
  "mens-pants": adultPants,
  "womens-pants": adultPants,

  // ── Kids Outerwear ───────────────────────────────────────────────────────────
  "kids-boys-jackets": kidsJacket,
  "kids-girls-jackets": kidsJacket,
  "kids-pants": kidsPants,
  "kids-snowsuits": kidsOnePiece,

  // ── Accessories ──────────────────────────────────────────────────────────────
  "helmet": [t15(25), t610(30)],
  "helmets": [t15(25), t610(30)],
  "ski-poles": [t15(10), t610(15)],
}

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, slug: true, name: true } })
  console.log(`Found ${products.length} products in DB\n`)

  const slugMap = new Map(products.map((p) => [p.slug, p.id]))

  let matched = 0
  const skipped: string[] = []

  for (const [slug, tiers] of Object.entries(PRICING)) {
    const productId = slugMap.get(slug)
    if (!productId) {
      skipped.push(slug)
      continue
    }

    await prisma.pricingTier.deleteMany({ where: { productId } })
    await prisma.pricingTier.createMany({
      data: tiers.map((t) => ({ productId, label: t.label, days: t.days, price: t.price, isActive: true })),
    })

    console.log(`✓ ${slug} (${tiers.map((t) => `$${t.price}`).join(" / ")})`)
    matched++
  }

  console.log(`\nDone. ${matched} products updated.`)
  if (skipped.length > 0) {
    console.log(`Skipped (not in DB): ${skipped.join(", ")}`)
  }

  // Report any DB products that got no pricing
  const noPricing: string[] = []
  for (const p of products) {
    const count = await prisma.pricingTier.count({ where: { productId: p.id, isActive: true } })
    if (count === 0) noPricing.push(`${p.slug} (${p.name})`)
  }
  if (noPricing.length > 0) {
    console.log(`\nProducts with NO active pricing tiers:`)
    noPricing.forEach((s) => console.log(`  - ${s}`))
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
