/**
 * Timezone helpers — all times are treated as Sydney (Australia/Sydney).
 *
 * The server runs in UTC (Railway). These helpers ensure that "today",
 * day boundaries, and display formatting all reflect Sydney local time.
 *
 * date-fns-tz v3 API:
 *   toZonedTime(utcDate, tz)   → Date whose .getFullYear()/.getMonth() etc. give the Sydney local values
 *   fromZonedTime(localDate, tz) → UTC Date for a wall-clock time in Sydney
 *   formatTz(date, fmt, { timeZone }) → format a UTC date as if it were in tz
 */
import { toZonedTime, fromZonedTime, format as formatTz } from "date-fns-tz"
import { startOfDay, endOfDay } from "date-fns"

export const SYDNEY_TZ = "Australia/Sydney"

/** Current UTC instant (unchanged — just a semantic alias). */
export function nowUTC(): Date {
  return new Date()
}

/** Current time expressed as Sydney local — use .getFullYear() / .getMonth() / .getDate() to get Sydney calendar values. */
export function nowInSydney(): Date {
  return toZonedTime(new Date(), SYDNEY_TZ)
}

/** "YYYY-MM-DD" for today in Sydney. */
export function sydneyTodayStr(): string {
  const d = nowInSydney()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * Given a "YYYY-MM-DD" string (a Sydney calendar date), return UTC start/end
 * timestamps that bracket that full day in Sydney.
 *
 * e.g. 2024-07-15 in Sydney (AEST, UTC+10):
 *   start = 2024-07-14T14:00:00Z
 *   end   = 2024-07-15T13:59:59.999Z
 */
export function sydneyDayBounds(dateStr: string): { start: Date; end: Date } {
  // Parse the date as Sydney midnight
  const localMidnight = new Date(`${dateStr}T00:00:00`)
  const utcStart = fromZonedTime(localMidnight, SYDNEY_TZ)
  const utcEnd = new Date(utcStart.getTime() + 24 * 60 * 60 * 1000 - 1)
  return { start: utcStart, end: utcEnd }
}

/**
 * Format a UTC Date for display using Sydney local time.
 * Uses date-fns format tokens (e.g. "EEEE d MMMM yyyy", "h:mm a").
 */
export function formatSydney(date: Date | string, fmt: string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return formatTz(d, fmt, { timeZone: SYDNEY_TZ })
}

/**
 * Returns the UTC Date objects for start-of-day and end-of-day in Sydney,
 * for use in Prisma `gte` / `lte` queries.
 *
 * Equivalent to: "all records whose Sydney local date equals dateStr"
 */
export function sydneyDayPrismaRange(dateStr: string) {
  return sydneyDayBounds(dateStr)
}

/**
 * UTC boundaries for the current calendar month in Sydney.
 * Use for Prisma `gte` / `lte` on `createdAt` / `startDate` etc.
 */
export function sydneyMonthBounds(): { start: Date; end: Date } {
  const now = nowInSydney()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstOfMonth = new Date(year, month, 1, 0, 0, 0)
  const firstOfNext  = new Date(year, month + 1, 1, 0, 0, 0)
  const start = fromZonedTime(firstOfMonth, SYDNEY_TZ)
  const end   = new Date(fromZonedTime(firstOfNext, SYDNEY_TZ).getTime() - 1)
  return { start, end }
}

/**
 * "YYYY-MM-DD" string for tomorrow in Sydney.
 */
export function sydneyTomorrowStr(): string {
  const d = nowInSydney()
  d.setDate(d.getDate() + 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * UTC start of "yesterday" in Sydney — used for past-date validation.
 * Any booking startDate stored as midnight UTC must be >= this to be valid.
 */
export function sydneyYesterdayStart(): Date {
  const d = nowInSydney()
  d.setDate(d.getDate() - 1)
  const year = d.getFullYear()
  const month = d.getMonth()
  const day = d.getDate()
  return fromZonedTime(new Date(year, month, day, 0, 0, 0), SYDNEY_TZ)
}
