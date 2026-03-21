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
    },
    {
      label: "This Month Revenue",
      value: formatCurrency(monthlyRevenue._sum.subtotal ?? 0),
      icon: TrendingUp,
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

  const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-300",
    CONFIRMED: "bg-[#C4A04A]/20 text-[#C4A04A]",
    CHECKED_OUT: "bg-purple-500/20 text-purple-300",
    RETURNED: "bg-emerald-500/20 text-emerald-300",
    CANCELLED: "bg-red-500/20 text-red-300",
    NO_SHOW: "bg-zinc-500/20 text-zinc-400",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">Dashboard</h1>
        <p className="text-[#B4B4B4] text-sm mt-1">
          {today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, accent, warn }) => (
          <div
            key={label}
            className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Link href="/admin/bookings" className="text-xs text-[#C4A04A] hover:text-[#d4b565] font-medium transition-colors">
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
                className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {booking.customer.firstName} {booking.customer.lastName}
                  </p>
                  <p className="text-xs text-[#B4B4B4] mt-0.5">{booking.bookingNumber}</p>
                </div>
                <div className="text-right">
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
