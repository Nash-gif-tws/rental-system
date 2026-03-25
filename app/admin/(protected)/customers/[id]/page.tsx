import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, Calendar, Package, User, Copy } from "lucide-react"

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      },
    },
  })

  if (!customer) notFound()

  const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-300",
    CONFIRMED: "bg-[#C4A04A]/20 text-[#C4A04A]",
    CHECKED_OUT: "bg-purple-500/20 text-purple-300",
    RETURNED: "bg-emerald-500/20 text-emerald-300",
    CANCELLED: "bg-red-500/20 text-red-300",
    NO_SHOW: "bg-zinc-500/20 text-zinc-400",
  }

  const totalSpend = customer.bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.subtotal - b.discountAmount, 0)

  const SectionHeader = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-[#C4A04A]" />
      <h2 className="font-semibold text-white text-sm tracking-wide">{label}</h2>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/admin/customers" className="flex items-center gap-1 text-sm text-[#B4B4B4] hover:text-white mb-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wide text-white">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-sm text-[#B4B4B4] mt-1">Customer since {formatDate(customer.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — contact + stats */}
        <div className="space-y-4">
          {/* Contact */}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5">
            <SectionHeader icon={User} label="Contact Info" />
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 text-[#B4B4B4] flex-shrink-0" />
                <a href={`mailto:${customer.email}`} className="text-white hover:text-[#C4A04A] transition-colors break-all">
                  {customer.email}
                </a>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 text-[#B4B4B4] flex-shrink-0" />
                  <a href={`tel:${customer.phone}`} className="text-white hover:text-[#C4A04A] transition-colors">
                    {customer.phone}
                  </a>
                </div>
              )}
              {customer.dateOfBirth && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Calendar className="h-4 w-4 text-[#B4B4B4] flex-shrink-0" />
                  <span className="text-white">{formatDate(customer.dateOfBirth)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-5">
            <SectionHeader icon={Package} label="Summary" />
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#B4B4B4]">Total bookings</span>
                <span className="font-semibold text-white">{customer.bookings.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#B4B4B4]">Active bookings</span>
                <span className="font-semibold text-white">
                  {customer.bookings.filter((b) => ["PENDING", "CONFIRMED", "CHECKED_OUT"].includes(b.status)).length}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#2e2e2e] pt-3 mt-1">
                <span className="text-[#B4B4B4]">Total spend</span>
                <span className="font-bold text-[#C4A04A]">{formatCurrency(totalSpend)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — booking history */}
        <div className="lg:col-span-2">
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2e2e2e]">
              <h2 className="font-semibold text-white text-sm">Booking History</h2>
            </div>
            {customer.bookings.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[#B4B4B4]/50">No bookings yet</div>
            ) : (
              <div className="divide-y divide-[#2e2e2e]">
                {customer.bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center hover:bg-white/[0.02] transition-colors group">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="flex-1 flex items-start justify-between px-6 py-4 min-w-0"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-white group-hover:text-[#C4A04A] transition-colors">
                            {booking.bookingNumber}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[booking.status] ?? "bg-zinc-500/20 text-zinc-400"}`}>
                            {booking.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-[#B4B4B4]">
                          {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                        </p>
                        <p className="text-xs text-[#B4B4B4]/50 truncate">
                          {booking.items.map((i) => i.product.name).join(", ")}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-bold text-white">
                          {formatCurrency(booking.subtotal - booking.discountAmount)}
                        </p>
                        <p className="text-xs text-[#B4B4B4]/50 mt-0.5">{formatDate(booking.createdAt)}</p>
                      </div>
                    </Link>
                    <div className="pr-4 flex-shrink-0">
                      <Link
                        href={`/admin/pos?duplicate=${booking.id}`}
                        title="Duplicate this booking"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#B4B4B4] hover:text-[#C4A04A] hover:bg-[#C4A04A]/10 transition-colors text-xs font-medium"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Duplicate</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
