import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { CalendarDays, Package, Users, DollarSign, Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import { sydneyTodayStr, sydneyDayBounds, sydneyMonthBounds, formatSydney } from "@/lib/tz"

export const revalidate = 60

export default async function DashboardPage() {
  const todayStr = sydneyTodayStr()
  const { start: todayStart, end: todayEnd } = sydneyDayBounds(todayStr)
  const { start: monthStart, end: monthEnd } = sydneyMonthBounds()

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
        startDate: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.booking.count({
      where: {
        status: "CHECKED_OUT",
        endDate: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.aggregate({
      where: {
        status: { in: ["CONFIRMED", "CHECKED_OUT", "RETURNED"] },
        createdAt: { gte: monthStart, lte: monthEnd },
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
    },
    {
      label: "This Month Revenue",
      value: formatCurrency(monthlyRevenue._sum.subtotal ?? 0),
      icon: DollarSign,
      accent: true,
    },
    {
      label: "Total Customers",
      value: totalCustomers,
      icon: Users,
    },
    {
      label: "Needs Service",
      value: lowInventory,
      icon: Package,
      warn: lowInventory > 0,
    },
  ]

  // Text colours chosen for ≥4.5:1 contrast against the badge background on #1e1e1e
  const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-500/20 text-amber-100",
    CONFIRMED: "bg-[#C4A04A]/20 text-[#e8cc90]",
    CHECKED_OUT: "bg-purple-500/20 text-purple-200",
    RETURNED: "bg-emerald-500/20 text-emerald-200",
    CANCELLED: "bg-red-500/20 text-red-200",
    NO_SHOW: "bg-zinc-500/20 text-zinc-300",
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">Dashboard</h1>
          <p className="text-[#B4B4B4] text-sm mt-1">
            {formatSydney(new Date(), "EEEE d MMMM yyyy")}
          </p>
        </div>
        <Link
          href="/admin/pos"
          className="flex items-center gap-2 px-4 py-2 bg-[#C4A04A] hover:bg-[#d4b565] text-[#121212] text-sm font-semibold rounded-lg transition-colors shrink-0"
          aria-label="Create a new booking"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Booking</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
        {stats.map(({ label, value, icon: Icon, accent, warn }) => (
          <div
            key={label}
            className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5 sm:p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs tracking-widest uppercase text-[#B4B4B4]">{label}</p>
                <p className={`text-2xl font-bold mt-1.5 ${accent ? "text-[#C4A04A]" : warn ? "text-red-400" : "text-white"}`}>
                  {value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${accent ? "bg-[#C4A04A]/10" : warn ? "bg-red-500/10" : "bg-white/5"}`}>
                <Icon className={`h-5 w-5 ${accent ? "text-[#C4A04A]" : warn ? "text-red-400" : "text-[#B4B4B4]"}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href="/admin/bookings?filter=pickup-today"
          className="bg-[#1e1e1e] border border-[#2e2e2e] hover:border-[#C4A04A]/40 rounded-xl p-6 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-[#C4A04A]/10 p-3 rounded-xl">
              <Clock className="h-5 w-5 text-[#C4A04A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{checkoutsToday}</p>
              <p className="text-sm text-[#B4B4B4]">Pickups Today</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/bookings?filter=return-today"
          className="bg-[#1e1e1e] border border-[#2e2e2e] hover:border-emerald-500/40 rounded-xl p-6 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{returnsToday}</p>
              <p className="text-sm text-[#B4B4B4]">Returns Today</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/bookings?filter=pending"
          className="bg-[#1e1e1e] border border-[#2e2e2e] hover:border-yellow-500/40 rounded-xl p-6 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/10 p-3 rounded-xl">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingBookings}</p>
              <p className="text-sm text-[#B4B4B4]">Pending Confirmation</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2e2e2e] flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm tracking-wide">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-xs text-[#C4A04A] hover:text-[#d4b565] font-medium transition-colors" aria-label="View all bookings">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-[#252525]">
          {recentBookings.length === 0 ? (
            <p className="p-6 text-sm text-[#B4B4B4]">No bookings yet.</p>
          ) : (
            recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-white/[0.02] transition-colors gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate capitalize">
                    {booking.customer.firstName.toLowerCase()} {booking.customer.lastName.toLowerCase()}
                  </p>
                  <p className="text-xs text-[#B4B4B4] mt-0.5">{booking.bookingNumber}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[booking.status] ?? "bg-zinc-500/20 text-zinc-400"}`}>
                    {booking.status.replace("_", " ")}
                  </span>
                  <p className="text-xs text-[#B4B4B4] mt-0.5">{formatCurrency(booking.subtotal)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
