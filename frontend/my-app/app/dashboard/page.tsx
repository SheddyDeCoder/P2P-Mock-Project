// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import api from "@/lib/api";  // ← your current api.ts (no auto token)

// export default function DashboardPage() {
//   const router = useRouter();
//   const [profile, setProfile] = useState<any>(null);
//   const [trades, setTrades] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       router.replace("/login");  // or "/auth/login/login" if that's your path
//       return;
//     }

//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Manually add token to headers for protected calls
//         const config = {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         };

//         const [profileResponse, tradesResponse] = await Promise.all([
//           api.get("/user/profile", config),
//           api.get("/user/trades", config),
//         ]);

//         setProfile(profileResponse.data);
//         setTrades(tradesResponse.data || []);

//         console.log("Profile:", profileResponse.data);
//         console.log("Trades:", tradesResponse.data);

//       } catch (err: any) {
//         console.error("Dashboard fetch failed:", err);
//         let msg = "Failed to load dashboard data";

//         if (err.response) {
//           msg = err.response.data?.message
//              || `Error ${err.response.status}: ${err.response.statusText}`;
//         } else if (err.request) {
//           msg = "No response from server (backend down or wrong URL?)";
//         } else {
//           msg = err.message;
//         }

//         setError(msg);

//         // If 401 → token invalid/expired → force re-login
//         if (err.response?.status === 401) {
//           localStorage.removeItem("token");
//           router.replace("/login");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [router]);

//   if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading dashboard...</div>;

//   if (error) {
//     return (
//       <div style={{ padding: "40px", color: "red", textAlign: "center" }}>
//         <h2>Error</h2>
//         <p>{error}</p>
//         <button onClick={() => window.location.reload()}>Try Again</button>
//       </div>
//     );
//   }

//   const activeTrades = trades.filter(t =>
//     ["active", "open", "pending"].includes(t.status?.toLowerCase?.() || "")
//   ).length;

//   const completedTrades = trades.filter(t =>
//     ["completed", "done", "finished"].includes(t.status?.toLowerCase?.() || "")
//   ).length;

//   return (
//     <div style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
//       <h1 style={{ marginBottom: "32px" }}>
//         Dashboard {profile?.name || profile?.username ? `– Welcome, ${profile.name || profile.username}` : ""}
//       </h1>

//       {/* ... rest of your UI (cards, create button) remains the same ... */}
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.replace('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Manually add token to headers for protected calls
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch profile and trades separately to handle errors individually
        let profileData = null;
        let tradesData = [];

        try {
          const profileResponse = await api.get('/users/profile', config);
          profileData = profileResponse.data;
          console.log('Profile:', profileData);
        } catch (profileErr: any) {
          console.log('Profile fetch failed:', profileErr);
          // Don't throw here, continue to fetch trades
        }

        try {
          // Try different possible trades endpoints
          const tradesEndpoints = [
            '/trades/my', // Try this first (if you have this endpoint)
            '/trades', // Then try the base endpoint
            '/users/trades', // Then try under users
          ];

          for (const endpoint of tradesEndpoints) {
            try {
              console.log(`Trying trades endpoint: ${endpoint}`);
              const tradesResponse = await api.get(endpoint, config);
              tradesData = tradesResponse.data || [];
              console.log(`Trades found at: ${endpoint}`, tradesData);
              break; // Stop if successful
            } catch (e) {
              console.log(`Endpoint ${endpoint} failed`);
              // Continue to next endpoint
            }
          }
        } catch (tradesErr: any) {
          console.log('All trades endpoints failed:', tradesErr);
          // If all trades endpoints fail, just show empty trades
          tradesData = [];

          // Check if it's a 403 (forbidden) and show a specific message
          if (tradesErr.response?.status === 403) {
            setError(
              "You don't have permission to view trades. Please check your account role.",
            );
          }
        }

        setProfile(profileData);
        setTrades(Array.isArray(tradesData) ? tradesData : []);
      } catch (err: any) {
        console.error('Dashboard fetch failed:', err);
        let msg = 'Failed to load dashboard data';

        if (err.response) {
          msg =
            err.response.data?.message ||
            `Error ${err.response.status}: ${err.response.statusText}`;

          if (err.response.status === 403) {
            msg =
              "You don't have permission to access this resource. Please check your account role.";
          } else if (err.response.status === 404) {
            msg += ' (Endpoint not found)';
          }
        } else if (err.request) {
          msg = 'No response from server (backend down or wrong URL?)';
        } else {
          msg = err.message;
        }

        setError(msg);

        // If 401 → token invalid/expired → force re-login
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          router.replace('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading)
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Loading dashboard...
      </div>
    );

  if (error) {
    return (
      <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '20px',
            marginRight: '10px',
          }}
        >
          Try Again
        </button>
        <button
          onClick={() => router.push('/funding')}
          style={{
            padding: '10px 20px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Go to Funding
        </button>
      </div>
    );
  }

  const activeTrades = trades.filter((t) =>
    ['active', 'open', 'pending'].includes(t.status?.toLowerCase?.() || ''),
  ).length;

  const completedTrades = trades.filter((t) =>
    ['completed', 'done', 'finished'].includes(t.status?.toLowerCase?.() || ''),
  ).length;

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '32px' }}>
        Dashboard{' '}
        {profile?.name || profile?.username
          ? `– Welcome, ${profile.name || profile.username}`
          : ''}
      </h1>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            padding: '20px',
            background: '#f0f8ff',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
            Total Trades
          </h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            {trades.length}
          </p>
        </div>
        <div
          style={{
            padding: '20px',
            background: '#fff3e0',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
            Active
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#ff9800',
            }}
          >
            {activeTrades}
          </p>
        </div>
        <div
          style={{
            padding: '20px',
            background: '#e8f5e9',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
            Completed
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#4caf50',
            }}
          >
            {completedTrades}
          </p>
        </div>
      </div>

      {/* Profile Info */}
      {profile && (
        <div
          style={{
            marginBottom: '32px',
            padding: '20px',
            background: '#f9f9f9',
            borderRadius: '8px',
          }}
        >
          <h2 className="text-black text-2xl font-bold mt-0 mb-4">Profile</h2>

          <p className="text-black mb-2">
            <strong className="font-semibold">Email:</strong>{' '}
            <span className="text-gray-800">{profile.email}</span>
          </p>

          <p className="text-black mb-2">
            <strong className="font-semibold">Username:</strong>{' '}
            <span className="text-gray-800">
              {profile.username || 'Not set'}
            </span>
          </p>

          {profile.balance !== undefined && (
            <p className="text-black mb-2">
              <strong className="font-semibold">Balance:</strong>{' '}
              <span className="text-gray-800">${profile.balance}</span>
            </p>
          )}

          {profile.walletAddress && (
            <p className="text-black mb-2">
              <strong className="font-semibold">Wallet:</strong>{' '}
              <span className="text-gray-800">{profile.walletAddress}</span>
            </p>
          )}

          {profile.wallets && profile.wallets.length > 0 && (
            <p className="text-black mb-2">
              <strong className="font-semibold">Wallets:</strong>{' '}
              <span className="text-gray-800">{profile.wallets.length}</span>
            </p>
          )}
        </div>
      )}

      {/* Trades List */}
      <div>
        <h2 style={{ marginBottom: '16px' }}>Recent Trades</h2>
        {trades.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              background: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <p
              style={{
                color: '#666',
                fontStyle: 'italic',
                marginBottom: '20px',
              }}
            >
              No trades yet.
            </p>
            <button
              onClick={() => router.push('/funding')}
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Create Your First Trade
            </button>
          </div>
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {trades.slice(0, 5).map((trade) => (
              <div
                key={trade.id}
                style={{
                  padding: '16px',
                  background: 'white',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 'bold' }}>
                    Trade #{trade.id.slice(0, 8)}
                  </span>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background:
                        trade.status === 'completed'
                          ? '#d4edda'
                          : trade.status === 'active'
                            ? '#fff3cd'
                            : trade.status === 'pending'
                              ? '#cce5ff'
                              : '#f8f9fa',
                      color:
                        trade.status === 'completed'
                          ? '#155724'
                          : trade.status === 'active'
                            ? '#856404'
                            : trade.status === 'pending'
                              ? '#004085'
                              : '#666',
                    }}
                  >
                    {trade.status || 'pending'}
                  </span>
                </div>
                <div
                  style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}
                >
                  Amount: ${trade.escrow?.amount || trade.amount || 0}
                </div>
                {trade.offer && (
                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    Offer:{' '}
                    {trade.offer.title ||
                      `Offer #${trade.offer.id?.slice(0, 8)}`}
                  </div>
                )}
                <div
                  style={{ marginTop: '4px', fontSize: '12px', color: '#999' }}
                >
                  {new Date(trade.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {trades.length > 5 && (
              <p
                style={{ textAlign: 'center', color: '#666', marginTop: '8px' }}
              >
                Showing 5 of {trades.length} trades
              </p>
            )}
          </div>
        )}
      </div>

      {/* Create Trade Button */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <button
          onClick={() => router.push('/funding')}
          style={{
            padding: '12px 32px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Create New Trade
        </button>
      </div>
    </div>
  );
}
