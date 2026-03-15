'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getEscrowByTrade, updateTradeStatus } from '@/lib/services';

export default function TradeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tradeId = params?.id as string;

  const [trade, setTrade] = useState<any>(null);
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [role, setRole] = useState<string>('user');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    const storedRole = localStorage.getItem('role') ?? 'user';
    setRole(storedRole);
    fetchTradeDetail();
  }, [tradeId]);

  const fetchTradeDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch escrow by tradeId (this also gives us trade info via relation)
      const escrowData = await getEscrowByTrade(tradeId);
      setEscrow(escrowData);

      // Trade info is nested inside escrow relation
      if (escrowData?.trade) {
        setTrade(escrowData.trade);
      }
    } catch (err: any) {
      // Escrow might not exist yet for pending trades — that's okay
      if (err?.response?.status === 404) {
        setError(null); // Not an error, just no escrow yet
      } else {
        setError('Failed to load trade details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    setUpdatingStatus(true);
    setError(null);
    setSuccess(null);

    try {
      await updateTradeStatus(tradeId, status);
      setSuccess(`Trade status updated to ${status}`);
      await fetchTradeDetail();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update trade status');
    } finally {
      setUpdatingStatus(false);
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
        <p className="text-muted-foreground text-sm">Loading trade details...</p>
      </div>
    );
  }

  const tradeStatus = trade?.status ?? 'pending';
  const actions = nextStatuses(tradeStatus);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/trades')}
            className="text-muted-foreground hover:text-foreground transition-colors text-xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trade Detail</h1>
            <p className="text-muted-foreground text-xs font-mono mt-0.5">#{tradeId?.slice(0, 16)}...</p>
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

        {/* Trade Info Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Trade Info</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle(tradeStatus)}`}>
              {tradeStatus}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: 'Trade ID', value: tradeId },
              { label: 'Amount', value: trade?.amount ? `$${parseFloat(trade.amount).toFixed(2)}` : '—' },
              { label: 'Offer ID', value: trade?.offerId ? `#${trade.offerId.slice(0, 16)}...` : '—' },
              { label: 'Buyer ID', value: trade?.buyerId ? `#${trade.buyerId.slice(0, 16)}...` : '—' },
              { label: 'Seller ID', value: trade?.sellerId ? `#${trade.sellerId.slice(0, 16)}...` : '—' },
              {
                label: 'Created',
                value: trade?.createdAt
                  ? new Date(trade.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })
                  : '—',
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center text-sm border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="text-foreground font-medium text-right max-w-[60%] break-all font-mono text-xs">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Escrow Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Escrow</h2>
            {escrow?.status ? (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${escrowStatusStyle(escrow.status)}`}>
                {escrow.status}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                Not created yet
              </span>
            )}
          </div>

          {escrow ? (
            <div className="flex flex-col gap-3">
              {[
                { label: 'Escrow ID', value: escrow.id ? `#${escrow.id.slice(0, 16)}...` : '—' },
                { label: 'Contract Address', value: escrow.contractAddress || 'Not assigned' },
                { label: 'Status', value: escrow.status ?? '—' },
                {
                  label: 'Created',
                  value: escrow.createdAt
                    ? new Date(escrow.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })
                    : '—',
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center text-sm border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-foreground font-medium text-right max-w-[60%] break-all font-mono text-xs">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Escrow will be created once the trade is funded.
            </p>
          )}
        </div>

        {/* Status Update Actions */}
        {actions.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            <h2 className="text-base font-semibold text-foreground mb-4">Update Trade Status</h2>
            <div className="flex gap-3 flex-wrap">
              {actions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  disabled={updatingStatus}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                    status === 'cancelled'
                      ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {updatingStatus ? 'Updating...' : `Mark as ${status}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Admin/Moderator: Escrow Management */}
        {(role === 'admin' || role === 'moderator') && escrow && escrow.status === 'locked' && (
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            <h2 className="text-base font-semibold text-foreground mb-2">Escrow Management</h2>
            <p className="text-muted-foreground text-xs mb-4">
              As an admin/moderator you can release or dispute this escrow.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/admin/trades`)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
              >
                Manage in Admin Panel
              </button>
            </div>
          </div>
        )}

        {/* Completed State */}
        {tradeStatus === 'completed' && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 text-center">
            <p className="text-primary font-semibold text-sm">✅ Trade Completed</p>
            <p className="text-muted-foreground text-xs mt-1">
              This trade has been successfully completed.
            </p>
          </div>
        )}

        {/* Cancelled State */}
        {tradeStatus === 'cancelled' && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 text-center">
            <p className="text-destructive font-semibold text-sm">❌ Trade Cancelled</p>
            <p className="text-muted-foreground text-xs mt-1">
              This trade has been cancelled.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
