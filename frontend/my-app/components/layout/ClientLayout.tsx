'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

// Pages that should NOT show the sidebar (public/guest pages)
const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/offers', // guests can browse offers
  '/trades', // guests can trade
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if current path is public (exact match or starts with for nested routes)
  const isPublic =
    PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/trades/'); // guest can view trade detail too

  if (isPublic) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Guest top bar */}
        {pathname !== '/' && (
          <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
            <h1
              className="text-foreground font-bold text-base cursor-pointer"
              onClick={() => (window.location.href = '/')}
            >
              P2P <span className="text-primary">Exchange</span>
            </h1>
            <div className="flex items-center gap-3">
              <a
                href="/auth/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </a>
              <a
                href="/auth/register"
                className="text-sm px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Register
              </a>
            </div>
          </div>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      {/* Main content — offset by sidebar width on desktop, top bar on mobile */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
