import "./globals.css"
import { ReactNode } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "P2P Exchange",
  description: "Secure peer-to-peer trading platform",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-6 py-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}