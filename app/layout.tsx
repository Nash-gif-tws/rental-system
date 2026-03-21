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
  metadataBase: new URL("https://rental-system-production.up.railway.app"),
  openGraph: {
    title: "Snowskiers Warehouse — Ski & Snowboard Hire Sydney",
    description: "Sydney's finest ski & snowboard hire since 1984. Atomic skis, Burton boards, retail-quality outerwear. Pick up in Rockdale — on your way to Perisher & Thredbo.",
    url: "https://rental-system-production.up.railway.app",
    siteName: "Snowskiers Warehouse",
    images: [{ url: "/hero.png", width: 1200, height: 630, alt: "Snowskiers Warehouse — Ski & Snowboard Hire Sydney" }],
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Snowskiers Warehouse — Ski & Snowboard Hire Sydney",
    description: "Sydney's finest ski & snowboard hire since 1984. Book online & save 15%.",
    images: ["/hero.png"],
  },
  keywords: ["ski hire sydney", "snowboard hire sydney", "ski rental rockdale", "snow gear hire nsw", "perisher ski hire", "thredbo snowboard rental"],
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  )
}
