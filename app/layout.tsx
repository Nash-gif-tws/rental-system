import type { Metadata } from "next"
import { Syne, Jost } from "next/font/google"
import "./globals.css"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Snowskiers Warehouse — Ski & Snowboard Hire Sydney",
  description: "Rent ski, snowboard & snow gear from Sydney's most trusted snow sports store. Pick up in Rockdale on your way to the Snowy Mountains. Book online & save 15%.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  )
}
