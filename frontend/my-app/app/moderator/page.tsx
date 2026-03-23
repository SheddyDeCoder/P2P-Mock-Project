'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMyProfile,
  getMyTrades,
  updateTradeStatus,
  getEscrowByTrade,
  updateEscrow,
} from '@/lib/services';

export default function ModeratorPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  // Profile only — moderator has no access to wallet/funding/swap
  const [profile, setProfile] = useState<any>(null);

  // Moderator data
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [escrows, setEscrows] = useState<Record<string, any>>({});
  const [filterStatus, setFilterStatus] = useState<string>('all');

  async function fetchDashboard() {
    try {
      const profileData = await getMyProfile().catch(() => null);
      if (profileData) setProfile(profileData);
    } catch {
      // profile fetch failed silently
    }
  }

  async function fetchTrades() {
    try {
      setLoading(true);
      const data = await getMyTrades();
      setTrades(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load trades');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    if (role !== 'moderator') {
      router.replace('/dashboard');
      return;
    }
    setAuthorized(true);
    fetchTrades();
    fetchDashboard();
  }, [router]);

  useEffect(() => {
    if (!error && !success) return;
    const t = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 4000);
    return () => clearTimeout(t);
  }, [error, success]);

  if (!authorized) return null;

  const fetchEscrow = async (tradeId: string) => {
    if (escrows[tradeId] !== undefined) return;
    try {
      const data = await getEscrowByTrade(tradeId);
      setEscrows((prev) => ({ ...prev, [tradeId]: data }));
    } catch {
      setEscrows((prev) => ({ ...prev, [tradeId]: null }));
    }
  };

  const handleExpand = (tradeId: string) => {
    if (expandedId === tradeId) {
      setExpandedId(null);
    } else {
      setExpandedId(tradeId);
      fetchEscrow(tradeId);
    }
  };

  const handleTradeStatus = async (tradeId: string, status: string) => {
    setUpdatingId(tradeId);
    setError(null);
    setSuccess(null);
    try {
      await updateTradeStatus(tradeId, status);
      setSuccess(`Trade status updated to "${status}"`);
      await fetchTrades();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update trade status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEscrowUpdate = async (
    escrowId: string,
    status: 'released' | 'disputed',
  ) => {
    setUpdatingId(escrowId);
    setError(null);
    setSuccess(null);
    try {
      await updateEscrow(escrowId, { status });
      setSuccess(`Escrow ${status} successfully`);
      setEscrows({});
      if (expandedId) fetchEscrow(expandedId);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update escrow');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-primary/10 text-primary';
      case 'funded':
        return 'bg-accent text-accent-foreground';
      case 'pending':
        return 'bg-secondary text-secondary-foreground';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const escrowStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'released':
        return 'bg-primary/10 text-primary';
      case 'locked':
        return 'bg-accent text-accent-foreground';
      case 'disputed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const nextStatuses = (current: string) => {
    switch (current?.toLowerCase()) {
      case 'pending':
        return ['funded', 'cancelled'];
      case 'funded':
        return ['completed', 'cancelled'];
      default:
        return [];
    }
  };

  const getBuyer = (t: any) =>
    t.buyer?.username ||
    t.buyer?.email ||
    t.buyerId?.slice(0, 10) ||
    t.buyer_id?.slice(0, 10) ||
    'N/A';

  const getSeller = (t: any) =>
    t.seller?.username ||
    t.seller?.email ||
    t.sellerId?.slice(0, 10) ||
    t.seller_id?.slice(0, 10) ||
    'N/A';

  const filteredTrades = (
    filterStatus === 'all'
      ? trades
      : trades.filter((t) => t.status === filterStatus)
  ).slice(0, 2);

  const summaryCards = [
    { label: 'Total Trades', value: trades.length },
    {
      label: 'Pending',
      value: trades.filter((t) => t.status === 'pending').length,
    },
    {
      label: 'Funded',
      value: trades.filter((t) => t.status === 'funded').length,
    },
    {
      label: 'Completed',
      value: trades.filter((t) => t.status === 'completed').length,
    },
    {
      label: 'Cancelled',
      value: trades.filter((t) => t.status === 'cancelled').length,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back,{' '}
            {profile?.username || profile?.email?.split('@')[0] || 'Moderator'}{' '}
            🛡️
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {profile?.email} · Role: moderator
          </p>
        </div>

        {/* Feedback */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-primary/10 text-primary text-sm border border-primary/20">
            {success}
          </div>
        )}

        {/* Trade Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <p className="text-muted-foreground text-xs mb-1">{card.label}</p>
              <p className="text-foreground font-bold text-xl">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Moderator Panel Links */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-foreground mb-3">
            Moderator Panel
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: '🤝 All Trades',
                description: 'Review and manage all platform trades',
                path: '/trades',
              },
              // {
              //   label: '🔐 Escrow Queue',
              //   description: 'Review and resolve escrow disputes',
              //   path: '/moderator/escrow',
              // },
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
              { label: '📋 Browse Offers', path: '/offers' },
              { label: '🤝 My Trades', path: '/trades' },
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

        {/* Trades Section */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="text-base font-semibold text-foreground">
              All Trades
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {['all', 'pending', 'funded', 'completed', 'cancelled'].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      filterStatus === s
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ),
              )}
              <button
                onClick={fetchTrades}
                className="text-xs text-primary hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
              >
                Refresh ↺
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-muted-foreground text-sm">Loading trades...</p>
            </div>
          ) : filteredTrades.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-muted-foreground text-sm">No trades found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredTrades.map((t: any) => {
                const isExpanded = expandedId === t.id;
                const isUpdating = updatingId === t.id;
                const actions = nextStatuses(t.status);
                const escrow = escrows[t.id];

                return (
                  <div
                    key={t.id}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-foreground font-semibold font-mono text-sm">
                          #{t.id?.slice(0, 12)}...
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle(t.status)}`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        {[
                          {
                            label: 'Amount',
                            value: `$${parseFloat(t.amount ?? 0).toFixed(2)}`,
                          },
                          {
                            label: 'Date',
                            value: new Date(t.createdAt).toLocaleDateString(),
                          },
                          { label: 'Buyer', value: getBuyer(t) },
                          { label: 'Seller', value: getSeller(t) },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-muted-foreground text-xs">
                              {label}
                            </p>
                            <p className="text-foreground text-xs font-medium font-mono mt-0.5 truncate">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleExpand(t.id)}
                          className="px-3 py-1.5 bg-secondary text-secondary-foreground border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
                        >
                          {isExpanded ? 'Hide Escrow ↑' : 'View Escrow ↓'}
                        </button>

                        {actions.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleTradeStatus(t.id, status)}
                            disabled={isUpdating}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              status === 'cancelled'
                                ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                            }`}
                          >
                            {isUpdating ? '...' : `Mark ${status}`}
                          </button>
                        ))}

                        <button
                          onClick={() =>
                            router.push(`/moderator/escrow?tradeId=${t.id}`)
                          }
                          className="px-3 py-1.5 bg-secondary text-secondary-foreground border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
                        >
                          Review Escrow →
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-border bg-muted px-4 py-3">
                        <p className="text-foreground font-semibold text-sm mb-2">
                          Escrow Details
                        </p>

                        {escrow === undefined ? (
                          <p className="text-muted-foreground text-xs">
                            Loading...
                          </p>
                        ) : escrow === null ? (
                          <p className="text-muted-foreground text-xs">
                            No escrow found.
                          </p>
                        ) : (
                          <>
                            <div className="space-y-2 text-xs mb-3">
                              {[
                                {
                                  label: 'Escrow ID',
                                  value: `#${escrow.id?.slice(0, 16)}...`,
                                },
                                {
                                  label: 'Contract',
                                  value: escrow.contractAddress || 'N/A',
                                },
                              ].map(({ label, value }) => (
                                <div
                                  key={label}
                                  className="flex justify-between"
                                >
                                  <span className="text-muted-foreground">
                                    {label}
                                  </span>
                                  <span className="font-mono">{value}</span>
                                </div>
                              ))}
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">
                                  Status
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${escrowStatusStyle(escrow.status)}`}
                                >
                                  {escrow.status}
                                </span>
                              </div>
                            </div>

                            {escrow.status === 'locked' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleEscrowUpdate(escrow.id, 'released')
                                  }
                                  disabled={updatingId === escrow.id}
                                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                                >
                                  {updatingId === escrow.id ? '...' : 'Release'}
                                </button>
                                <button
                                  onClick={() =>
                                    handleEscrowUpdate(escrow.id, 'disputed')
                                  }
                                  disabled={updatingId === escrow.id}
                                  className="flex-1 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-xs font-medium hover:bg-destructive/20 transition-colors cursor-pointer"
                                >
                                  {updatingId === escrow.id ? '...' : 'Dispute'}
                                </button>
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-xs text-center">
                                Escrow is {escrow.status}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {filteredTrades.length > 0 && (
            <div className="mt-3 text-center">
              <button
                onClick={() => router.push('/trades')}
                className="text-sm text-primary hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
              >
                View all trades →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
