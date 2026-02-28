"use client"

import Link from "next/link"
import { Button } from "@/components/layout/ui/Button"

export default function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold">
          P2P Exchange
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/trades" className="hover:text-primary">
            Trades
          </Link>
          <Link href="/dashboard" className="hover:text-primary">
            Dashboard
          </Link>
          <Link href="/auth/login">
            <Button size="sm">Login</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}