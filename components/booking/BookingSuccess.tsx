import { CheckCircle2, Calendar, MapPin, Phone, Mail, Clock } from "lucide-react"
import { format } from "date-fns"

export default function BookingSuccess({ booking }: { booking: any }) {
  return (
    <div className="space-y-6">
      {/* Success */}
      <div className="text-center space-y-3 py-4">
        <div className="flex justify-center">
          <div className="bg-green-100 rounded-full p-5">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">You're all booked in!</h1>
        <p className="text-gray-500">
          Thanks {booking.customer.firstName}! We've received your rental request and will have your gear ready.
        </p>
      </div>

      {/* Booking ref */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 text-center">
        <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">Your Booking Reference</p>
        <p className="text-3xl font-bold text-sky-700 mt-1 font-mono">{booking.bookingNumber}</p>
        <p className="text-xs text-gray-500 mt-1">Screenshot or note this down · Bring it when you pick up</p>
      </div>

      {/* What's next */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-gray-900">What happens next?</h2>
        <div className="space-y-3">
          <div className="flex gap-3 text-sm">
            <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-700 font-bold text-xs flex-shrink-0 mt-0.5">1</div>
            <p className="text-gray-600">Our team reviews your booking and prepares your gear based on your fitting details.</p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-700 font-bold text-xs flex-shrink-0 mt-0.5">2</div>
            <p className="text-gray-600">Come in to our Rockdale store on your pickup date with your booking reference and a valid ID.</p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-700 font-bold text-xs flex-shrink-0 mt-0.5">3</div>
            <p className="text-gray-600">We'll fit you properly, take payment, and you're off to the mountain!</p>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Rental Period</p>
            <p className="text-sm text-gray-600">
              {format(new Date(booking.startDate), "EEEE d MMMM")} → {format(new Date(booking.endDate), "EEEE d MMMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Pick up & return</p>
            <p className="text-sm text-gray-600">Trojan Snow Skiers Warehouse</p>
            <p className="text-sm text-gray-500">Princes Highway, Rockdale NSW</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Opening hours</p>
            <p className="text-sm text-gray-500">Open 7 days during snow season</p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Need to change something?</p>
        <a href="tel:0295973422" className="flex items-center gap-2 text-sm text-sky-600 font-medium hover:text-sky-700">
          <Phone className="h-4 w-4" /> (02) 9597 3422
        </a>
        <a href="mailto:info@snowskierswarehouse.com.au" className="flex items-center gap-2 text-sm text-sky-600 font-medium hover:text-sky-700">
          <Mail className="h-4 w-4" /> info@snowskierswarehouse.com.au
        </a>
      </div>

      <div className="text-center">
        <a href="/book" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          Make another booking →
        </a>
      </div>
    </div>
  )
}
