import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { BookingStatus } from "@prisma/client"

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
  searchParams: Promise<{ filter?: string; q?: string; status?: string }>
}) {
  const params = await searchParams
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const where: any = {}

  if (params.filter === "pickup-today") {
    where.status = "CONFIRMED"
    where.startDate = { gte: today, lt: tomorrow }
  } else if (params.filter === "return-today") {
    where.status = "CHECKED_OUT"
    where.endDate = { gte: today, lt: tomorrow }
  } else if (params.filter === "pending") {
    where.status = "PENDING"
  } else if (params.status) {
    where.status = params.status
  }

  if (params.q) {
    where.OR = [
      { bookingNumber: { contains: params.q, mode: "insensitive" } },
      { customer: { firstName: { contains: params.q, mode: "insensitive" } } },
      { customer: { lastName: { contains: params.q, mode: "insensitive" } } },
      { customer: { email: { contains: params.q, mode: "insensitive" } } },
    ]
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">Bookings</h1>
        <Link
          href="/admin/bookings/new"
          className="flex items-center gap-2 bg-[#C4A04A] text-[#121212] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4b565] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <form className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B4B4B4]" />
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Search booking # or customer..."
                className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-[#333] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C4A04A] focus:ring-1 focus:ring-[#C4A04A] transition-colors"
              />
            </div>
          </form>
          <div className="flex gap-2 flex-wrap">
            {(["", "PENDING", "CONFIRMED", "CHECKED_OUT", "RETURNED", "CANCELLED"] as const).map((s) => (
              <Link
                key={s}
                href={s ? `/admin/bookings?status=${s}` : "/admin/bookings"}
                className={`px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-colors ${
                  (params.status ?? "") === s
                    ? "bg-[#C4A04A] text-[#121212]"
                    : "bg-white/5 text-[#B4B4B4] hover:bg-white/10 hover:text-white"
                }`}
              >
                {s ? STATUS_LABELS[s as BookingStatus] : "All"}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#2e2e2e]">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Booking #</th>
              <th className="text-left px-6 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Customer</th>
              <th className="text-left px-6 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Dates</th>
              <th className="text-left px-6 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Items</th>
              <th className="text-left px-6 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Total</th>
              <th className="text-left px-6 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525]">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#B4B4B4]">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/bookings/${booking.id}`} className="text-[#C4A04A] hover:text-[#d4b565] font-medium transition-colors">
                      {booking.bookingNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">
                      {booking.customer.firstName} {booking.customer.lastName}
                    </p>
                    <p className="text-[#B4B4B4] text-xs">{booking.customer.email}</p>
                  </td>
                  <td className="px-6 py-4 text-[#E6E6E6]">
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                  </td>
                  <td className="px-6 py-4 text-[#E6E6E6]">
                    {booking.items.map((i) => i.product.name).join(", ")}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {formatCurrency(booking.subtotal)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[booking.status]}`}>
                      {STATUS_LABELS[booking.status]}
                    </span>
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
