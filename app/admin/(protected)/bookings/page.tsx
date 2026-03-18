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
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  CHECKED_OUT: "bg-purple-100 text-purple-800",
  RETURNED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
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
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <Link
          href="/admin/bookings/new"
          className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <form className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Search booking # or customer..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </form>
          <div className="flex gap-2 flex-wrap">
            {(["", "PENDING", "CONFIRMED", "CHECKED_OUT", "RETURNED", "CANCELLED"] as const).map((s) => (
              <Link
                key={s}
                href={s ? `/bookings?status=${s}` : "/bookings"}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  (params.status ?? "") === s
                    ? "bg-sky-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s ? STATUS_LABELS[s as BookingStatus] : "All"}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Booking #</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Customer</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Dates</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Items</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Total</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/bookings/${booking.id}`} className="text-sky-600 hover:text-sky-700 font-medium">
                      {booking.bookingNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {booking.customer.firstName} {booking.customer.lastName}
                    </p>
                    <p className="text-gray-500 text-xs">{booking.customer.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {booking.items.map((i) => i.product.name).join(", ")}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {formatCurrency(booking.subtotal)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        STATUS_COLORS[booking.status]
                      }`}
                    >
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
