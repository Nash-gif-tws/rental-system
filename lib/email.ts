/**
 * Email module for Snowskiers Warehouse rental system.
 *
 * To activate, set these environment variables:
 *   SMTP_HOST      e.g. smtp.gmail.com
 *   SMTP_PORT      e.g. 587
 *   SMTP_USER      e.g. rentals@snowskiers.com.au
 *   SMTP_PASS      e.g. your app password
 *   SMTP_FROM      e.g. "Snowskiers Warehouse <rentals@snowskiers.com.au>"
 *   STORE_EMAIL    e.g. rentals@snowskiers.com.au  (receives staff copy)
 *
 * If SMTP_HOST is not set the functions log to console and return gracefully.
 */

import nodemailer from "nodemailer"
import { formatSydney } from "@/lib/tz"

// ── Transporter ──────────────────────────────────────────────────────────────

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT ?? "587"),
    secure: parseInt(SMTP_PORT ?? "587") === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
}

const FROM = process.env.SMTP_FROM ?? "Snowskiers Warehouse <rentals@snowskiers.com.au>"
const STORE_EMAIL = process.env.STORE_EMAIL ?? ""

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: Date | string) {
  return formatSydney(new Date(d), "EEEE d MMMM yyyy")
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n)
}

// ── Templates ────────────────────────────────────────────────────────────────

type BookingEmailData = {
  bookingNumber: string
  customer: { firstName: string; lastName: string; email: string; phone?: string | null }
  startDate: Date | string
  endDate: Date | string
  items: { productName: string; size?: string | null; quantity: number; unitPrice: number }[]
  subtotal: number
  discountCode?: string | null
  discountAmount?: number
  notes?: string | null
}

function buildCustomerEmailHtml(b: BookingEmailData): string {
  const total = b.subtotal - (b.discountAmount ?? 0)
  const itemRows = b.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #2e2e2e;color:#e6e6e6">
          ${i.productName}${i.size ? ` <span style="color:#b4b4b4;font-size:13px">(${i.size})</span>` : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #2e2e2e;color:#e6e6e6;text-align:right">
          ${formatCurrency(i.unitPrice * i.quantity)}
        </td>
      </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#121212;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">

    <!-- Header -->
    <div style="margin-bottom:32px">
      <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:0.1em;color:#ffffff;text-transform:uppercase">
        SNOWSKIERS<span style="color:#C4A04A">.</span>
      </p>
      <p style="margin:4px 0 0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#b4b4b4">Warehouse</p>
    </div>

    <!-- Hero -->
    <div style="background:#1e1e1e;border:1px solid #2e2e2e;border-radius:12px;padding:28px;margin-bottom:20px">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#C4A04A;font-weight:700">Booking Confirmed</p>
      <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:0.05em">${b.bookingNumber}</p>
      <p style="margin:8px 0 0;font-size:14px;color:#b4b4b4">
        Hi ${b.customer.firstName}, your rental is confirmed! We'll have everything ready for your arrival.
      </p>
    </div>

    <!-- Dates -->
    <div style="background:#1e1e1e;border:1px solid #2e2e2e;border-radius:12px;padding:24px;margin-bottom:20px">
      <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#b4b4b4">Rental Period</p>
      <div style="display:flex;gap:12px">
        <div style="flex:1;background:#252525;border-radius:8px;padding:14px;text-align:center">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#b4b4b4">Pickup</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#ffffff">${fmt(b.startDate)}</p>
        </div>
        <div style="flex:1;background:#252525;border-radius:8px;padding:14px;text-align:center">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#b4b4b4">Return</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#ffffff">${fmt(b.endDate)}</p>
        </div>
      </div>
    </div>

    <!-- Equipment -->
    <div style="background:#1e1e1e;border:1px solid #2e2e2e;border-radius:12px;padding:24px;margin-bottom:20px">
      <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#b4b4b4">Equipment</p>
      <table style="width:100%;border-collapse:collapse">
        ${itemRows}
        ${
          b.discountAmount && b.discountAmount > 0
            ? `<tr>
            <td style="padding:8px 0;color:#C4A04A;font-size:13px">Discount (${b.discountCode ?? "code"})</td>
            <td style="padding:8px 0;color:#C4A04A;text-align:right;font-size:13px">−${formatCurrency(b.discountAmount)}</td>
          </tr>`
            : ""
        }
        <tr>
          <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#ffffff">Total Due in Store</td>
          <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#C4A04A;text-align:right">${formatCurrency(total)}</td>
        </tr>
      </table>
    </div>

    <!-- What to bring -->
    <div style="background:#1e1e1e;border:1px solid #2e2e2e;border-radius:12px;padding:24px;margin-bottom:20px">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#b4b4b4">What to bring</p>
      <ul style="margin:0;padding:0 0 0 18px;color:#e6e6e6;font-size:14px;line-height:1.8">
        <li>Photo ID</li>
        <li>Payment (cash, card or EFTPOS)</li>
        ${b.customer.phone ? "" : "<li>Your phone number</li>"}
        <li style="color:#C4A04A">Under 18? Parent or guardian must be present to sign the waiver.</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid #2e2e2e">
      <p style="margin:0;font-size:13px;color:#555">Questions? Call us on <a href="tel:0295973422" style="color:#C4A04A;text-decoration:none">(02) 9597 3422</a></p>
      <p style="margin:6px 0 0;font-size:12px;color:#555">Snowskiers Warehouse · Cronulla, NSW · snowskiers.com.au</p>
    </div>

  </div>
</body>
</html>`
}

function buildStaffEmailHtml(b: BookingEmailData): string {
  const total = b.subtotal - (b.discountAmount ?? 0)
  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f5f5f5;padding:20px">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:8px;padding:24px">
  <h2 style="margin:0 0 4px">New Booking: ${b.bookingNumber}</h2>
  <p style="margin:0;color:#666;font-size:14px">Status: <strong>PENDING</strong></p>
  <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
  <p><strong>Customer:</strong> ${b.customer.firstName} ${b.customer.lastName}<br>
  <strong>Email:</strong> ${b.customer.email}<br>
  ${b.customer.phone ? `<strong>Phone:</strong> ${b.customer.phone}<br>` : ""}
  </p>
  <p><strong>Pickup:</strong> ${fmt(b.startDate)}<br>
  <strong>Return:</strong> ${fmt(b.endDate)}</p>
  <p><strong>Items:</strong><br>${b.items.map((i) => `${i.productName}${i.size ? ` — ${i.size}` : ""} × ${i.quantity} = ${formatCurrency(i.unitPrice * i.quantity)}`).join("<br>")}</p>
  ${b.discountAmount && b.discountAmount > 0 ? `<p><strong>Discount (${b.discountCode}):</strong> −${formatCurrency(b.discountAmount)}</p>` : ""}
  <p><strong>Total:</strong> ${formatCurrency(total)}</p>
  ${b.notes ? `<p><strong>Notes:</strong> ${b.notes}</p>` : ""}
</div>
</body>
</html>`
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function sendBookingConfirmation(booking: BookingEmailData): Promise<void> {
  const transporter = getTransporter()

  if (!transporter) {
    // Not configured — log and skip gracefully
    console.log(
      `[email] SMTP not configured. Would have sent confirmation to ${booking.customer.email} for booking ${booking.bookingNumber}`
    )
    return
  }

  const subject = `Booking Confirmed — ${booking.bookingNumber} | Snowskiers Warehouse`

  try {
    // Customer confirmation
    await transporter.sendMail({
      from: FROM,
      to: `${booking.customer.firstName} ${booking.customer.lastName} <${booking.customer.email}>`,
      subject,
      html: buildCustomerEmailHtml(booking),
    })

    // Staff copy
    if (STORE_EMAIL) {
      await transporter.sendMail({
        from: FROM,
        to: STORE_EMAIL,
        subject: `[New Booking] ${booking.bookingNumber} — ${booking.customer.firstName} ${booking.customer.lastName}`,
        html: buildStaffEmailHtml(booking),
      })
    }

    console.log(`[email] Confirmation sent for ${booking.bookingNumber}`)
  } catch (err) {
    // Never throw — email failure must not break the booking
    console.error(`[email] Failed to send confirmation for ${booking.bookingNumber}:`, err)
  }
}
