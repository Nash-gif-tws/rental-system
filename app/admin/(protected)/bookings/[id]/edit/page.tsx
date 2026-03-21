import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { revalidatePath } from "next/cache"

const STATUSES = ["PENDING", "CONFIRMED", "CHECKED_OUT", "RETURNED", "CANCELLED", "NO_SHOW"] as const

async function updateBooking(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  const status = formData.get("status") as string
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const notes = formData.get("notes") as string
  const discountCode = formData.get("discountCode") as string
  const depositAmount = parseFloat(formData.get("depositAmount") as string) || 0
  const totalPaid = parseFloat(formData.get("totalPaid") as string) || 0

  await prisma.booking.update({
    where: { id },
    data: {
      status: status as any,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes: notes || null,
      discountCode: discountCode || null,
      depositAmount,
      totalPaid,
    },
  })

  revalidatePath(`/admin/bookings/${id}`)
  redirect(`/admin/bookings/${id}`)
}

export default async function BookingEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { customer: true },
  })

  if (!booking) notFound()

  const inputClass = "w-full px-3 py-2.5 bg-[#121212] border border-[#2e2e2e] rounded-lg text-sm text-white focus:outline-none focus:border-[#C4A04A] transition-colors"
  const labelClass = "block text-[10px] font-semibold text-[#B4B4B4] uppercase tracking-[0.2em] mb-1.5"

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href={`/admin/bookings/${id}`} className="flex items-center gap-1 text-sm text-[#B4B4B4] hover:text-white mb-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Booking
        </Link>
        <h1 className="font-display text-2xl font-bold text-white">Edit {booking.bookingNumber}</h1>
        <p className="text-sm text-[#B4B4B4] mt-1">
          {booking.customer.firstName} {booking.customer.lastName} · {booking.customer.email}
        </p>
      </div>

      <form action={updateBooking} className="space-y-5">
        <input type="hidden" name="id" value={id} />

        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
          <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-[0.25em]">Booking Status</p>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" defaultValue={booking.status} className={inputClass + " bg-[#121212]"}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
          <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-[0.25em]">Rental Period</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date</label>
              <input
                type="date"
                name="startDate"
                defaultValue={booking.startDate.toISOString().split("T")[0]}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                name="endDate"
                defaultValue={booking.endDate.toISOString().split("T")[0]}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
          <p className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-[0.25em]">Payment</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Discount Code</label>
              <input
                type="text"
                name="discountCode"
                defaultValue={booking.discountCode ?? ""}
                placeholder="e.g. ONLINE15"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Deposit Paid ($)</label>
              <input
                type="number"
                step="0.01"
                name="depositAmount"
                defaultValue={booking.depositAmount}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Total Paid ($)</label>
              <input
                type="number"
                step="0.01"
                name="totalPaid"
                defaultValue={booking.totalPaid}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-6">
          <label className={labelClass}>Internal Notes</label>
          <textarea
            name="notes"
            rows={4}
            defaultValue={booking.notes ?? ""}
            placeholder="Any notes about this booking..."
            className={inputClass + " resize-none"}
          />
        </div>

        <div className="flex gap-3">
          <Link
            href={`/admin/bookings/${id}`}
            className="px-6 py-3 bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl text-sm font-semibold text-[#B4B4B4] hover:bg-white/5 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-[#C4A04A] hover:bg-[#d4b565] text-[#121212] font-bold rounded-xl text-sm tracking-wide uppercase transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
