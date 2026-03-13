'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMyProfile,
  getMyWallets,
  getMyFunding,
  getSwapHistory,
} from '@/lib/services';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [funding, setFunding] = useState<any[]>([]);
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }

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
        if (walletsData.status === 'fulfilled') setWallets(walletsData.value ?? []);
        if (fundingData.status === 'fulfilled') setFunding(fundingData.value ?? []);
        if (swapsData.status === 'fulfilled') setSwaps(swapsData.value ?? []);
      } catch (err: any) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [router]);

  const totalWalletBalance = wallets.reduce(
    (sum: number, w: any) => sum + parseFloat(w.balance ?? 0),
    0,
  );

  const recentFunding = funding.slice(0, 5);
  const recentSwaps = swaps.slice(0, 3);

  const statusColor = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      completed: { bg: '#d4edda', text: '#155724' },
      pending: { bg: '#fff3cd', text: '#856404' },
      failed: { bg: '#f8d7da', text: '#721c24' },
      funded: { bg: '#cce5ff', text: '#004085' },
      cancelled: { bg: '#e2e3e5', text: '#383d41' },
    };
    return map[status?.toLowerCase()] ?? { bg: '#f8f9fa', text: '#666' };
  };

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: '#666' }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 24px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>
            Welcome back, {profile?.username || profile?.email?.split('@')[0] || 'User'} 👋
          </h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
            {profile?.email} · Role: {profile?.role ?? localStorage.getItem('role') ?? 'user'}
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            router.push('/auth/login');
          }}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#666',
          }}
        >
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {[
          {
            label: 'Main Balance',
            value: `$${parseFloat(profile?.balance ?? 0).toFixed(2)}`,
            bg: '#f0f8ff',
            color: '#0066cc',
          },
          {
            label: 'Wallet Balance',
            value: `$${totalWalletBalance.toFixed(2)}`,
            bg: '#f3e5f5',
            color: '#7b1fa2',
          },
          {
            label: 'Wallets',
            value: wallets.length,
            bg: '#e8f5e9',
            color: '#2e7d32',
          },
          {
            label: 'Transactions',
            value: funding.length,
            bg: '#fff3e0',
            color: '#e65100',
          },
          {
            label: 'Swaps',
            value: swaps.length,
            bg: '#fce4ec',
            color: '#c62828',
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              padding: '20px',
              background: card.bg,
              borderRadius: '10px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#666' }}>
              {card.label}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: 'bold',
                color: card.color,
              }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '12px', fontSize: '18px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
              style={{
                padding: '10px 20px',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}
      >
        {/* Recent Funding */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '18px' }}>Recent Transactions</h2>
            <button
              onClick={() => router.push('/funding')}
              style={{
                fontSize: '13px',
                color: '#0066cc',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              View all →
            </button>
          </div>
          {recentFunding.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                background: '#f8f9fa',
                borderRadius: '8px',
                color: '#888',
                fontSize: '14px',
              }}
            >
              No transactions yet.{' '}
              <span
                style={{ color: '#0066cc', cursor: 'pointer' }}
                onClick={() => router.push('/funding')}
              >
                Make a deposit
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentFunding.map((f: any) => {
                const sc = statusColor(f.status);
                return (
                  <div
                    key={f.id}
                    style={{
                      padding: '12px 16px',
                      background: 'white',
                      border: '1px solid #eee',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 500, fontSize: '14px' }}>
                        {f.type === 'deposit' ? '⬇️ Deposit' : '⬆️ Withdrawal'} · {f.asset}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>
                        {new Date(f.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>
                        ${parseFloat(f.amount).toFixed(2)}
                      </p>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: sc.bg,
                          color: sc.text,
                        }}
                      >
                        {f.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Wallet Balances */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '18px' }}>Asset Wallets</h2>
            <button
              onClick={() => router.push('/wallet')}
              style={{
                fontSize: '13px',
                color: '#0066cc',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              View all →
            </button>
          </div>
          {wallets.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                background: '#f8f9fa',
                borderRadius: '8px',
                color: '#888',
                fontSize: '14px',
              }}
            >
              No wallets yet.{' '}
              <span
                style={{ color: '#0066cc', cursor: 'pointer' }}
                onClick={() => router.push('/wallet')}
              >
                Fund a wallet
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {wallets.map((w: any) => (
                <div
                  key={w.id}
                  style={{
                    padding: '12px 16px',
                    background: 'white',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: '14px' }}>
                      {w.asset}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#aaa' }}>
                      {w.walletAddress?.slice(0, 16)}...
                    </p>
                  </div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>
                    {parseFloat(w.balance).toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Recent Swaps */}
          {recentSwaps.length > 0 && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '20px 0 12px',
                }}
              >
                <h2 style={{ margin: 0, fontSize: '18px' }}>Recent Swaps</h2>
                <button
                  onClick={() => router.push('/swap')}
                  style={{
                    fontSize: '13px',
                    color: '#0066cc',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  View all →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentSwaps.map((s: any) => {
                  const sc = statusColor(s.status);
                  return (
                    <div
                      key={s.id}
                      style={{
                        padding: '12px 16px',
                        background: 'white',
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
                        {s.fromAsset} → {s.toAsset}
                      </p>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>
                          {parseFloat(s.fromAmount).toFixed(4)}
                        </p>
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: sc.bg,
                            color: sc.text,
                          }}
                        >
                          {s.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}