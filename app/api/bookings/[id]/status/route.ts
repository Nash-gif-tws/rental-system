import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { BookingStatus } from "@prisma/client"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { status } = await req.json()

  const update: any = { status }

  if (status === "CHECKED_OUT") update.pickupDate = new Date()
  if (status === "RETURNED") update.returnDate = new Date()

  const booking = await prisma.booking.update({
    where: { id },
    data: update,
  })

  return NextResponse.json(booking)
}
