// app/layout.tsx
import './globals.css'

export const metadata = {
  title: 'P2P Trade Dashboard',
  description: 'Maximilian P2P Crypto Escrow Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0f172a] text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}