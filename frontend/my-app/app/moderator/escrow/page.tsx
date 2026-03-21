'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getEscrowByTrade, getEscrow, updateEscrow } from '@/lib/services';

export default function ModeratorEscrowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tradeId = searchParams.get('tradeId');
  const escrowId = searchParams.get('id');

  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      router.replace('/auth/login');
      return;
    }

    if (role !== 'mentor' && role !== 'admin' && role !== 'moderator') {
      router.replace('/dashboard');
      return;
    }

    if (tradeId) {
      fetchEscrowByTrade(tradeId);
    } else if (escrowId) {
      fetchEscrowById(escrowId);
    } else {
      setError('No trade ID or escrow ID provided');
      setLoading(false);
    }
  }, [router, tradeId, escrowId]);

  const fetchEscrowByTrade = async (tradeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEscrowByTrade(tradeId);
      setEscrow(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load escrow');
    } finally {
      setLoading(false);
    }
  };

  const fetchEscrowById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEscrow(id);
      setEscrow(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load escrow');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: 'released' | 'disputed') => {
    if (!escrow?.id) return;
    setActionLoading(status);
    setError(null);
    setSuccess(null);
    try {
      await updateEscrow(escrow.id, { status });
      setSuccess(`Escrow ${status} successfully`);
      if (tradeId) {
        await fetchEscrowByTrade(tradeId);
      } else if (escrowId) {
        await fetchEscrowById(escrowId);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading escrow...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-muted-foreground hover:text-foreground transition-colors text-xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Escrow Review
            </h1>
            <p className="text-xs text-muted-foreground">Moderator Panel</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm">
            {success}
          </div>
        )}

        {!escrow ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-muted-foreground text-sm">No escrow found.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Escrow ID</p>
              <p className="font-mono text-sm break-all text-foreground">
                {escrow.id}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Amount</p>
                <p className="font-semibold text-foreground">
                  ${parseFloat(escrow.amount ?? 0).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground">
                  {escrow.status}
                </span>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Buyer</p>
                <p className="text-xs break-all text-foreground">
                  {escrow.buyerId}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Seller</p>
                <p className="text-xs break-all text-foreground">
                  {escrow.sellerId}
                </p>
              </div>
            </div>

            {escrow.status === 'pending' && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleAction('released')}
                  disabled={actionLoading !== null}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {actionLoading === 'released'
                    ? 'Releasing...'
                    : 'Release Funds'}
                </button>

                <button
                  onClick={() => handleAction('disputed')}
                  disabled={actionLoading !== null}
                  className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium hover:bg-destructive/20 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'disputed'
                    ? 'Disputing...'
                    : 'Raise Dispute'}
                </button>
              </div>
            )}

            {escrow.status !== 'pending' && (
              <p className="text-muted-foreground text-xs text-center pt-2">
                Escrow is {escrow.status} — no further actions available.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
