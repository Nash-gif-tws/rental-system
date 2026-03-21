import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, User, Calendar, Package, CreditCard, ClipboardList } from "lucide-react"
import BookingActions from "@/components/admin/BookingActions"

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: { include: { category: true } },
          unit: true,
        },
      },
    },
  })

  if (!booking) notFound()

  const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-300",
    CONFIRMED: "bg-[#C4A04A]/20 text-[#C4A04A]",
    CHECKED_OUT: "bg-purple-500/20 text-purple-300",
    RETURNED: "bg-emerald-500/20 text-emerald-300",
    CANCELLED: "bg-red-500/20 text-red-300",
    NO_SHOW: "bg-zinc-500/20 text-zinc-400",
  }

  const SectionHeader = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-[#C4A04A]" />
      <h2 className="font-semibold text-white text-sm tracking-wide">{label}</h2>
    </div>
  )

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/bookings" className="flex items-center gap-1 text-sm text-[#B4B4B4] hover:text-white mb-2 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Bookings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-wide text-white">{booking.bookingNumber}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[booking.status] ?? "bg-zinc-500/20 text-zinc-400"}`}>
              {booking.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm text-[#B4B4B4] mt-1">Created {formatDateTime(booking.createdAt)}</p>
        </div>
        <BookingActions booking={booking} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rental Period */}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6">
            <SectionHeader icon={Calendar} label="Rental Period" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-[#B4B4B4] uppercase tracking-widest">Start Date</p>
                <p className="font-medium text-white mt-1">{formatDate(booking.startDate)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#B4B4B4] uppercase tracking-widest">End Date</p>
                <p className="font-medium text-white mt-1">{formatDate(booking.endDate)}</p>
              </div>
              {booking.pickupDate && (
                <div>
                  <p className="text-[10px] text-[#B4B4B4] uppercase tracking-widest">Actual Pickup</p>
                  <p className="font-medium text-white mt-1">{formatDateTime(booking.pickupDate)}</p>
                </div>
              )}
              {booking.returnDate && (
                <div>
                  <p className="text-[10px] text-[#B4B4B4] uppercase tracking-widest">Actual Return</p>
                  <p className="font-medium text-white mt-1">{formatDateTime(booking.returnDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6">
            <SectionHeader icon={Package} label="Equipment" />
            <div className="space-y-2">
              {booking.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-[#252525] rounded-lg">
                  <div>
                    <p className="font-medium text-white text-sm">{item.product.name}</p>
                    <div className="flex gap-3 mt-0.5">
                      {item.size && <p className="text-xs text-[#B4B4B4]">Size: {item.size}</p>}
                      {item.unit && (
                        <p className="text-xs text-[#B4B4B4]">
                          Unit: {item.unit.serialNumber ?? item.unit.id.slice(-6)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white text-sm">{formatCurrency(item.unitPrice)}</p>
                    {item.returnCondition && (
                      <span className="text-xs text-[#B4B4B4]">Returned: {item.returnCondition}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fitting Info */}
          {(booking.height || booking.weight || booking.skillLevel || booking.bootSize) && (
            <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6">
              <SectionHeader icon={ClipboardList} label="Fitting Info" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {booking.height && (
                  <div>
                    <p className="text-[10px] text-[#B4B4B4] uppercase tracking-widest">Height</p>
                    <p className="font-medium text-white mt-1">{booking.height} cm</p>
                  </div>
                )}
                {booking.weight && (
                  <div>
                    <p className="text-[10px] text-[#B4B4B4] uppercase tracking-widest">Weight</p>
                    <p className="font-medium text-white mt-1">{booking.weight} kg</p>
                  </div>
                )}
                {booking.bootSize && (
                  <div>
                    <p className="text-[10px] text-[#B4B4B4] uppercase tracking-widest">Boot Size</p>
                    <p className="font-medium text-white mt-1">EU {booking.bootSize}</p>
                  </div>
                )}
                {booking.skillLevel && (
                  <div>
                    <p className="text-[10px] text-[#B4B4B4] uppercase tracking-widest">Skill Level</p>
                    <p className="font-medium text-white mt-1 capitalize">{booking.skillLevel.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {(booking.notes || booking.staffNotes) && (
            <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
              {booking.notes && (
                <div>
                  <p className="text-[10px] text-[#B4B4B4] uppercase tracking-widest mb-1">Customer Notes</p>
                  <p className="text-sm text-[#E6E6E6]">{booking.notes}</p>
                </div>
              )}
              {booking.staffNotes && (
                <div>
                  <p className="text-[10px] text-[#B4B4B4] uppercase tracking-widest mb-1">Staff Notes</p>
                  <p className="text-sm text-[#E6E6E6]">{booking.staffNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6">
            <SectionHeader icon={User} label="Customer" />
            <div className="space-y-2">
              <Link
                href="/admin/customers"
                className="block font-medium text-[#C4A04A] hover:text-[#b3e600] transition-colors"
              >
                {booking.customer.firstName} {booking.customer.lastName}
              </Link>
              <p className="text-sm text-[#B4B4B4]">{booking.customer.email}</p>
              {booking.customer.phone && (
                <p className="text-sm text-[#B4B4B4]">{booking.customer.phone}</p>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6">
            <SectionHeader icon={CreditCard} label="Payment" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#B4B4B4]">Subtotal</span>
                <span className="font-medium text-white">{formatCurrency(booking.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#B4B4B4]">Deposit</span>
                <span className="font-medium text-white">{formatCurrency(booking.depositAmount)}</span>
              </div>
              <div className="border-t border-[#2e2e2e] pt-2 flex justify-between text-sm font-semibold">
                <span className="text-[#B4B4B4]">Total Paid</span>
                <span className="text-[#C4A04A]">{formatCurrency(booking.totalPaid)}</span>
              </div>
            </div>
            {booking.waiverSigned && (
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                <span>✓ Waiver signed {booking.waiverSignedAt ? formatDate(booking.waiverSignedAt) : ""}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
