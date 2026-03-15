'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyWallets, fundWallet, WalletFundPayload } from '@/lib/services';

export default function WalletPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<WalletFundPayload>({
    walletAddress: '',
    asset: '',
    amount: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    fetchWallets();
  }, [router]);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await getMyWallets();
      setWallets(data ?? []);
    } catch (err: any) {
      setError('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await fundWallet({
        walletAddress: form.walletAddress.trim(),
        asset: form.asset.trim().toUpperCase(),
        amount: Number(form.amount),
      });
      setSuccess('Wallet funded successfully');
      setShowForm(false);
      setForm({ walletAddress: '', asset: '', amount: 0 });
      await fetchWallets();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fund wallet');
    } finally {
      setSubmitting(false);
    }
  };

  const totalBalance = wallets.reduce(
    (sum: number, w: any) => sum + parseFloat(w.balance ?? 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading wallets...</p>
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
            <h1 className="text-2xl font-bold text-foreground">My Wallets</h1>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              showForm
                ? 'bg-secondary text-secondary-foreground hover:bg-muted'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {showForm ? 'Cancel' : '+ Fund Wallet'}
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

        {/* Fund Wallet Form */}
        {showForm && (
          <form
            onSubmit={handleFund}
            className="bg-card border border-border rounded-xl p-6 mb-6 flex flex-col gap-5"
          >
            <h3 className="text-foreground font-semibold text-base">Fund a Wallet</h3>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Wallet Address</label>
              <input
                type="text"
                value={form.walletAddress}
                onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
                placeholder="Enter wallet address"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Asset</label>
              <input
                type="text"
                value={form.asset}
                onChange={(e) => setForm({ ...form, asset: e.target.value })}
                placeholder="e.g. BTC, ETH, USDT"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Funding...' : 'Fund Wallet'}
            </button>
          </form>
        )}

        {/* Total Balance */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <p className="text-muted-foreground text-sm mb-1">Total Wallet Balance</p>
          <p className="text-3xl font-bold text-primary">${totalBalance.toFixed(2)}</p>
          <p className="text-muted-foreground text-xs mt-1">{wallets.length} asset wallet{wallets.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Wallet List */}
        {wallets.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-muted-foreground text-sm mb-4">No wallets yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Fund Your First Wallet
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {wallets.map((w: any) => (
              <div
                key={w.id}
                className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-foreground font-semibold text-base">{w.asset}</p>
                  <p className="text-muted-foreground text-xs mt-1 break-all">
                    {w.walletAddress}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Added {new Date(w.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <p className="text-foreground font-bold text-lg">
                    {parseFloat(w.balance).toFixed(4)}
                  </p>
                  <p className="text-muted-foreground text-xs">{w.asset}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}