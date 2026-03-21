'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const userNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Wallet', path: '/wallet', icon: '👛' },
  { label: 'Funding', path: '/funding', icon: '🏦' },
  { label: 'Swap', path: '/swap', icon: '🔄' },
  { label: 'Offers', path: '/offers', icon: '📋' },
  { label: 'Trades', path: '/trades', icon: '🤝' },
  { label: 'Profile', path: '/profile', icon: '👤' },
];

const adminNavItems = [
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Trades', path: '/admin/trades', icon: '📁' },
  { label: 'Offers', path: '/admin/offers', icon: '📌' },
];

// ✅ Extracted OUTSIDE Sidebar — prevents React from remounting on every render
function NavContent({
  role,
  username,
  pathname,
  onNavigate,
  onLogout,
}: {
  role: string;
  username: string;
  pathname: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}) {
  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border">
        <h1 className="text-foreground font-bold text-lg tracking-tight">
          P2P <span className="text-primary">Exchange</span>
        </h1>
        {username && (
          <p className="text-muted-foreground text-xs mt-1 truncate">
            {username}
          </p>
        )}
        <span
          className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
            role === 'admin'
              ? 'bg-primary/20 text-primary'
              : role === 'moderator'
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {role}
        </span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="text-muted-foreground text-xs font-medium px-2 mb-2 uppercase tracking-wider">
          Main
        </p>
        <ul className="flex flex-col gap-1 mb-6">
          {userNavItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
                {isActive(item.path) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Admin Nav */}
        {(role === 'admin' || role === 'moderator') && (
          <>
            <p className="text-muted-foreground text-xs font-medium px-2 mb-2 uppercase tracking-wider">
              Admin
            </p>
            <ul className="flex flex-col gap-1">
              {adminNavItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => onNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                    {isActive(item.path) && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <span className="text-base">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string>('user');
  const [username, setUsername] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem('role') ?? 'user';
    setRole(storedRole);
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUsername(parsed?.username || parsed?.email?.split('@')[0] || '');
      }
    } catch {
      setUsername('');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 min-h-screen bg-card border-r border-border fixed left-0 top-0 bottom-0 z-40">
        <NavContent
          role={role}
          username={username}
          pathname={pathname}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-foreground font-bold text-base">
          P2P <span className="text-primary">Exchange</span>
        </h1>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-card border-r border-border">
            <NavContent
              role={role}
              username={username}
              pathname={pathname}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          </aside>
        </>
      )}
    </>
  );
}
