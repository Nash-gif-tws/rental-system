"use client"

import { useState, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Printer, ChevronLeft, ChevronRight, CalendarDays, CheckSquare, Square, ArrowLeft } from "lucide-react"

export type PickItem = {
  key: string // "bookingId-productId-size"
  bookingNumber: string
  bookingId: string
  customerName: string
  customerPhone: string
  productName: string
  categoryName: string
  categoryOrder: number
  size: string
  notes: string
}

export type GroupedCategory = {
  name: string
  order: number
  products: {
    name: string
    sizes: {
      size: string
      items: PickItem[]
    }[]
  }[]
}

function localDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatDisplayDate(dateStr: string) {
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  if (dateStr === localDateStr(today)) return "Today"
  if (dateStr === localDateStr(tomorrow)) return "Tomorrow"
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })
}

function formatPrintDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

export default function PickingListClient({
  groups,
  selectedDate,
  totalBookings,
}: {
  groups: GroupedCategory[]
  selectedDate: string
  totalBookings: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const allKeys = groups.flatMap(g => g.products.flatMap(p => p.sizes.flatMap(s => s.items.map(i => i.key))))
  const totalItems = allKeys.length

  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = useCallback((key: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setChecked(prev => prev.size === totalItems ? new Set() : new Set(allKeys))
  }, [allKeys, totalItems])

  function shiftDate(days: number) {
    const d = new Date(selectedDate + "T00:00:00")
    d.setDate(d.getDate() + days)
    // Use local date parts (not toISOString) so the date reflects browser local time (Sydney)
    const y = d.getFullYear()
    const mo = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const str = `${y}-${mo}-${day}`
    const params = new URLSearchParams(searchParams.toString())
    params.set("date", str)
    router.push(`${pathname}?${params.toString()}`)
  }

  const progress = totalItems > 0 ? Math.round((checked.size / totalItems) * 100) : 0
  const allDone = totalItems > 0 && checked.size === totalItems

  return (
    <>
      {/* Screen UI */}
      <div className="print:hidden space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/bookings" className="flex items-center gap-1 text-sm text-[#B4B4B4] hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">Picking List</h1>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] border border-[#2e2e2e] text-[#B4B4B4] hover:text-white hover:border-[#C4A04A]/40 rounded-lg text-sm font-medium transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>

        {/* Date + progress bar */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 flex flex-wrap items-center gap-4">
          {/* Day navigator */}
          <div className="flex items-center gap-1 bg-[#121212] border border-[#2e2e2e] rounded-lg overflow-hidden">
            <button onClick={() => shiftDate(-1)} className="p-2.5 hover:bg-white/5 text-[#B4B4B4] hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 min-w-[130px] justify-center">
              <CalendarDays className="h-3.5 w-3.5 text-[#C4A04A]" />
              <span className="text-sm font-medium text-white">{formatDisplayDate(selectedDate)}</span>
            </div>
            <button onClick={() => shiftDate(1)} className="p-2.5 hover:bg-white/5 text-[#B4B4B4] hover:text-white transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="text-sm text-[#B4B4B4]">
            <span className="text-white font-medium">{totalBookings}</span> bookings ·{" "}
            <span className="text-white font-medium">{totalItems}</span> items to pull
          </div>

          {/* Progress */}
          {totalItems > 0 && (
            <div className="flex-1 min-w-48 flex items-center gap-3">
              <div className="flex-1 h-2 bg-[#2e2e2e] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${allDone ? "bg-emerald-500" : "bg-[#C4A04A]"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-sm font-semibold whitespace-nowrap ${allDone ? "text-emerald-400" : "text-[#C4A04A]"}`}>
                {checked.size} / {totalItems} pulled
              </span>
            </div>
          )}

          {totalItems > 0 && (
            <button onClick={toggleAll} className="text-xs text-[#B4B4B4] hover:text-white transition-colors whitespace-nowrap">
              {checked.size === totalItems ? "Uncheck all" : "Check all"}
            </button>
          )}
        </div>

        {/* Empty state */}
        {totalItems === 0 && (
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl px-6 py-16 text-center">
            <p className="text-[#555] text-sm">No confirmed bookings for {formatDisplayDate(selectedDate)}</p>
          </div>
        )}

        {/* Category groups */}
        {groups.map(group => (
          <div key={group.name} className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#2e2e2e] bg-[#181818]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C4A04A]">{group.name}</p>
            </div>
            <div className="divide-y divide-[#252525]">
              {group.products.map(product => (
                <div key={product.name}>
                  <div className="px-5 py-2.5 bg-[#1a1a1a]">
                    <p className="text-sm font-semibold text-white">{product.name}</p>
                  </div>
                  {product.sizes.map(({ size, items }) => (
                    <div key={size} className="divide-y divide-[#1e1e1e]">
                      {items.map(item => {
                        const done = checked.has(item.key)
                        return (
                          <button
                            key={item.key}
                            onClick={() => toggle(item.key)}
                            className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${done ? "bg-emerald-500/5" : "hover:bg-white/[0.02]"}`}
                          >
                            <div className={`shrink-0 ${done ? "text-emerald-500" : "text-[#444]"}`}>
                              {done
                                ? <CheckSquare className="h-5 w-5" />
                                : <Square className="h-5 w-5" />
                              }
                            </div>
                            <div className="shrink-0">
                              <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-bold min-w-[48px] ${done ? "bg-emerald-500/15 text-emerald-400" : "bg-[#252525] text-[#E6E6E6]"}`}>
                                {size || "—"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/admin/bookings/${item.bookingId}`}
                                onClick={e => e.stopPropagation()}
                                className={`text-sm font-medium transition-colors ${done ? "text-[#555] line-through" : "text-[#C4A04A] hover:text-[#d4b565]"}`}
                              >
                                {item.bookingNumber}
                              </Link>
                              <span className={`ml-2 text-sm ${done ? "text-[#444]" : "text-[#B4B4B4]"}`}>
                                {item.customerName}
                              </span>
                              {item.customerPhone && (
                                <span className={`ml-2 text-xs ${done ? "text-[#333]" : "text-[#666]"}`}>{item.customerPhone}</span>
                              )}
                            </div>
                            {item.notes && (
                              <p className={`text-xs italic shrink-0 max-w-[200px] truncate ${done ? "text-[#333]" : "text-amber-400/70"}`}>
                                {item.notes}
                              </p>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Print layout — clean, black on white */}
      <div className="hidden print:block font-sans text-black">
        <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-black">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">Picking List</h1>
            <p className="text-base mt-1">{formatPrintDate(selectedDate)}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{totalBookings} bookings · {totalItems} items</p>
            <p className="text-gray-500">Snowskiers Warehouse</p>
          </div>
        </div>

        {groups.map(group => (
          <div key={group.name} className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 pb-1 border-b border-gray-300">
              {group.name}
            </h2>
            {group.products.map(product => (
              <div key={product.name} className="mb-4">
                <h3 className="font-bold text-sm mb-1">{product.name}</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-1 pr-4 text-xs text-gray-500 font-medium w-16">Size</th>
                      <th className="text-left py-1 pr-4 text-xs text-gray-500 font-medium w-32">Booking #</th>
                      <th className="text-left py-1 pr-4 text-xs text-gray-500 font-medium">Customer</th>
                      <th className="text-left py-1 text-xs text-gray-500 font-medium w-24">Phone</th>
                      <th className="text-right py-1 text-xs text-gray-500 font-medium w-16">✓</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.sizes.flatMap(({ size, items }) =>
                      items.map((item, idx) => (
                        <tr key={item.key} className="border-b border-gray-100">
                          <td className="py-1.5 pr-4 font-bold">{idx === 0 ? (size || "—") : ""}</td>
                          <td className="py-1.5 pr-4 font-mono text-xs">{item.bookingNumber}</td>
                          <td className="py-1.5 pr-4">{item.customerName}</td>
                          <td className="py-1.5 text-gray-500 text-xs">{item.customerPhone}</td>
                          <td className="py-1.5 text-right">
                            <span className="inline-block w-5 h-5 border-2 border-black rounded" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}

        <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-400 flex justify-between">
          <span>Printed {new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          <span>Snowskiers Warehouse — Rental Manager</span>
        </div>
      </div>
    </>
  )
}
