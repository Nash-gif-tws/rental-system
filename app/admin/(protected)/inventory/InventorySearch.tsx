"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { useCallback } from "react"

export default function InventorySearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (e.target.value) {
        params.set("q", e.target.value)
      } else {
        params.delete("q")
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555]" />
      <input
        type="search"
        placeholder="Search products..."
        defaultValue={defaultValue}
        onChange={handleChange}
        className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C8FF00] transition-colors"
      />
    </div>
  )
}
