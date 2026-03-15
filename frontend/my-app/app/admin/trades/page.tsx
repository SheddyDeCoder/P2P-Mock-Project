'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyTrades, updateTradeStatus, getEscrowByTrade, updateEscrow } from '@/lib/services';

export default function AdminTradesPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [escrows, setEscrows] = useState<Record<string, any>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) { router.replace('/auth/login'); return; }
    if (role !== 'admin' && role !== 'moderator') { router.replace('/dashboard'); return; }
    fetchTrades();
  }, [router]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const data = await getMyTrades();
      setTrades(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const fetchEscrow = async (tradeId: string) => {
    if (escrows[tradeId]) return; // already fetched
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
      setSuccess(`Trade status updated to ${status}`);
      await fetchTrades();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update trade status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEscrowUpdate = async (escrowId: string, status: 'released' | 'disputed') => {
    setUpdatingId(escrowId);
    setError(null);
    setSuccess(null);
    try {
      await updateEscrow(escrowId, { status });
      setSuccess(`Escrow ${status} successfully`);
      // Refresh escrows
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
      case 'completed': return 'bg-primary/10 text-primary';
      case 'funded': return 'bg-accent text-accent-foreground';
      case 'pending': return 'bg-secondary text-secondary-foreground';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const escrowStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'released': return 'bg-primary/10 text-primary';
      case 'locked': return 'bg-accent text-accent-foreground';
      case 'disputed': return 'bg-destructive/10 text-destructive';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const nextStatuses = (current: string) => {
    switch (current?.toLowerCase()) {
      case 'pending': return ['funded', 'cancelled'];
      case 'funded': return ['completed', 'cancelled'];
      default: return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading trades...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-muted-foreground hover:text-foreground transition-colors text-xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trades</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Admin Panel</p>
          </div>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: trades.length, style: 'text-foreground' },
            { label: 'Pending', value: trades.filter((t) => t.status === 'pending').length, style: 'text-muted-foreground' },
            { label: 'Funded', value: trades.filter((t) => t.status === 'funded').length, style: 'text-accent-foreground' },
            { label: 'Completed', value: trades.filter((t) => t.status === 'completed').length, style: 'text-primary' },
          ].map((card) => (
            <div key={card.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-xs mb-1">{card.label}</p>
              <p className={`font-bold text-xl ${card.style}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Trades List */}
        <h2 className="text-base font-semibold text-foreground mb-3">All Trades</h2>

        {trades.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-muted-foreground text-sm">No trades found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {trades.map((t: any) => {
              const isExpanded = expandedId === t.id;
              const isUpdating = updatingId === t.id;
              const actions = nextStatuses(t.status);
              const escrow = escrows[t.id];

              return (
                <div key={t.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  {/* Trade Row */}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-foreground font-semibold text-sm font-mono">
                        #{t.id?.slice(0, 12)}...
                      </p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle(t.status)}`}>
                        {t.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                      <div>
                        <p className="mb-0.5">Amount</p>
                        <p className="text-foreground font-medium">${parseFloat(t.amount ?? 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="mb-0.5">Date</p>
                        <p className="text-foreground font-medium">
                          {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="mb-0.5">Buyer</p>
                        <p className="text-foreground font-medium font-mono truncate">#{t.buyerId?.slice(0, 10)}...</p>
                      </div>
                      <div>
                        <p className="mb-0.5">Seller</p>
                        <p className="text-foreground font-medium font-mono truncate">#{t.sellerId?.slice(0, 10)}...</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleExpand(t.id)}
                        className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
                      >
                        {isExpanded ? 'Hide Escrow ↑' : 'View Escrow ↓'}
                      </button>

                      {actions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleTradeStatus(t.id, status)}
                          disabled={isUpdating}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                            status === 'cancelled'
                              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                          }`}
                        >
                          {isUpdating ? '...' : `Mark ${status}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Escrow Panel */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted px-5 py-4">
                      <h3 className="text-foreground font-semibold text-sm mb-3">Escrow Details</h3>

                      {escrow === undefined ? (
                        <p className="text-muted-foreground text-xs">Loading escrow...</p>
                      ) : escrow === null ? (
                        <p className="text-muted-foreground text-xs">No escrow found for this trade.</p>
                      ) : (
                        <>
                          <div className="flex flex-col gap-2 mb-4">
                            {[
                              { label: 'Escrow ID', value: `#${escrow.id?.slice(0, 16)}...` },
                              { label: 'Status', value: escrow.status },
                              { label: 'Contract Address', value: escrow.contractAddress || 'Not assigned' },
                            ].map((row) => (
                              <div key={row.label} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{row.label}</span>
                                <span className={`font-medium font-mono ${row.label === 'Status' ? escrowStatusStyle(row.value) + ' px-2 py-0.5 rounded-full' : 'text-foreground'}`}>
                                  {row.value}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Escrow Actions — admin/moderator only */}
                          {escrow.status === 'locked' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEscrowUpdate(escrow.id, 'released')}
                                disabled={updatingId === escrow.id}
                                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                              >
                                Release Escrow
                              </button>
                              <button
                                onClick={() => handleEscrowUpdate(escrow.id, 'disputed')}
                                disabled={updatingId === escrow.id}
                                className="flex-1 py-2 bg-destructive/10 text-destructive rounded-lg text-xs font-medium hover:bg-destructive/20 transition-colors cursor-pointer disabled:opacity-50 border border-destructive/20"
                              >
                                Dispute
                              </button>
                            </div>
                          )}

                          {escrow.status !== 'locked' && (
                            <p className="text-muted-foreground text-xs text-center">
                              Escrow is {escrow.status} — no further actions available.
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
      </div>
    </div>
  );
}