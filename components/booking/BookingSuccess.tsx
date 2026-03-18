import { CheckCircle2, Calendar, MapPin, Phone } from "lucide-react"
import { format } from "date-fns"

export default function BookingSuccess({ booking }: { booking: any }) {
  return (
    <div className="text-center space-y-6">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="bg-green-100 rounded-full p-6">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking confirmed!</h1>
        <p className="text-gray-500 mt-2">
          Thanks {booking.customer.firstName}, your rental request has been received.
        </p>
      </div>

      {/* Booking ref */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 inline-block w-full">
        <p className="text-xs text-sky-600 font-medium uppercase tracking-wider">Booking Reference</p>
        <p className="text-2xl font-bold text-sky-700 mt-1">{booking.bookingNumber}</p>
        <p className="text-xs text-gray-500 mt-1">Save this for your records</p>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 text-left space-y-4">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-sky-600 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">Rental Period</p>
            <p className="text-sm text-gray-600">
              {format(new Date(booking.startDate), "EEEE d MMMM")} →{" "}
              {format(new Date(booking.endDate), "EEEE d MMMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-sky-600 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">Pick up in store</p>
            <p className="text-sm text-gray-600">Snowskiers Warehouse, Rockdale NSW</p>
            <p className="text-sm text-gray-500">Open 7 days during snow season</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-sky-600 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">Questions?</p>
            <a href="tel:0295973422" className="text-sm text-sky-600 font-medium">(02) 9597 3422</a>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        A confirmation has been sent to <strong>{booking.customer.email}</strong>
      </p>

      <a
        href="/book"
        className="inline-block text-sm text-sky-600 hover:text-sky-700 font-medium"
      >
        Make another booking
      </a>
    </div>
  )
}
