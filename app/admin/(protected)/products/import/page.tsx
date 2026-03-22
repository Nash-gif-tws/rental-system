import ProductImportClient from "@/components/admin/ProductImportClient"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ProductImportPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="flex items-center gap-1.5 text-sm text-[#B4B4B4] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Products
        </Link>
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">Import Products</h1>
        <p className="text-sm text-[#B4B4B4] mt-0.5">
          Bulk create or update your product catalogue from a CSV file
        </p>
      </div>

      <ProductImportClient />
    </div>
  )
}
