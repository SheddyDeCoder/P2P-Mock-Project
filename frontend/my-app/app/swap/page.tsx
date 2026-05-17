'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSwap, getSwapHistory } from '@/lib/services';

const ASSETS = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL'];

const DIRECTIONS = [
  {
    value: 'balance_to_wallet',
    label: '💰 Balance → Wallet',
    description: 'Swap from your main balance into an asset wallet',
  },
  {
    value: 'wallet_to_balance',
    label: '👛 Wallet → Balance',
    description: 'Swap from an asset wallet back to your main balance',
  },
];

type Direction = 'balance_to_wallet' | 'wallet_to_balance';

export default function SwapPage() {
  const router = useRouter();
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    fromAsset: 'USDT',
    toAsset: 'BTC',
    fromAmount: 0,
<<<<<<< HEAD
    direction: 'balance_to_wallet' as Direction,
=======
    direction: 'balance_to_wallet',
>>>>>>> dff5fd34fc7514323ba1d8df775f77e1669274d0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    fetchSwaps();
  }, [router]);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const data = await getSwapHistory();
      setSwaps(data ?? []);
    } catch (err: any) {
      console.log('Swap history error:', err?.response?.data);
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to load swap history';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.fromAsset === form.toAsset) {
      setError('From and To assets cannot be the same');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createSwap({
        fromAsset: form.fromAsset,
        toAsset: form.toAsset,
        fromAmount: Number(form.fromAmount),
        direction: form.direction,
      });
      setSuccess(
        `Swap from ${form.fromAsset} to ${form.toAsset} submitted successfully`,
      );
      setShowForm(false);
<<<<<<< HEAD
      setForm({ fromAsset: 'USDT', toAsset: 'BTC', fromAmount: 0, direction: 'balance_to_wallet' });
=======
      setForm({
        fromAsset: 'USDT',
        toAsset: 'BTC',
        fromAmount: 0,
        direction: 'balance_to_wallet',
      });
>>>>>>> dff5fd34fc7514323ba1d8df775f77e1669274d0
      await fetchSwaps();
    } catch (err: any) {
      console.log('Swap error:', err?.response?.data);

      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Failed to submit swap';

      setError(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-primary/10 text-primary';
      case 'pending':
        return 'bg-accent text-accent-foreground';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const completedSwaps = swaps.filter((s) => s.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading swaps...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Swap</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setError(null);
              setSuccess(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              showForm
                ? 'bg-secondary text-secondary-foreground hover:bg-muted'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {showForm ? 'Cancel' : '+ New Swap'}
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

        {/* Swap Form */}
        {showForm && (
          <form
            onSubmit={handleSwap}
            className="bg-card border border-border rounded-xl p-6 mb-6 flex flex-col gap-5"
          >
            <h3 className="text-foreground font-semibold text-base">
              New Swap
            </h3>

            {/* Direction */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DIRECTIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        direction: d.value as
                          | 'balance_to_wallet'
                          | 'wallet_to_balance',
                      })
                    }
                    className={`px-4 py-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      form.direction === d.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <p className="text-xs font-semibold">{d.label}</p>
                    <p className="text-xs mt-0.5 opacity-70">{d.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Direction Toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Direction</label>
              <div className="flex gap-2">
                {([
                  { value: 'balance_to_wallet', label: '💰 Balance → Wallet' },
                  { value: 'wallet_to_balance', label: '👛 Wallet → Balance' },
                ] as const).map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setForm({ ...form, direction: d.value })}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      form.direction === d.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-muted'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                {form.direction === 'balance_to_wallet'
                  ? 'Spend your main balance to fill an asset wallet'
                  : 'Sell your asset wallet back to main balance'}
              </p>
            </div>

            {/* From Asset */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                From Asset
              </label>
              <select
                value={form.fromAsset}
                onChange={(e) =>
                  setForm({ ...form, fromAsset: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ASSETS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

<<<<<<< HEAD
            {/* Swap Direction Button */}
=======
            {/* Swap direction arrow */}
>>>>>>> dff5fd34fc7514323ba1d8df775f77e1669274d0
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    fromAsset: prev.toAsset,
                    toAsset: prev.fromAsset,
                  }))
                }
                className="w-10 h-10 rounded-full bg-muted border border-border text-foreground flex items-center justify-center hover:bg-accent transition-colors cursor-pointer text-lg"
<<<<<<< HEAD
=======
                title="Swap assets"
>>>>>>> dff5fd34fc7514323ba1d8df775f77e1669274d0
              >
                ⇅
              </button>
            </div>

            {/* To Asset */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                To Asset
              </label>
              <select
                value={form.toAsset}
                onChange={(e) => setForm({ ...form, toAsset: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ASSETS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Amount ({form.fromAsset})
              </label>
              <input
                type="number"
<<<<<<< HEAD
                value={form.fromAmount || ''}
                onChange={(e) => setForm({ ...form, fromAmount: parseFloat(e.target.value) })}
=======
                value={form.fromAmount}
                onChange={(e) =>
                  setForm({ ...form, fromAmount: parseFloat(e.target.value) })
                }
>>>>>>> dff5fd34fc7514323ba1d8df775f77e1669274d0
                placeholder="0.00"
                min="0"
                step="any"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Preview */}
            {form.fromAsset !== form.toAsset && (
              <div className="bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground">
                <p>
                  Swapping{' '}
                  <span className="text-foreground font-medium">
                    {form.fromAmount || 0} {form.fromAsset}
                  </span>{' '}
                  →{' '}
                  <span className="text-primary font-medium">
                    {form.toAsset}
                  </span>
                </p>
                <p className="text-xs mt-1 opacity-70">
                  Direction:{' '}
                  <span className="text-foreground">
                    {form.direction === 'balance_to_wallet'
                      ? 'Main Balance → Asset Wallet'
                      : 'Asset Wallet → Main Balance'}
                  </span>
                </p>
              </div>
            )}

            {form.fromAsset === form.toAsset && (
              <p className="text-destructive text-xs">
                From and To assets cannot be the same.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || form.fromAsset === form.toAsset}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting
                ? 'Swapping...'
                : `Swap ${form.fromAsset} → ${form.toAsset}`}
            </button>
          </form>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground text-xs mb-1">Total Swaps</p>
            <p className="text-foreground font-bold text-xl">{swaps.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground text-xs mb-1">Completed</p>
            <p className="text-primary font-bold text-xl">{completedSwaps}</p>
          </div>
        </div>

        {/* Swap History */}
        <h2 className="text-base font-semibold text-foreground mb-3">
          Swap History
        </h2>

        {swaps.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-muted-foreground text-sm mb-4">No swaps yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Make Your First Swap
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {swaps.map((s: any) => (
              <div
                key={s.id}
                className="bg-card border border-border rounded-xl px-5 py-4"
              >
                <div className="flex items-center justify-between">
<<<<<<< HEAD
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-semibold text-sm">{s.fromAsset}</span>
                    <span className="text-primary text-base">→</span>
                    <span className="text-foreground font-semibold text-sm">{s.toAsset}</span>
=======
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground font-semibold text-sm">
                      {s.fromAsset}
                    </span>
                    <span className="text-primary text-base">→</span>
                    <span className="text-foreground font-semibold text-sm">
                      {s.toAsset}
                    </span>
>>>>>>> dff5fd34fc7514323ba1d8df775f77e1669274d0
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle(s.status)}`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>
                    <p className="mb-0.5">From</p>
                    <p className="text-foreground font-medium">
                      {parseFloat(s.fromAmount).toFixed(4)} {s.fromAsset}
                    </p>
                  </div>
                  <div>
                    <p className="mb-0.5">To</p>
                    <p className="text-foreground font-medium">
                      {parseFloat(s.toAmount).toFixed(4)} {s.toAsset}
                    </p>
                  </div>
                  <div>
                    <p className="mb-0.5">Rate</p>
                    <p className="text-foreground font-medium">
                      {parseFloat(s.rate).toFixed(6)}
                    </p>
                  </div>
                </div>

                {/* Show direction if available */}
                {s.direction && (
                  <p className="text-muted-foreground text-xs mt-2">
                    {s.direction === 'balance_to_wallet'
                      ? '💰 Balance → Wallet'
                      : '👛 Wallet → Balance'}
                  </p>
                )}

                <p className="text-muted-foreground text-xs mt-1">
                  {new Date(s.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
