import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays } from "date-fns"
import { formatSydney } from "@/lib/tz"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = new Date(date)
  return isNaN(d.getTime()) ? "—" : formatSydney(d, "dd MMM yyyy")
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = new Date(date)
  return isNaN(d.getTime()) ? "—" : formatSydney(d, "dd MMM yyyy, h:mm a")
}

export function generateBookingNumber(): string {
  const prefix = "SSW"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function getRentalDays(startDate: Date, endDate: Date): number {
  return Math.max(1, differenceInDays(endDate, startDate))
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    CHECKED_OUT: "bg-purple-100 text-purple-800",
    RETURNED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    NO_SHOW: "bg-gray-100 text-gray-800",
  }
  return colors[status] ?? "bg-gray-100 text-gray-800"
}

export function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    EXCELLENT: "bg-green-100 text-green-800",
    GOOD: "bg-blue-100 text-blue-800",
    FAIR: "bg-yellow-100 text-yellow-800",
    NEEDS_SERVICE: "bg-red-100 text-red-800",
    RETIRED: "bg-gray-100 text-gray-800",
  }
  return colors[condition] ?? "bg-gray-100 text-gray-800"
}
