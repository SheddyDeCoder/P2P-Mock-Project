// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
// import { SidebarProvider } from "@/components/ui/sidebar"
// import { AppSidebar } from "@/components/app-sidebar"  // Uncomment when you add sidebar

export const metadata: Metadata = {
  title: 'P2P Trade Dashboard',
  description: 'Maximilian P2P Crypto Escrow Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased min-h-screen">
        {/* Uncomment when you add the sidebar */}
        {/* <SidebarProvider> */}
          {/* <AppSidebar /> */}
          <main className="flex-1">
            {children}
          </main>
        {/* </SidebarProvider> */}
      </body>
    </html>
  )
}