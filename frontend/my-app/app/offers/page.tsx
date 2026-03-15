'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOffer, getOffers, OfferPayload } from '@/lib/services';

const ASSETS = ['USDT', 'BTC', 'ETH', 'BNB', 'SOL'];

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState<string>('user');

  const [form, setForm] = useState<OfferPayload>({
    type: 'buy',
    asset: 'USDT',
    price: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    const storedRole = localStorage.getItem('role') ?? 'user';
    setRole(storedRole);
    fetchOffers(storedRole);
  }, [router]);

  const fetchOffers = async (currentRole: string) => {
    try {
      setLoading(true);
      // GET /offers is admin only — skip for regular users
      if (currentRole === 'admin') {
        const data = await getOffers();
        setOffers(data ?? []);
      }
    } catch (err: any) {
      setError('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createOffer({
        type: form.type,
        asset: form.asset,
        price: Number(form.price),
      });
      setSuccess(`${form.type === 'buy' ? 'Buy' : 'Sell'} offer created successfully`);
      setShowForm(false);
      setForm({ type: 'buy', asset: 'USDT', price: 0 });
      if (role === 'admin') await fetchOffers(role);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create offer');
    } finally {
      setSubmitting(false);
    }
  };

  const offerTypeStyle = (type: string) => {
    return type === 'buy'
      ? 'bg-primary/10 text-primary'
      : 'bg-destructive/10 text-destructive';
  };

  const statusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-primary/10 text-primary';
      case 'closed': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading offers...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Offers</h1>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              showForm
                ? 'bg-secondary text-secondary-foreground hover:bg-muted'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {showForm ? 'Cancel' : '+ Create Offer'}
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

        {/* Create Offer Form */}
        {showForm && (
          <form
            onSubmit={handleCreateOffer}
            className="bg-card border border-border rounded-xl p-6 mb-6 flex flex-col gap-5"
          >
            <h3 className="text-foreground font-semibold text-base">Create New Offer</h3>

            {/* Type Toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Offer Type</label>
              <div className="flex gap-2">
                {(['buy', 'sell'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer capitalize ${
                      form.type === t
                        ? t === 'buy'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-destructive text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-muted'
                    }`}
                  >
                    {t === 'buy' ? '🟢 Buy' : '🔴 Sell'}
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

            {/* Price */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Price (USD)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                placeholder="0.00"
                min="0"
                step="any"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Preview */}
            <div className="bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground">
              Creating a{' '}
              <span className={`font-medium ${form.type === 'buy' ? 'text-primary' : 'text-destructive'}`}>
                {form.type.toUpperCase()}
              </span>{' '}
              offer for{' '}
              <span className="text-foreground font-medium">{form.asset}</span>{' '}
              at{' '}
              <span className="text-foreground font-medium">${form.price || 0}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Offer'}
            </button>
          </form>
        )}

        {/* Info banner for regular users */}
        {role !== 'admin' && (
          <div className="bg-accent border border-border rounded-xl px-5 py-4 mb-6">
            <p className="text-accent-foreground text-sm font-medium mb-1">Your Offers</p>
            <p className="text-muted-foreground text-xs">
              You can create buy or sell offers. Once created, other users can initiate trades against your offer.
              Head to{' '}
              <span
                className="text-primary cursor-pointer underline"
                onClick={() => router.push('/trades')}
              >
                Trades
              </span>{' '}
              to manage your active trades.
            </p>
          </div>
        )}

        {/* Admin: All Offers List */}
        {role === 'admin' && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-muted-foreground text-xs mb-1">Total Offers</p>
                <p className="text-foreground font-bold text-xl">{offers.length}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-muted-foreground text-xs mb-1">Active Offers</p>
                <p className="text-primary font-bold text-xl">
                  {offers.filter((o) => o.status === 'active').length}
                </p>
              </div>
            </div>

            <h2 className="text-base font-semibold text-foreground mb-3">All Offers</h2>

            {offers.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-10 text-center">
                <p className="text-muted-foreground text-sm">No offers yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {offers.map((o: any) => (
                  <div
                    key={o.id}
                    className="bg-card border border-border rounded-xl px-5 py-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${offerTypeStyle(o.type)}`}>
                          {o.type.toUpperCase()}
                        </span>
                        <span className="text-foreground font-semibold text-sm">{o.asset}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle(o.status)}`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <p className="mb-0.5">Price</p>
                        <p className="text-foreground font-medium">${parseFloat(o.price).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="mb-0.5">Trades</p>
                        <p className="text-foreground font-medium">{o.trades?.length ?? 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-muted-foreground text-xs">
                        {new Date(o.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </p>
                      {o.status === 'active' && (
                        <button
                          onClick={() => router.push('/trades')}
                          className="text-xs text-primary underline cursor-pointer bg-transparent border-none"
                        >
                          View Trades →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}