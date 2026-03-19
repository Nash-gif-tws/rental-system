import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { BookingStatus } from "@prisma/client"

const VALID_STATUSES = new Set<string>(Object.values(BookingStatus))

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  let status: string
  try {
    const body = await req.json()
    status = body.status
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!status || !VALID_STATUSES.has(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${[...VALID_STATUSES].join(", ")}` },
      { status: 422 }
    )
  }

  try {
    const update: Record<string, unknown> = { status }
    if (status === "CHECKED_OUT") update.pickupDate = new Date()
    if (status === "RETURNED") update.returnDate = new Date()

    const booking = await prisma.booking.update({
      where: { id },
      data: update,
    })

    return NextResponse.json(booking)
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }
    console.error("[bookings/status] PATCH error:", err)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
