import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Game Database - Crimson",
  description: "Gaming database management system",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body 
        className={`font-sans antialiased ...`}
        suppressHydrationWarning={true} // Fix 1: Body tag (already done)
      >
        {/* ✅ Fix 2: Wrap children in a top-level div 
          and apply the prop again to catch attributes injected 
          on the first element of your app.
        */}
        <div suppressHydrationWarning={true}>
          {children}
        </div>
      </body>
    </html>
  )
}