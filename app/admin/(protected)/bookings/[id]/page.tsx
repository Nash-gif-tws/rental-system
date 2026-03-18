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
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    CHECKED_OUT: "bg-purple-100 text-purple-800",
    RETURNED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    NO_SHOW: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/bookings" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Bookings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{booking.bookingNumber}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${STATUS_COLORS[booking.status]}`}>
              {booking.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Created {formatDateTime(booking.createdAt)}</p>
        </div>
        <BookingActions booking={booking} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rental Period */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-sky-600" />
              <h2 className="font-semibold text-gray-900">Rental Period</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Start Date</p>
                <p className="font-medium text-gray-900 mt-1">{formatDate(booking.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">End Date</p>
                <p className="font-medium text-gray-900 mt-1">{formatDate(booking.endDate)}</p>
              </div>
              {booking.pickupDate && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Actual Pickup</p>
                  <p className="font-medium text-gray-900 mt-1">{formatDateTime(booking.pickupDate)}</p>
                </div>
              )}
              {booking.returnDate && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Actual Return</p>
                  <p className="font-medium text-gray-900 mt-1">{formatDateTime(booking.returnDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-sky-600" />
              <h2 className="font-semibold text-gray-900">Equipment</h2>
            </div>
            <div className="space-y-3">
              {booking.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <div className="flex gap-3 mt-0.5">
                      {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                      {item.unit && (
                        <p className="text-xs text-gray-500">
                          Unit: {item.unit.serialNumber ?? item.unit.id.slice(-6)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(item.unitPrice)}</p>
                    {item.returnCondition && (
                      <span className="text-xs text-gray-500">Returned: {item.returnCondition}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fitting Info */}
          {(booking.height || booking.weight || booking.skillLevel || booking.bootSize) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="h-5 w-5 text-sky-600" />
                <h2 className="font-semibold text-gray-900">Fitting Info</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {booking.height && (
                  <div>
                    <p className="text-xs text-gray-500">Height</p>
                    <p className="font-medium text-gray-900">{booking.height} cm</p>
                  </div>
                )}
                {booking.weight && (
                  <div>
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="font-medium text-gray-900">{booking.weight} kg</p>
                  </div>
                )}
                {booking.bootSize && (
                  <div>
                    <p className="text-xs text-gray-500">Boot Size</p>
                    <p className="font-medium text-gray-900">EU {booking.bootSize}</p>
                  </div>
                )}
                {booking.skillLevel && (
                  <div>
                    <p className="text-xs text-gray-500">Skill Level</p>
                    <p className="font-medium text-gray-900 capitalize">{booking.skillLevel.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {(booking.notes || booking.staffNotes) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              {booking.notes && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Customer Notes</p>
                  <p className="text-sm text-gray-700">{booking.notes}</p>
                </div>
              )}
              {booking.staffNotes && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Staff Notes</p>
                  <p className="text-sm text-gray-700">{booking.staffNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-sky-600" />
              <h2 className="font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="space-y-2">
              <Link
                href={`/customers/${booking.customerId}`}
                className="block font-medium text-sky-600 hover:text-sky-700"
              >
                {booking.customer.firstName} {booking.customer.lastName}
              </Link>
              <p className="text-sm text-gray-600">{booking.customer.email}</p>
              {booking.customer.phone && (
                <p className="text-sm text-gray-600">{booking.customer.phone}</p>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-sky-600" />
              <h2 className="font-semibold text-gray-900">Payment</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(booking.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Deposit</span>
                <span className="font-medium">{formatCurrency(booking.depositAmount)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-semibold">
                <span>Total Paid</span>
                <span>{formatCurrency(booking.totalPaid)}</span>
              </div>
            </div>
            {booking.waiverSigned && (
              <div className="mt-4 flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                <span>✓ Waiver signed {booking.waiverSignedAt ? formatDate(booking.waiverSignedAt) : ""}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
