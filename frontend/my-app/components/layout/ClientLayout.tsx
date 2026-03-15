'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

// Pages that should NOT show the sidebar
const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register'];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (isPublic) {
    return <>{children}</>;
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