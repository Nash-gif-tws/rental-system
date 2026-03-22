import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CHECKED_OUT",
        pickupDate: new Date(),
        pickedUpBy: session.user?.name ?? session.user?.email ?? "Staff",
      },
    })
    return NextResponse.json(booking)
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }
    console.error("[bookings/pickup] PATCH error:", err)
    return NextResponse.json({ error: "Failed to mark picked up" }, { status: 500 })
  }
}
