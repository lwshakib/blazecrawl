import type { Metadata } from "next"
import {
  Geist,
  Geist_Mono,
  Rajdhani,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

export const metadata: Metadata = {
  title: "BlazeCrawl | Premium Web Scraper & Crawler Dashboard",
  description:
    "A high-performance web page scraping, data extraction, and content synchronization platform powered by an optimized browser pool.",
  icons: {
    icon: [
      {
        url: "/favicon_io/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon_io/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      { url: "/favicon_io/favicon.ico", sizes: "any" },
    ],
    apple: [
      {
        url: "/favicon_io/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "manifest",
        url: "/favicon_io/site.webmanifest",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/favicon_io/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: "/favicon_io/android-chrome-512x512.png",
      },
    ],
  },
}

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        geist.variable,
        fontMono.variable,
        rajdhani.variable,
        jetbrainsMono.variable,
        plusJakartaSans.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
