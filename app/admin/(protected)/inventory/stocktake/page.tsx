import StocktakeClient from "@/components/admin/StocktakeClient"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function StocktakePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/inventory"
          className="flex items-center gap-1.5 text-sm text-[#B4B4B4] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Inventory
        </Link>
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">Stocktake</h1>
        <p className="text-sm text-[#B4B4B4] mt-0.5">
          Enter physical unit counts to create or rebuild your inventory. Each row creates that many equipment units.
        </p>
      </div>

      <StocktakeClient />
    </div>
  )
}
