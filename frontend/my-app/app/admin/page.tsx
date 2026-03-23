'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { easeOut, motion } from 'framer-motion';
import {
  getMyProfile,
  getMyWallets,
  getMyFunding,
  getSwapHistory,
} from '@/lib/services';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [funding, setFunding] = useState<any[]>([]);
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      router.replace('/auth/login');
      return;
    }
    if (role !== 'admin') {
      router.replace('/dashboard');
      return;
    }

    setAuthorized(true);

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileData, walletsData, fundingData, swapsData] =
          await Promise.allSettled([
            getMyProfile(),
            getMyWallets(),
            getMyFunding(),
            getSwapHistory(),
          ]);

        if (profileData.status === 'fulfilled') setProfile(profileData.value);
        if (walletsData.status === 'fulfilled')
          setWallets(walletsData.value ?? []);
        if (fundingData.status === 'fulfilled')
          setFunding(fundingData.value ?? []);
        if (swapsData.status === 'fulfilled') setSwaps(swapsData.value ?? []);
      } catch (err: any) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [router]);

  if (!authorized) return null;

  const totalWalletBalance = wallets.reduce(
    (sum: number, w: any) => sum + parseFloat(w.balance ?? 0),
    0,
  );

  const recentFunding = funding.slice(0, 4);
  const recentSwaps = swaps.slice(0, 2);
  const recentWallets = wallets.slice(0, 2);

  const statusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-primary/10 text-primary';
      case 'pending':
        return 'bg-accent text-accent-foreground';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      case 'funded':
        return 'bg-accent text-accent-foreground';
      case 'cancelled':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-destructive text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back,{' '}
            {profile?.username || profile?.email?.split('@')[0] || 'Admin'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {profile?.email} · Role: admin
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {[
            {
              label: 'Main Balance',
              value: `$${parseFloat(profile?.balance ?? 0).toFixed(2)}`,
            },
            {
              label: 'Wallet Balance',
              value: `$${totalWalletBalance.toFixed(2)}`,
            },
            { label: 'Wallets', value: wallets.length },
            { label: 'Transactions', value: funding.length },
            { label: 'Swaps', value: swaps.length },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <p className="text-muted-foreground text-xs mb-1">{card.label}</p>
              <p className="text-foreground font-bold text-xl">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Admin Sections */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-foreground mb-3">
            Admin Panel
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: '👥 Users',
                description: 'Manage user roles and accounts',
                path: '/admin/users',
              },
              {
                label: '📁 Trades',
                description: 'View and manage all trades',
                path: '/admin/trades',
              },
              {
                label: '📌 Offers',
                description: 'View and manage all offers',
                path: '/admin/offers',
              },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="bg-card border border-border rounded-xl p-5 text-left hover:bg-muted transition-colors cursor-pointer"
              >
                <p className="text-foreground font-semibold text-base mb-1">
                  {item.label}
                </p>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-foreground mb-3">
            Quick Actions
          </h2>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: '💰 Fund Account', path: '/funding' },
              { label: '🔄 Swap Assets', path: '/swap' },
              { label: '📋 Browse Offers', path: '/offers' },
              { label: '🤝 My Trades', path: '/trades' },
              { label: '👛 My Wallets', path: '/wallet' },
              { label: '👤 Profile', path: '/profile' },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => router.push(action.path)}
                className="px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">
                Recent Transactions
              </h2>
              <button
                onClick={() => router.push('/funding')}
                className="text-xs text-primary hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
              >
                View all →
              </button>
            </div>

            {recentFunding.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground text-sm mb-2">
                  No transactions yet.
                </p>
                <span
                  className="text-primary text-xs cursor-pointer underline"
                  onClick={() => router.push('/funding')}
                >
                  Make a deposit
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentFunding.map((f: any) => (
                  <div
                    key={f.id}
                    className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-foreground font-medium text-sm">
                        {f.type === 'deposit' ? '⬇️ Deposit' : '⬆️ Withdrawal'}{' '}
                        · {f.asset}
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-bold text-sm">
                        ${parseFloat(f.amount).toFixed(2)}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusStyle(f.status)}`}
                      >
                        {f.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wallets + Swaps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">
                Asset Wallets
              </h2>
              <button
                onClick={() => router.push('/wallet')}
                className="text-xs text-primary hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
              >
                View all →
              </button>
            </div>

            {wallets.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center mb-4">
                <p className="text-muted-foreground text-sm mb-2">
                  No wallets yet.
                </p>
                <span
                  className="text-primary text-xs cursor-pointer underline"
                  onClick={() => router.push('/wallet')}
                >
                  Fund a wallet
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mb-6">
                {recentWallets.map((w: any) => (
                  <div
                    key={w.asset}
                    className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-foreground font-medium text-sm">
                        {w.asset}
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {w.walletAddress?.slice(0, 16)}...
                      </p>
                    </div>
                    <p className="text-foreground font-bold text-sm">
                      {parseFloat(w.balance).toFixed(4)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {recentSwaps.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-foreground">
                    Recent Swaps
                  </h2>
                  <button
                    onClick={() => router.push('/swap')}
                    className="text-xs text-primary hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
                  >
                    View all →
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {recentSwaps.map((s: any) => (
                    <div
                      key={s.id}
                      className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between"
                    >
                      <p className="text-foreground font-medium text-sm">
                        {s.fromAsset} → {s.toAsset}
                      </p>
                      <div className="text-right">
                        <p className="text-foreground text-sm">
                          {parseFloat(s.fromAmount).toFixed(4)}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${statusStyle(s.status)}`}
                        >
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
