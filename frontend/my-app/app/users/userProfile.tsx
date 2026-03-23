// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AxiosError } from 'axios';

// Import your service functions
import { getMyProfile, getMyTrades } from '@/lib/services';

// Types based on your Prisma schema
interface UserProfile {
  email: string;
  username: string | null;
  balance: number;
  wallets: {
    balance: number;
  }[];
  walletAddress: string | null;
}

interface Trade {
  id: string;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  amount?: number;
  price?: number;
  buyerId: string;
  sellerId: string;
  offerId?: string;
  offer?: {
    id: string;
    title?: string;
    currency?: string;
    // other offer fields
  };
  escrow?: {
    id: string;
    status: string;
    amount: number;
    // other escrow fields
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch both profile and trades in parallel using the service functions
        const [profileData, tradesData] = await Promise.all([
          getMyProfile(),
          getMyTrades().catch((err) => {
            console.log('Trades fetch failed:', err);
            return []; // If trades fail, return empty array
          }),
        ]);

        setProfile(profileData);
        setTrades(Array.isArray(tradesData) ? tradesData : []);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);

        if (err instanceof AxiosError) {
          if (err.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
            return;
          }

          // Handle specific error messages
          const errorMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            'Failed to load dashboard data';

          setError(errorMessage);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Calculate total wallet balance from all wallets
  const totalWalletBalance =
    profile?.wallets?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) ||
    0;

  // Helper to format number with commas and 2 decimal places
  const formatBalance = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '0.00';
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2>Loading dashboard...</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
        <div
          style={{
            color: '#721c24',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '6px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ marginBottom: '10px', color: '#721c24' }}>Error</h3>
          <p>{error}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid #eee',
        }}
      >
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
          }}
          style={{
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Logout
        </button>
      </div>

      {/* Profile Section */}
      {profile && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Profile Information</h2>

          {/* Balance Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '10px',
                padding: '20px',
                color: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <h3
                style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}
              >
                Account Balance
              </h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                ${formatBalance(profile.balance)}
              </p>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '10px',
                padding: '20px',
                color: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              <h3
                style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}
              >
                Wallet Balance
              </h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                ${totalWalletBalance.toFixed(2)}
              </p>
            </div>

            {profile.walletAddress && (
              <div
                style={{
                  background:
                    'linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)',
                  borderRadius: '10px',
                  padding: '20px',
                  color: 'white',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  gridColumn: 'span 2',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 10px 0',
                    fontSize: '16px',
                    opacity: 0.9,
                  }}
                >
                  Wallet Address
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {profile.walletAddress}
                </p>
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div
            style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '5px',
                  }}
                >
                  Username
                </label>
                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: 0,
                  }}
                >
                  {profile.username || 'Not set'}
                </p>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '5px',
                  }}
                >
                  Email
                </label>
                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    margin: 0,
                  }}
                >
                  {profile.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trades Section */}
      <div>
        <h2 style={{ marginBottom: '20px' }}>Your Trades</h2>
        {trades.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gap: '15px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            }}
          >
            {trades.map((trade) => {
              const tradeAmount = trade.escrow?.amount || trade.amount || 0;
              const tradeStatus =
                trade.escrow?.status || trade.status || 'pending';

              return (
                <div
                  key={trade.id}
                  style={{
                    background: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#666',
                        background: '#e9ecef',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      Trade #{trade.id.slice(0, 8)}
                    </span>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background:
                          tradeStatus === 'completed'
                            ? '#d4edda'
                            : tradeStatus === 'cancelled'
                              ? '#f8d7da'
                              : '#fff3cd',
                        color:
                          tradeStatus === 'completed'
                            ? '#155724'
                            : tradeStatus === 'cancelled'
                              ? '#721c24'
                              : '#856404',
                      }}
                    >
                      {tradeStatus}
                    </span>
                  </div>

                  {trade.offer && (
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '10px',
                      }}
                    >
                      Offer:{' '}
                      {trade.offer.title ||
                        `Offer #${trade.offer.id.slice(0, 8)}`}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      ${tradeAmount.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              background: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <p style={{ color: '#666', marginBottom: '20px' }}>
              You haven't made any trades yet.
            </p>
            <button
              onClick={() => router.push('/funding')}
              style={{
                padding: '12px 24px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Start Trading
            </button>
          </div>
        )}
      </div>
    </div>
  );
}