import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams

  const customers = await prisma.customer.findMany({
    where: params.q
      ? {
          OR: [
            { firstName: { contains: params.q, mode: "insensitive" } },
            { lastName: { contains: params.q, mode: "insensitive" } },
            { email: { contains: params.q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase">Customers</h1>

      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-4">
        <form>
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search by name or email..."
            className="w-full max-w-sm px-4 py-2 bg-[#121212] border border-[#333] rounded-lg text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#C4A04A] focus:ring-1 focus:ring-[#C4A04A] transition-colors"
          />
        </form>
      </div>

      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#2e2e2e]">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Name</th>
              <th className="text-left px-6 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Email</th>
              <th className="text-left px-6 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Phone</th>
              <th className="text-left px-6 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Bookings</th>
              <th className="text-left px-6 py-3 text-xs font-medium tracking-widest uppercase text-[#B4B4B4]">Last Booking</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525]">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#B4B4B4]">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="font-medium text-[#C4A04A] hover:text-[#d4b565] transition-colors"
                    >
                      {customer.firstName} {customer.lastName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-[#E6E6E6]">{customer.email}</td>
                  <td className="px-6 py-4 text-[#E6E6E6]">{customer.phone ?? "—"}</td>
                  <td className="px-6 py-4 text-[#E6E6E6]">{customer._count.bookings}</td>
                  <td className="px-6 py-4 text-[#B4B4B4] text-xs">
                    {customer.bookings[0] ? formatDate(customer.bookings[0].createdAt) : "—"}
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
