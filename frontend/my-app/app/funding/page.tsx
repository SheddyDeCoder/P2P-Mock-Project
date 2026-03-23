'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyFunding, createFunding, FundingPayload } from '@/lib/services';

const ASSETS = ['USDT', 'BTC', 'ETH', 'BNB', 'SOL'];

const formatAmount = (value: number | string) => {
  const num = parseFloat(String(value));
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function FundingPage() {
  const router = useRouter();
  const [funding, setFunding] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<FundingPayload>({
    type: 'deposit',
    asset: 'USDT',
    amount: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    fetchFunding();
  }, [router]);

  const fetchFunding = async () => {
    try {
      setLoading(true);
      const data = await getMyFunding();
      setFunding(data ?? []);
    } catch (err: any) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createFunding({
        type: form.type,
        asset: form.asset,
        amount: Number(form.amount),
      });
      setSuccess(`${form.type === 'deposit' ? 'Deposit' : 'Withdrawal'} request submitted successfully`);
      setShowForm(false);
      setForm({ type: 'deposit', asset: 'USDT', amount: 0 });
      await fetchFunding();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-primary/10 text-primary';
      case 'pending': return 'bg-accent text-accent-foreground';
      case 'failed': return 'bg-destructive/10 text-destructive';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const deposits = funding.filter((f) => f.type === 'deposit');
  const withdrawals = funding.filter((f) => f.type === 'withdrawal');
  const totalDeposited = deposits
    .filter((f) => f.status === 'completed')
    .reduce((sum: number, f: any) => sum + parseFloat(f.amount ?? 0), 0);
  const totalWithdrawn = withdrawals
    .filter((f) => f.status === 'completed')
    .reduce((sum: number, f: any) => sum + parseFloat(f.amount ?? 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading transactions...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Funding</h1>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              showForm
                ? 'bg-secondary text-secondary-foreground hover:bg-muted'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {showForm ? 'Cancel' : '+ New Transaction'}
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

        {/* New Transaction Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-xl p-6 mb-6 flex flex-col gap-5"
          >
            <h3 className="text-foreground font-semibold text-base">New Transaction</h3>

            {/* Type Toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Type</label>
              <div className="flex gap-2">
                {(['deposit', 'withdrawal'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer capitalize ${
                      form.type === t
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-muted'
                    }`}
                  >
                    {t === 'deposit' ? '⬇️ Deposit' : '⬆️ Withdrawal'}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Asset</label>
              <select
                value={form.asset}
                onChange={(e) => setForm({ ...form, asset: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ASSETS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Amount</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.amount === 0 ? '' : Number(form.amount).toLocaleString('en-US')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, '');
                  if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
                    setForm({ ...form, amount: raw === '' ? 0 : parseFloat(raw) });
                  }
                }}
                placeholder="0.00"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Submitting...' : `Submit ${form.type === 'deposit' ? 'Deposit' : 'Withdrawal'}`}
            </button>
          </form>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground text-xs mb-1">Total Deposited</p>
            <p className="text-foreground font-bold text-xl">${formatAmount(totalDeposited)}</p>
            <p className="text-muted-foreground text-xs mt-1">{deposits.length} deposit{deposits.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground text-xs mb-1">Total Withdrawn</p>
            <p className="text-foreground font-bold text-xl">${formatAmount(totalWithdrawn)}</p>
            <p className="text-muted-foreground text-xs mt-1">{withdrawals.length} withdrawal{withdrawals.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Transaction History */}
        <h2 className="text-base font-semibold text-foreground mb-3">Transaction History</h2>

        {funding.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-muted-foreground text-sm mb-4">No transactions yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Make Your First Deposit
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {funding.map((f: any) => (
              <div
                key={f.id}
                className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {f.type === 'deposit' ? '⬇️' : '⬆️'}
                    </span>
                    <p className="text-foreground font-medium text-sm capitalize">
                      {f.type} · {f.asset}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">
                    {new Date(f.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5 font-mono">
                    Ref: {f.reference?.slice(0, 16)}...
                  </p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <p className="text-foreground font-bold text-base">
                    ${formatAmount(f.amount)}
                  </p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle(f.status)}`}>
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}