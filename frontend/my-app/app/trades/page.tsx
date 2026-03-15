'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyTrades, createTrade, updateTradeStatus, TradePayload } from '@/lib/services';

const TRADE_STATUSES = ['funded', 'completed', 'cancelled'] as const;

export default function TradesPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState<TradePayload>({
    counterpartyId: '',
    amount: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
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

  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createTrade({
        counterpartyId: form.counterpartyId.trim(),
        amount: Number(form.amount),
      });
      setSuccess('Trade created successfully');
      setShowForm(false);
      setForm({ counterpartyId: '', amount: 0 });
      await fetchTrades();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create trade');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (tradeId: string, status: string) => {
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

  const statusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-primary/10 text-primary';
      case 'funded': return 'bg-accent text-accent-foreground';
      case 'pending': return 'bg-secondary text-secondary-foreground';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
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

  const pendingCount = trades.filter((t) => t.status === 'pending').length;
  const fundedCount = trades.filter((t) => t.status === 'funded').length;
  const completedCount = trades.filter((t) => t.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading trades...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-muted-foreground hover:text-foreground transition-colors text-xl"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-foreground">My Trades</h1>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              showForm
                ? 'bg-secondary text-secondary-foreground hover:bg-muted'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {showForm ? 'Cancel' : '+ New Trade'}
          </button>
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

        {/* Create Trade Form */}
        {showForm && (
          <form
            onSubmit={handleCreateTrade}
            className="bg-card border border-border rounded-xl p-6 mb-6 flex flex-col gap-5"
          >
            <h3 className="text-foreground font-semibold text-base">New Trade</h3>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Counterparty ID
                <span className="text-muted-foreground font-normal ml-1">(the other user's ID)</span>
              </label>
              <input
                type="text"
                value={form.counterpartyId}
                onChange={(e) => setForm({ ...form, counterpartyId: e.target.value })}
                placeholder="Enter counterparty user ID"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                placeholder="0.00"
                min="0"
                step="any"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="bg-muted rounded-lg px-4 py-3 text-xs text-muted-foreground">
              💡 A trade will be created against the counterparty's active offer. Make sure they have an active offer before proceeding.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Trade'}
            </button>
          </form>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Pending', value: pendingCount, style: 'text-muted-foreground' },
            { label: 'Funded', value: fundedCount, style: 'text-accent-foreground' },
            { label: 'Completed', value: completedCount, style: 'text-primary' },
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
            <p className="text-muted-foreground text-sm mb-4">No trades yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Create Your First Trade
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {trades.map((t: any) => {
              const actions = nextStatuses(t.status);
              const isUpdating = updatingId === t.id;

              return (
                <div
                  key={t.id}
                  className="bg-card border border-border rounded-xl px-5 py-4"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-foreground font-semibold text-sm font-mono">
                      #{t.id.slice(0, 8)}
                    </p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle(t.status)}`}>
                      {t.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <div>
                      <p className="mb-0.5">Amount</p>
                      <p className="text-foreground font-medium">
                        ${parseFloat(t.amount ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5">Escrow</p>
                      <p className="text-foreground font-medium capitalize">
                        {t.escrow?.status ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5">Date</p>
                      <p className="text-foreground font-medium">
                        {new Date(t.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5">Offer</p>
                      <p className="text-foreground font-medium font-mono">
                        #{t.offerId?.slice(0, 8) ?? '—'}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => router.push(`/trades/${t.id}`)}
                      className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    {actions.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(t.id, status)}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}