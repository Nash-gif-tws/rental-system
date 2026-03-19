/**
 * Import Rentle (Twice) inventory into the rental system database.
 * Run with: npx tsx prisma/import-rentle.ts
 *
 * Reads: /c/Users/troja/Downloads/rentle_articles_separated.txt
 * Creates: Products, PricingTiers, EquipmentUnits
 */

import { PrismaClient, Condition } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

// ─── Types ───────────────────────────────────────────────────────────────────

interface RentleRecord {
  internalId: string
  articleId: string
  skuCode: string
  skuName: string
  status: string
  trackedIndividually: boolean
  quantity: number
  currentState: string
}

interface ProductDef {
  name: string
  slug: string
  categorySlug: string
  tiers: { label: string; days: number; price: number }[]
}

// ─── SKU Mapping ──────────────────────────────────────────────────────────────

/**
 * Returns { productSlug, size } from a Rentle SKU code and name.
 * productSlug is the "base" product key (without size suffix).
 * size is the human-readable size string.
 */
function parseSkuCode(skuCode: string, skuName: string): { productSlug: string; size: string | null } {
  // ── Base rental fleet ──

  // Kids skis: SKI-K-70, SKI-K-100, ..., SKI-K-150
  if (/^SKI-K-(\d+)$/.test(skuCode)) {
    const m = skuCode.match(/^SKI-K-(\d+)$/)!
    return { productSlug: "kids-skis", size: `${m[1]}cm` }
  }

  // Adult skis: SKI-142, SKI-149, SKI-156, SKI-163, SKI-170
  if (/^SKI-(\d+)$/.test(skuCode)) {
    const m = skuCode.match(/^SKI-(\d+)$/)!
    return { productSlug: "adult-skis", size: `${m[1]}cm` }
  }

  // Kids snowboards: SNBD-K-*
  if (/^SNBD-K-(\d+)$/.test(skuCode)) {
    const m = skuCode.match(/^SNBD-K-(\d+)$/)!
    return { productSlug: "kids-snowboards", size: `${m[1]}cm` }
  }

  // Mens snowboards: SNBD-M-*
  if (/^SNBD-M-(\d+)(W?)$/.test(skuCode)) {
    const m = skuCode.match(/^SNBD-M-(\d+)(W?)$/)!
    return { productSlug: "mens-snowboards", size: `${m[1]}${m[2] ? "W" : ""}cm` }
  }

  // Womens snowboards: SNBD-L-* (L = Ladies)
  if (/^SNBD-L-(\d+)$/.test(skuCode)) {
    const m = skuCode.match(/^SNBD-L-(\d+)$/)!
    return { productSlug: "womens-snowboards", size: `${m[1]}cm` }
  }

  // Kids ski boots: SKIBOOT-K-* (size in mondopoint e.g. 165 = 16.5)
  if (/^SKIBOOT-K-(\d+)$/.test(skuCode)) {
    const m = skuCode.match(/^SKIBOOT-K-(\d+)$/)!
    return { productSlug: "kids-ski-boots", size: formatBootSize(m[1]) }
  }

  // Mens ski boots: SKIBOOT-M-*
  if (/^SKIBOOT-M-(\d+)$/.test(skuCode)) {
    const m = skuCode.match(/^SKIBOOT-M-(\d+)$/)!
    return { productSlug: "mens-ski-boots", size: formatBootSize(m[1]) }
  }

  // Womens ski boots: SKIBOOT-W-*
  if (/^SKIBOOT-W-(\d+)$/.test(skuCode)) {
    const m = skuCode.match(/^SKIBOOT-W-(\d+)$/)!
    return { productSlug: "womens-ski-boots", size: formatBootSize(m[1]) }
  }

  // Kids snowboard boots: SNBDBOOT-K-* (kids use K for kids sizes, C for cm)
  if (/^SNBDBOOT-K-(\d+[KC]?)$/.test(skuCode)) {
    const m = skuCode.match(/^SNBDBOOT-K-(.+)$/)!
    return { productSlug: "kids-snowboard-boots", size: formatSnbdBootSize(m[1]) }
  }

  // Mens snowboard boots: SNBDBOOT-M-*
  if (/^SNBDBOOT-M-(\d+)$/.test(skuCode)) {
    const m = skuCode.match(/^SNBDBOOT-M-(\d+)$/)!
    return { productSlug: "mens-snowboard-boots", size: `US ${m[1]}` }
  }

  // Womens snowboard boots: SNBDBOOT-W-*
  if (/^SNBDBOOT-W-(\d+)$/.test(skuCode)) {
    const m = skuCode.match(/^SNBDBOOT-W-(\d+)$/)!
    return { productSlug: "womens-snowboard-boots", size: `US ${m[1]}` }
  }

  // Mens Step-On boots: M-STEPON-*
  if (/^M-STEPON-(\d+)$/.test(skuCode)) {
    const m = skuCode.match(/^M-STEPON-(\d+)$/)!
    return { productSlug: "mens-stepon-boots", size: `US ${m[1]}` }
  }

  // Womens Step-On boots: W-STEPON-*
  if (/^W-STEPON-(\d+)$/.test(skuCode)) {
    const m = skuCode.match(/^W-STEPON-(\d+)$/)!
    return { productSlug: "womens-stepon-boots", size: `US ${m[1]}` }
  }

  // Helmets: HELMET-XS, HELMET-S, HELMET-M, HELMET-L, HELMET-XL
  if (/^HELMET-([A-Z]+)$/.test(skuCode)) {
    const m = skuCode.match(/^HELMET-([A-Z]+)$/)!
    return { productSlug: "helmets", size: m[1] }
  }

  // Mens jackets: M-JACKET-*
  if (/^M-JACKET-(.+)$/.test(skuCode)) {
    const m = skuCode.match(/^M-JACKET-(.+)$/)!
    return { productSlug: "mens-jackets", size: m[1] }
  }

  // Womens jackets: W-JACKET-*
  if (/^W-JACKET-(.+)$/.test(skuCode)) {
    const m = skuCode.match(/^W-JACKET-(.+)$/)!
    return { productSlug: "womens-jackets", size: m[1] }
  }

  // Kids boys jackets: K-JACKET-B-*
  if (/^K-JACKET-B-(.+)$/.test(skuCode)) {
    const m = skuCode.match(/^K-JACKET-B-(.+)$/)!
    return { productSlug: "kids-boys-jackets", size: m[1] }
  }

  // Kids girls jackets: K-JACKET-G-*
  if (/^K-JACKET-G-(.+)$/.test(skuCode)) {
    const m = skuCode.match(/^K-JACKET-G-(.+)$/)!
    return { productSlug: "kids-girls-jackets", size: m[1] }
  }

  // Mens pants: M-PANT-*
  if (/^M-PANT-(.+)$/.test(skuCode)) {
    const m = skuCode.match(/^M-PANT-(.+)$/)!
    return { productSlug: "mens-pants", size: m[1] }
  }

  // Womens pants: W-PANT-*
  if (/^W-PANT-(.+)$/.test(skuCode)) {
    const m = skuCode.match(/^W-PANT-(.+)$/)!
    return { productSlug: "womens-pants", size: m[1] }
  }

  // Womens pants alt SKU: WO-PA-*
  if (/^WO-PA-(.+)$/.test(skuCode)) {
    const m = skuCode.match(/^WO-PA-(.+)$/)!
    return { productSlug: "womens-pants", size: m[1] }
  }

  // Kids pants: K-PANT-*
  if (/^K-PANT-(.+)$/.test(skuCode)) {
    const m = skuCode.match(/^K-PANT-(.+)$/)!
    return { productSlug: "kids-pants", size: m[1] }
  }

  // Kids snowsuits (1-piece): K-SUITS-*
  if (/^K-SUITS-(.+)$/.test(skuCode)) {
    const m = skuCode.match(/^K-SUITS-(.+)$/)!
    // e.g. K-SUITS-1-BLACK → size "1 Black", K-SUITS-12-PINK → "1.5 Pink"
    const parts = m[1].split("-")
    const sizeNum = parts[0] === "12" ? "1.5" : parts[0]
    const color = parts.slice(1).map(p => p.charAt(0) + p.slice(1).toLowerCase()).join(" ")
    return { productSlug: "kids-snowsuits", size: color ? `${sizeNum} ${color}` : sizeNum }
  }

  // Ski poles: POLE-*
  if (/^POLE-(\d+)$/.test(skuCode)) {
    const m = skuCode.match(/^POLE-(\d+)$/)!
    return { productSlug: "ski-poles", size: `${m[1]}cm` }
  }

  // ── Brand-specific skis ──
  const brandSkis: Record<string, string> = {
    "BENT-24": "Atomic Bent Chetler 90 2024",
    "BRAHMA-24": "Blizzard Brahma 88 2024",
    "KENDO-24": "Volkl Kendo 88 2024",
    "KENJA-2020": "Volkl Kenja 88 2020",
    "EXPERIENCE84-22": "Rossignol Experience 84 Ai 2022",
    "EXPERIENCE84W-21": "Rossignol Experience 84 Ai W 2021",
    "MINDBENDER90W-24": "K2 Mindbender 90W 2024",
    "REVOLT104": "Volkl Revolt 104 2024",
    "REVOLT95-23": "Volkl Revolt 95 2023",
    "REVOLT96-24": "Volkl Revolt 96 2024",
    "RIPSTICK88-24": "Elan Ripstick 88 2024",
    "RIPSTICK88W-20": "Elan Ripstick 88W 2020",
    "RIPSTICK88W-22": "Elan Ripstick 88W 2022",
    "RIPSTICK96-22": "Elan Ripstick 96 2022",
    "RIPSTICK-94W-24": "Elan Ripstick 94W 2024",
    "ADDIKT-24": "Salomon Addikt Pro 72 2024",
    "SANTA-ANA-24": "Nordica Santa Ana 88 2024",
    "WINGMAN82TI-24": "Blizzard Wingman 82 Ti 2024",
    "WINGMAN86TI-21": "Blizzard Wingman 86 Ti 2021",
    "WINGMAN86TI-24": "Blizzard Wingman 86 Ti 2024",
    "YUMI-23": "Volkl Yumi 84 2023",
  }

  // ── Brand-specific snowboards ──
  const brandBoards: Record<string, string> = {
    "ATV-24": "Sims ATV Pro 2024",
    "BASIC-23": "YES Basic 2023",
    "BEAST-2023": "Nitro Beast 2023",
    "BIRDS-22": "Capita Birds of a Feather 2022",
    "BIRDS-24": "Capita Birds of a Feather 2024",
    "CADENCE-24": "Arbor Cadence 2024",
    "CARTER-24": "Arbor Carter Camber 2024",
    "CARTOGRAPHER-22": "Burton Cartographer 2022",
    "CHEATER-24": "Arbor Cheater 2024",
    "CODA-24": "Arbor Coda 2024",
    "CUSTOM-25": "Burton Custom 2025",
    "CUSTOM-K-22": "Burton Custom Smalls 2022",
    "CUSTOMFV-22": "Burton Custom Flying V 2022",
    "CUSTOMFV-23": "Burton Custom Flying V 2023",
    "CUSTOMX-23": "Burton Custom X 2023",
    "DEEPTHINKER-23": "Burton Deep Thinker 2023",
    "F-ATTENDANT-23": "Burton Flight Attendant 2023",
    "FEELGOOD-FV-22": "Burton Feelgood Flying V 2022",
    "FEELGOODSMALLS-22": "Burton Feelgood Smalls 2022",
    "GOODCOMPANY-23": "Burton Good Company 2023",
    "HEADSPACE-24": "GNU Headspace 2024",
    "HUCKPRO-22": "Salomon Huck Knife Pro 2022",
    "INSTIGATOR-21": "Burton Instigator 2021",
    "NAMEDROPPER-23": "Burton Name Dropper 2023",
    "NODRAMA-24": "Salomon No Drama 2024",
    "NOMAD-23": "Nitro Nomad 2023",
    "PATHFINDER-21": "Capita Pathfinder 2021",
    "PROCESSFV-23": "Burton Process Flying V 2023",
    "PROCESS-K": "Burton Process Smalls",
    "REWIND-2022": "Burton Rewind 2022",
    "REWIND-23": "Burton Rewind 2023",
    "SKELETONKEY-23": "Burton Skeleton Key 2023",
    "STALE-23": "Rome Stale Crewzer 2023",
    "STORYBOARD-23": "Burton Story Board 2023",
    "STORYBOARD23": "Burton Story Board 2023",
    "TALENT-22": "Burton Talent Scout 2022",
    "TALENTSCOUT-23": "Burton Talent Scout 2023",
    "ULTRAFEAR-23": "Capita Ultrafear 2023",
    "VOLTA-23": "Nitro Volta 2023",
    "WARPIG-25": "Ride Warpig 2025",
    "WESTMARK-24": "Arbor Westmark 2024",
    "YEASAYER-22": "Burton Yeasayer 2022",
    "YEASAYER-23": "Burton Yeasayer 2023",
    "YEASAYERFV-23": "Burton Yeasayer Flying V 2023",
  }

  // Try to match brand skis
  for (const [prefix, name] of Object.entries(brandSkis)) {
    if (skuCode === prefix || skuCode.startsWith(prefix + "-")) {
      const size = skuCode.slice(prefix.length + 1) || null
      const slug = "ski-" + prefix.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      return { productSlug: slug, size: size ? `${size}cm` : null }
    }
  }

  // Try to match brand boards
  for (const [prefix, name] of Object.entries(brandBoards)) {
    if (skuCode === prefix || skuCode.startsWith(prefix + "-")) {
      const size = skuCode.slice(prefix.length + 1) || null
      const slug = "board-" + prefix.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      // Size might be like "154", "158w", "M"
      const sizeLabel = size ? (size.endsWith("W") || size.endsWith("w") ? `${size.slice(0, -1)}Wcm` : /^\d+$/.test(size) ? `${size}cm` : size) : null
      return { productSlug: slug, size: sizeLabel }
    }
  }

  // Fallback: unknown SKU
  console.warn(`⚠️  Unknown SKU: ${skuCode} (${skuName})`)
  const slug = "unknown-" + skuCode.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  return { productSlug: slug, size: null }
}

function formatBootSize(raw: string): string {
  // mondopoint: 265 → 26.5, 275 → 27.5
  if (raw.length === 3) return `${raw.slice(0, 2)}.${raw[2]}`
  return raw
}

function formatSnbdBootSize(raw: string): string {
  // K = kids AU size, C = cm, number only = US
  if (raw.endsWith("K")) return `AU Kids ${raw.slice(0, -1)}`
  if (raw.endsWith("C")) return `EU ${raw.slice(0, -1)}`
  return `US ${raw}`
}

// ─── Product Definitions ─────────────────────────────────────────────────────

const SKI_TIERS = [
  { label: "1 Day", days: 1, price: 55 },
  { label: "2 Days", days: 2, price: 95 },
  { label: "3 Days", days: 3, price: 130 },
  { label: "Week", days: 7, price: 245 },
]
const KIDS_SKI_TIERS = [
  { label: "1 Day", days: 1, price: 40 },
  { label: "2 Days", days: 2, price: 70 },
  { label: "3 Days", days: 3, price: 95 },
  { label: "Week", days: 7, price: 175 },
]
const BOARD_TIERS = [
  { label: "1 Day", days: 1, price: 60 },
  { label: "2 Days", days: 2, price: 105 },
  { label: "3 Days", days: 3, price: 145 },
  { label: "Week", days: 7, price: 265 },
]
const KIDS_BOARD_TIERS = [
  { label: "1 Day", days: 1, price: 45 },
  { label: "2 Days", days: 2, price: 80 },
  { label: "3 Days", days: 3, price: 110 },
  { label: "Week", days: 7, price: 195 },
]
const BOOT_TIERS = [
  { label: "1 Day", days: 1, price: 20 },
  { label: "2 Days", days: 2, price: 35 },
  { label: "3 Days", days: 3, price: 45 },
  { label: "Week", days: 7, price: 80 },
]
const CLOTHING_TIERS = [
  { label: "1 Day", days: 1, price: 25 },
  { label: "2 Days", days: 2, price: 40 },
  { label: "3 Days", days: 3, price: 55 },
  { label: "Week", days: 7, price: 100 },
]
const HELMET_TIERS = [
  { label: "1 Day", days: 1, price: 15 },
  { label: "2 Days", days: 2, price: 25 },
  { label: "3 Days", days: 3, price: 35 },
  { label: "Week", days: 7, price: 60 },
]
const POLE_TIERS = [
  { label: "1 Day", days: 1, price: 10 },
  { label: "2 Days", days: 2, price: 18 },
  { label: "3 Days", days: 3, price: 25 },
  { label: "Week", days: 7, price: 45 },
]
const KIDS_CLOTHING_TIERS = [
  { label: "1 Day", days: 1, price: 15 },
  { label: "2 Days", days: 2, price: 25 },
  { label: "3 Days", days: 3, price: 35 },
  { label: "Week", days: 7, price: 65 },
]

// Map productSlug → { name, categorySlug, tiers }
const PRODUCT_DEFS: Record<string, { name: string; categorySlug: string; tiers: typeof SKI_TIERS }> = {
  // Base fleet
  "kids-skis": { name: "Kids Skis", categorySlug: "skis", tiers: KIDS_SKI_TIERS },
  "adult-skis": { name: "Adult Skis", categorySlug: "skis", tiers: SKI_TIERS },
  "kids-snowboards": { name: "Kids Snowboards", categorySlug: "snowboards", tiers: KIDS_BOARD_TIERS },
  "mens-snowboards": { name: "Mens Snowboards", categorySlug: "snowboards", tiers: BOARD_TIERS },
  "womens-snowboards": { name: "Womens Snowboards", categorySlug: "snowboards", tiers: BOARD_TIERS },
  "kids-ski-boots": { name: "Kids Ski Boots", categorySlug: "boots", tiers: BOOT_TIERS },
  "mens-ski-boots": { name: "Mens Ski Boots", categorySlug: "boots", tiers: BOOT_TIERS },
  "womens-ski-boots": { name: "Womens Ski Boots", categorySlug: "boots", tiers: BOOT_TIERS },
  "kids-snowboard-boots": { name: "Kids Snowboard Boots", categorySlug: "boots", tiers: BOOT_TIERS },
  "mens-snowboard-boots": { name: "Mens Snowboard Boots", categorySlug: "boots", tiers: BOOT_TIERS },
  "womens-snowboard-boots": { name: "Womens Snowboard Boots", categorySlug: "boots", tiers: BOOT_TIERS },
  "mens-stepon-boots": { name: "Mens Step-On Boots", categorySlug: "boots", tiers: BOOT_TIERS },
  "womens-stepon-boots": { name: "Womens Step-On Boots", categorySlug: "boots", tiers: BOOT_TIERS },
  "helmets": { name: "Helmets", categorySlug: "accessories", tiers: HELMET_TIERS },
  "mens-jackets": { name: "Mens Jackets", categorySlug: "clothing", tiers: CLOTHING_TIERS },
  "womens-jackets": { name: "Womens Jackets", categorySlug: "clothing", tiers: CLOTHING_TIERS },
  "kids-boys-jackets": { name: "Kids Boys Jackets", categorySlug: "clothing", tiers: KIDS_CLOTHING_TIERS },
  "kids-girls-jackets": { name: "Kids Girls Jackets", categorySlug: "clothing", tiers: KIDS_CLOTHING_TIERS },
  "mens-pants": { name: "Mens Pants", categorySlug: "clothing", tiers: CLOTHING_TIERS },
  "womens-pants": { name: "Womens Pants", categorySlug: "clothing", tiers: CLOTHING_TIERS },
  "kids-pants": { name: "Kids Pants", categorySlug: "clothing", tiers: KIDS_CLOTHING_TIERS },
  "kids-snowsuits": { name: "Kids Snowsuits", categorySlug: "clothing", tiers: KIDS_CLOTHING_TIERS },
  "ski-poles": { name: "Ski Poles", categorySlug: "accessories", tiers: POLE_TIERS },
}

// Brand ski products (auto-generated from brandSkis map above)
const brandSkiDefs: Record<string, string> = {
  "ski-bent-24": "Atomic Bent Chetler 90 2024",
  "ski-brahma-24": "Blizzard Brahma 88 2024",
  "ski-kendo-24": "Volkl Kendo 88 2024",
  "ski-kenja-2020": "Volkl Kenja 88 2020",
  "ski-experience84-22": "Rossignol Experience 84 Ai 2022",
  "ski-experience84w-21": "Rossignol Experience 84 Ai W 2021",
  "ski-mindbender90w-24": "K2 Mindbender 90W 2024",
  "ski-revolt104": "Volkl Revolt 104 2024",
  "ski-revolt95-23": "Volkl Revolt 95 2023",
  "ski-revolt96-24": "Volkl Revolt 96 2024",
  "ski-ripstick88-24": "Elan Ripstick 88 2024",
  "ski-ripstick88w-20": "Elan Ripstick 88W 2020",
  "ski-ripstick88w-22": "Elan Ripstick 88W 2022",
  "ski-ripstick96-22": "Elan Ripstick 96 2022",
  "ski-ripstick-94w-24": "Elan Ripstick 94W 2024",
  "ski-addikt-24": "Salomon Addikt Pro 72 2024",
  "ski-santa-ana-24": "Nordica Santa Ana 88 2024",
  "ski-wingman82ti-24": "Blizzard Wingman 82 Ti 2024",
  "ski-wingman86ti-21": "Blizzard Wingman 86 Ti 2021",
  "ski-wingman86ti-24": "Blizzard Wingman 86 Ti 2024",
  "ski-yumi-23": "Volkl Yumi 84 2023",
}

const brandBoardDefs: Record<string, string> = {
  "board-atv-24": "Sims ATV Pro 2024",
  "board-basic-23": "YES Basic 2023",
  "board-beast-2023": "Nitro Beast 2023",
  "board-birds-22": "Capita Birds of a Feather 2022",
  "board-birds-24": "Capita Birds of a Feather 2024",
  "board-cadence-24": "Arbor Cadence 2024",
  "board-carter-24": "Arbor Carter Camber 2024",
  "board-cartographer-22": "Burton Cartographer 2022",
  "board-cheater-24": "Arbor Cheater 2024",
  "board-coda-24": "Arbor Coda 2024",
  "board-custom-25": "Burton Custom 2025",
  "board-custom-k-22": "Burton Custom Smalls 2022",
  "board-customfv-22": "Burton Custom Flying V 2022",
  "board-customfv-23": "Burton Custom Flying V 2023",
  "board-customx-23": "Burton Custom X 2023",
  "board-deepthinker-23": "Burton Deep Thinker 2023",
  "board-f-attendant-23": "Burton Flight Attendant 2023",
  "board-feelgood-fv-22": "Burton Feelgood Flying V 2022",
  "board-feelgoodsmalls-22": "Burton Feelgood Smalls 2022",
  "board-goodcompany-23": "Burton Good Company 2023",
  "board-headspace-24": "GNU Headspace 2024",
  "board-huckpro-22": "Salomon Huck Knife Pro 2022",
  "board-instigator-21": "Burton Instigator 2021",
  "board-namedropper-23": "Burton Name Dropper 2023",
  "board-nodrama-24": "Salomon No Drama 2024",
  "board-nomad-23": "Nitro Nomad 2023",
  "board-pathfinder-21": "Capita Pathfinder 2021",
  "board-processfv-23": "Burton Process Flying V 2023",
  "board-process-k": "Burton Process Smalls",
  "board-rewind-2022": "Burton Rewind 2022",
  "board-rewind-23": "Burton Rewind 2023",
  "board-skeletonkey-23": "Burton Skeleton Key 2023",
  "board-stale-23": "Rome Stale Crewzer 2023",
  "board-storyboard-23": "Burton Story Board 2023",
  "board-storyboard23": "Burton Story Board 2023",
  "board-talent-22": "Burton Talent Scout 2022",
  "board-talentscout-23": "Burton Talent Scout 2023",
  "board-ultrafear-23": "Capita Ultrafear 2023",
  "board-volta-23": "Nitro Volta 2023",
  "board-warpig-25": "Ride Warpig 2025",
  "board-westmark-24": "Arbor Westmark 2024",
  "board-yeasayer-22": "Burton Yeasayer 2022",
  "board-yeasayer-23": "Burton Yeasayer 2023",
  "board-yeasayerfv-23": "Burton Yeasayer Flying V 2023",
}

for (const [slug, name] of Object.entries(brandSkiDefs)) {
  PRODUCT_DEFS[slug] = { name, categorySlug: "skis", tiers: SKI_TIERS }
}
for (const [slug, name] of Object.entries(brandBoardDefs)) {
  PRODUCT_DEFS[slug] = { name, categorySlug: "snowboards", tiers: BOARD_TIERS }
}

// ─── File Parser ──────────────────────────────────────────────────────────────

function parseRentleFile(filePath: string): RentleRecord[] {
  const content = fs.readFileSync(filePath, "utf-8")
  const records: RentleRecord[] = []

  // Split by ROW markers
  const rowBlocks = content.split(/ROW \d+\n-+\n/)
  for (const block of rowBlocks) {
    if (!block.trim() || block.startsWith("Total Records")) continue

    const get = (key: string) => {
      const m = block.match(new RegExp(`${key}\\s*:\\s*(.+)`))
      return m ? m[1].trim() : ""
    }

    const skuCode = get("SKU Code")
    if (!skuCode) continue

    const statusRaw = get("Status")
    // Status may be like "IN_USE:5" for non-individually tracked
    const status = statusRaw.split(":")[0]

    const quantityRaw = get("Quantity")
    const quantity = parseInt(quantityRaw) || 1

    records.push({
      internalId: get("Internal ID"),
      articleId: get("Article ID"),
      skuCode,
      skuName: get("SKU Name"),
      status,
      trackedIndividually: get("Tracked individually") === "yes",
      quantity,
      currentState: get("Current state"),
    })
  }

  return records
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const filePath = path.join(
    process.env.USERPROFILE || process.env.HOME || "",
    "Downloads",
    "rentle_articles_separated.txt"
  )

  if (!fs.existsSync(filePath)) {
    throw new Error(`Rentle file not found at: ${filePath}`)
  }

  console.log("📂 Parsing Rentle inventory file...")
  const records = parseRentleFile(filePath)
  console.log(`   Found ${records.length} records`)

  // ── Step 1: Ensure categories exist ──
  console.log("\n📁 Creating categories...")
  const categoryMap: Record<string, string> = {}
  const categories = [
    { name: "Skis", slug: "skis" },
    { name: "Snowboards", slug: "snowboards" },
    { name: "Boots", slug: "boots" },
    { name: "Clothing", slug: "clothing" },
    { name: "Accessories", slug: "accessories" },
  ]
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    categoryMap[cat.slug] = c.id
    console.log(`   ✓ ${cat.name}`)
  }

  // ── Step 2: Parse all records to discover which products we need ──
  const productSlugsNeeded = new Set<string>()
  const recordsWithProduct: Array<RentleRecord & { productSlug: string; size: string | null }> = []

  for (const rec of records) {
    const { productSlug, size } = parseSkuCode(rec.skuCode, rec.skuName)
    productSlugsNeeded.add(productSlug)
    recordsWithProduct.push({ ...rec, productSlug, size })
  }

  // ── Step 3: Create products ──
  console.log(`\n🏷️  Creating ${productSlugsNeeded.size} products...`)
  const productIdMap: Record<string, string> = {}

  for (const slug of productSlugsNeeded) {
    const def = PRODUCT_DEFS[slug]
    if (!def) {
      console.warn(`   ⚠️  No definition for product slug: ${slug}`)
      continue
    }

    const categoryId = categoryMap[def.categorySlug]
    if (!categoryId) {
      console.warn(`   ⚠️  No category found for slug: ${def.categorySlug}`)
      continue
    }

    const product = await prisma.product.upsert({
      where: { slug },
      update: { name: def.name, categoryId, isActive: true },
      create: { name: def.name, slug, categoryId, isActive: true },
    })
    productIdMap[slug] = product.id

    // Add pricing tiers if not exist
    const existingTiers = await prisma.pricingTier.count({ where: { productId: product.id } })
    if (existingTiers === 0) {
      await prisma.pricingTier.createMany({
        data: def.tiers.map((t) => ({ ...t, productId: product.id })),
      })
    }
    process.stdout.write(".")
  }
  console.log(`\n   ✓ ${productSlugsNeeded.size} products created/updated`)

  // ── Step 4: Create equipment units ──
  console.log("\n📦 Creating equipment units...")
  let created = 0
  let skipped = 0

  for (const rec of recordsWithProduct) {
    const productId = productIdMap[rec.productSlug]
    if (!productId) {
      skipped++
      continue
    }

    const isActive = rec.status === "IN_USE"
    const condition: Condition = isActive ? "GOOD" : "RETIRED"

    if (rec.trackedIndividually) {
      // One EquipmentUnit per record
      // Use articleId as serialNumber if available, else internalId
      const serialNumber = rec.articleId || rec.internalId

      // Check if unit already exists
      const existing = await prisma.equipmentUnit.findUnique({
        where: { serialNumber },
      })
      if (existing) {
        // Update status
        await prisma.equipmentUnit.update({
          where: { serialNumber },
          data: { isActive, condition, size: rec.size },
        })
      } else {
        await prisma.equipmentUnit.create({
          data: {
            productId,
            serialNumber,
            size: rec.size,
            condition,
            isActive,
          },
        })
      }
      created++
    } else {
      // Non-individually tracked: create N units (quantity)
      for (let i = 0; i < rec.quantity; i++) {
        await prisma.equipmentUnit.create({
          data: {
            productId,
            serialNumber: null, // no serial for non-tracked items
            size: rec.size,
            condition,
            isActive,
          },
        })
        created++
      }
    }

    if (created % 50 === 0) process.stdout.write(".")
  }

  console.log(`\n   ✓ ${created} equipment units created, ${skipped} skipped`)

  // ── Summary ──
  const totalUnits = await prisma.equipmentUnit.count()
  const activeUnits = await prisma.equipmentUnit.count({ where: { isActive: true } })
  const totalProducts = await prisma.product.count()

  console.log("\n✅ Import complete!")
  console.log(`   Products: ${totalProducts}`)
  console.log(`   Equipment units: ${totalUnits} total, ${activeUnits} active`)
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
