import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'P2P Exchange',
  description: 'P2P Crypto Trading Platform',
};

// Pages that should NOT show the sidebar
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/'];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

// Client wrapper to conditionally show sidebar
import ClientLayout from '@/components/layout/ClientLayout';

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}