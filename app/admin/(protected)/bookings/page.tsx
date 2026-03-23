import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Plus, PackageCheck, CheckCircle, ClipboardList } from "lucide-react"
import { BookingStatus } from "@prisma/client"
import PickupActions from "@/components/admin/PickupActions"
import BookingsTopBar from "@/components/admin/BookingsTopBar"
import { sydneyTodayStr, sydneyTomorrowStr, sydneyDayBounds, formatSydney } from "@/lib/tz"

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CHECKED_OUT: "Checked Out",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-300",
  CONFIRMED: "bg-[#C4A04A]/20 text-[#C4A04A]",
  CHECKED_OUT: "bg-purple-500/20 text-purple-300",
  RETURNED: "bg-emerald-500/20 text-emerald-300",
  CANCELLED: "bg-red-500/20 text-red-300",
  NO_SHOW: "bg-zinc-500/20 text-zinc-400",
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; date?: string }>
}) {
  const params = await searchParams

  // Resolve selected date (default: today in Sydney)
  const todayStr = sydneyTodayStr()
  const selectedDateStr = params.date ?? todayStr
  const { start: dayStart, end: dayEnd } = sydneyDayBounds(selectedDateStr)

  const isSearching = Boolean(params.q)
  const isStatusFilter = Boolean(params.status)

  // ── Daily pickups for selected date ───────────────────────────────────────
  // Only show when not in text-search or status-filter mode
  const dayPickups = (!isSearching && !isStatusFilter)
    ? await prisma.booking.findMany({
        where: {
          status: { in: ["CONFIRMED", "CHECKED_OUT"] },
          startDate: { gte: dayStart, lte: dayEnd },
        },
        orderBy: { createdAt: "asc" },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      })
    : []

  // ── Main list ──────────────────────────────────────────────────────────────
  const where: any = {}

  if (isSearching) {
    where.OR = [
      { bookingNumber: { contains: params.q, mode: "insensitive" } },
      { customer: { firstName: { contains: params.q, mode: "insensitive" } } },
      { customer: { lastName: { contains: params.q, mode: "insensitive" } } },
      { customer: { email: { contains: params.q, mode: "insensitive" } } },
      { customer: { phone: { contains: params.q, mode: "insensitive" } } },
    ]
  } else if (isStatusFilter) {
    where.status = params.status
  } else {
    // Default: all bookings for selected date (any status)
    where.startDate = { gte: dayStart, lte: dayEnd }
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: isSearching ? { createdAt: "desc" } : { startDate: "asc" },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
    take: 100,
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">Bookings</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/bookings/picking-list?date=${sydneyTomorrowStr()}`}
            className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border border-[#2e2e2e] text-[#B4B4B4] hover:text-white hover:border-[#C4A04A]/40 rounded-lg text-sm font-medium transition-colors"
          >
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Picking List</span>
          </Link>
          <Link
            href="/admin/bookings/new"
            className="flex items-center gap-2 bg-[#C4A04A] text-[#121212] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4b565] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </Link>
        </div>
      </div>

      {/* Top bar: search + day navigator */}
      <BookingsTopBar selectedDate={selectedDateStr} searchQuery={params.q ?? ""} />

      {/* Status filter pills — secondary */}
      {!isSearching && (
        <div className="flex gap-2 flex-wrap">
          {(["", "PENDING", "CONFIRMED", "CHECKED_OUT", "RETURNED", "CANCELLED"] as const).map((s) => (
            <Link
              key={s}
              href={s ? `/admin/bookings?status=${s}` : `/admin/bookings?date=${selectedDateStr}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-colors ${
                isStatusFilter
                  ? (params.status ?? "") === s
                    ? "bg-[#C4A04A] text-[#121212]"
                    : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
                  : s === ""
                  ? "bg-[#C4A04A] text-[#121212]"
                  : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
              }`}
            >
              {s ? STATUS_LABELS[s as BookingStatus] : "All"}
            </Link>
          ))}
        </div>
      )}

      {/* Daily pickups panel */}
      {!isSearching && !isStatusFilter && (
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2e2e2e]">
            <PackageCheck className="h-4 w-4 text-[#C4A04A]" />
            <p className="text-sm font-semibold text-white">
              Pickups for{" "}
              {selectedDateStr === todayStr ? "Today" : formatSydney(new Date(selectedDateStr + "T00:00:00"), "EEEE d MMMM")}
            </p>
            {dayPickups.length > 0 && (
              <span className="ml-auto text-xs text-[#B4B4B4]">
                {dayPickups.filter((b) => b.status === "CONFIRMED" && b.prepStatus === "NOT_READY").length} not ready ·{" "}
                {dayPickups.filter((b) => b.prepStatus === "READY_FOR_COLLECTION").length} ready ·{" "}
                {dayPickups.filter((b) => b.status === "CHECKED_OUT").length} picked up
              </span>
            )}
          </div>

          {dayPickups.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-[#555]">No pickups scheduled for this day</p>
            </div>
          ) : (
            <div className="divide-y divide-[#252525]">
              {dayPickups.map((booking) => (
                <div key={booking.id} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="text-sm font-semibold text-[#C4A04A] hover:text-[#d4b565] transition-colors"
                      >
                        {booking.bookingNumber}
                      </Link>
                      {booking.status === "CHECKED_OUT" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          <CheckCircle className="h-3 w-3" /> Picked up
                        </span>
                      ) : booking.prepStatus === "READY_FOR_COLLECTION" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25">
                          <PackageCheck className="h-3 w-3" /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-500/15 text-zinc-400 border border-zinc-500/25">
                          Not ready
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white mt-0.5 font-medium">
                      {booking.customer.firstName} {booking.customer.lastName}
                      {booking.customer.phone && (
                        <span className="ml-2 text-xs font-normal text-[#888]">{booking.customer.phone}</span>
                      )}
                    </p>
                    <p className="text-xs text-[#666] mt-0.5">
                      {booking.items.map((i) => i.product.name).join(" · ")}
                    </p>
                    {booking.notes && (
                      <p className="text-xs text-amber-400/70 mt-1 italic">Note: {booking.notes}</p>
                    )}
                  </div>
                  <PickupActions
                    bookingId={booking.id}
                    prepStatus={booking.prepStatus}
                    bookingStatus={booking.status}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All bookings table */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden overflow-x-auto">
        {isSearching && (
          <div className="px-5 py-3 border-b border-[#2e2e2e] flex items-center gap-2">
            <p className="text-xs text-[#B4B4B4]">
              {bookings.length} result{bookings.length !== 1 ? "s" : ""} for &ldquo;{params.q}&rdquo;
            </p>
            <Link href={`/admin/bookings?date=${selectedDateStr}`} className="ml-auto text-xs text-[#C4A04A] hover:text-[#d4b565]">
              Clear search
            </Link>
          </div>
        )}
        {isStatusFilter && (
          <div className="px-5 py-3 border-b border-[#2e2e2e] flex items-center gap-2">
            <p className="text-xs text-[#B4B4B4]">
              Showing all <span className="text-white font-medium">{STATUS_LABELS[params.status as BookingStatus]}</span> bookings
            </p>
            <Link href={`/admin/bookings?date=${selectedDateStr}`} className="ml-auto text-xs text-[#C4A04A] hover:text-[#d4b565]">
              Clear filter
            </Link>
          </div>
        )}
        <table className="w-full text-sm">
          <thead className="border-b border-[#2e2e2e]">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Booking #</th>
              <th className="text-left px-5 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Dates</th>
              <th className="text-left px-5 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Items</th>
              <th className="text-left px-5 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Total</th>
              <th className="text-left px-5 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Status</th>
              <th className="text-left px-5 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Prep</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525]">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-[#555]">
                  {isSearching ? "No bookings match that search" : "No bookings for this day"}
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/admin/bookings/${booking.id}`} className="text-[#C4A04A] hover:text-[#d4b565] font-medium transition-colors">
                      {booking.bookingNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">
                      {booking.customer.firstName} {booking.customer.lastName}
                    </p>
                    <p className="text-[#B4B4B4] text-xs">{booking.customer.phone ?? booking.customer.email}</p>
                  </td>
                  <td className="px-5 py-4 text-[#E6E6E6]">
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                  </td>
                  <td className="px-5 py-4 text-[#E6E6E6] max-w-[160px] truncate">
                    {booking.items.map((i) => i.product.name).join(", ")}
                  </td>
                  <td className="px-5 py-4 font-medium text-white">
                    {formatCurrency(booking.subtotal)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[booking.status]}`}>
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {booking.prepStatus === "READY_FOR_COLLECTION" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-400">
                        <PackageCheck className="h-3 w-3" /> Ready
                      </span>
                    ) : booking.status === "CHECKED_OUT" || booking.status === "RETURNED" ? (
                      <span className="text-xs text-[#444]">—</span>
                    ) : (
                      <span className="text-xs text-[#555]">Not ready</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
