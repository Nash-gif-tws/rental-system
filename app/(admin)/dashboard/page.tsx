import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { CalendarDays, Package, Users, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns"

export default async function DashboardPage() {
  const today = new Date()

  const [
    activeBookings,
    checkoutsToday,
    returnsToday,
    pendingBookings,
    monthlyRevenue,
    totalCustomers,
    lowInventory,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count({
      where: { status: { in: ["CONFIRMED", "CHECKED_OUT"] } },
    }),
    prisma.booking.count({
      where: {
        status: "CONFIRMED",
        startDate: { gte: startOfDay(today), lte: endOfDay(today) },
      },
    }),
    prisma.booking.count({
      where: {
        status: "CHECKED_OUT",
        endDate: { gte: startOfDay(today), lte: endOfDay(today) },
      },
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.aggregate({
      where: {
        status: { in: ["CONFIRMED", "CHECKED_OUT", "RETURNED"] },
        createdAt: { gte: startOfMonth(today), lte: endOfMonth(today) },
      },
      _sum: { subtotal: true },
    }),
    prisma.customer.count(),
    prisma.equipmentUnit.count({
      where: { condition: "NEEDS_SERVICE", isActive: true },
    }),
    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
  ])

  const stats = [
    {
      label: "Active Bookings",
      value: activeBookings,
      icon: CalendarDays,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "This Month Revenue",
      value: formatCurrency(monthlyRevenue._sum.subtotal ?? 0),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Customers",
      value: totalCustomers,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Needs Service",
      value: lowInventory,
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`${bg} p-3 rounded-xl`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/bookings?filter=pickup-today"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-xl">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{checkoutsToday}</p>
              <p className="text-sm text-gray-500">Pickups Today</p>
            </div>
          </div>
        </Link>

        <Link
          href="/bookings?filter=return-today"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-green-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-3 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{returnsToday}</p>
              <p className="text-sm text-gray-500">Returns Today</p>
            </div>
          </div>
        </Link>

        <Link
          href="/bookings?filter=pending"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-yellow-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-yellow-50 p-3 rounded-xl">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingBookings}</p>
              <p className="text-sm text-gray-500">Pending Confirmation</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <Link href="/bookings" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentBookings.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No bookings yet.</p>
          ) : (
            recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.customer.firstName} {booking.customer.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{booking.bookingNumber}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      booking.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : booking.status === "CONFIRMED"
                        ? "bg-blue-100 text-blue-800"
                        : booking.status === "CHECKED_OUT"
                        ? "bg-purple-100 text-purple-800"
                        : booking.status === "RETURNED"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {booking.status.replace("_", " ")}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(booking.subtotal)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
