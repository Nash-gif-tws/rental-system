"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { useCallback, useRef } from "react"

export default function InventorySearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (timer.current) clearTimeout(timer.current)
      const val = e.target.value
      timer.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (val) params.set("q", val)
        else params.delete("q")
        router.replace(`${pathname}?${params.toString()}`)
      }, 300)
    },
    [pathname, router, searchParams]
  )

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#555]" />
      <input
        type="search"
        placeholder="Search by product, size, or ID..."
        defaultValue={defaultValue}
        onChange={handleChange}
        className="w-full pl-8 pr-4 py-2 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C8FF00] transition-colors"
      />
    </div>
  )
}
