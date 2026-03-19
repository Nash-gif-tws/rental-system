import type { Metadata } from "next"
import { Bebas_Neue, Cormorant_Garamond, DM_Sans } from "next/font/google"
import "./globals.css"

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
})

const dmSans = DM_Sans({
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
    <html lang="en" className={`${bebasNeue.variable} ${cormorant.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
