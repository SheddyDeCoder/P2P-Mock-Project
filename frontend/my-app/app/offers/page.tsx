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
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterAsset, setFilterAsset] = useState<string>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [form, setForm] = useState<OfferPayload>({
    type: 'buy',
    asset: 'USDT',
    price: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Get current user id to hide "Start Trade" on own offers
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUserId(parsed?.id ?? null);
      } catch {}
    }

    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await getOffers();
      setOffers(data ?? []);
    } catch (err: any) {
      setError('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guests cannot create offers
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

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
      await fetchOffers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartTrade = (offer: any) => {
    // Pass offer info to trades page via query params
    router.push(
      `/trades?offerId=${offer.id}&counterpartyId=${offer.userId}&asset=${offer.asset}&price=${offer.price}`,
    );
  };

  const offerTypeStyle = (type: string) => {
    return type === 'buy'
      ? 'bg-primary/10 text-primary'
      : 'bg-destructive/10 text-destructive';
  };

  const filtered = offers.filter((o) => {
    const matchesType = filterType === 'all' || o.type === filterType;
    const matchesAsset = filterAsset === 'all' || o.asset === filterAsset;
    return matchesType && matchesAsset;
  });

  const buyOffers = offers.filter((o) => o.type === 'buy').length;
  const sellOffers = offers.filter((o) => o.type === 'sell').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading offers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Active Offers</h1>
            <p className="text-muted-foreground text-xs mt-1">
              {isLoggedIn ? 'Browse and trade or create your own offer' : 'Browse offers and start trading — no account needed'}
            </p>
          </div>
          {/* Only logged in users can create offers */}
          {isLoggedIn && (
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
          )}
        </div>

        {/* Guest banner */}
        {!isLoggedIn && (
          <div className="bg-accent border border-border rounded-xl px-5 py-4 mb-6">
            <p className="text-accent-foreground text-sm font-medium mb-1">
              🚀 No account needed to trade!
            </p>
            <p className="text-muted-foreground text-xs">
              Browse offers below and click <strong>Start Trade</strong> to begin.
              Want to create your own offers?{' '}
              <span
                className="text-primary cursor-pointer underline"
                onClick={() => router.push('/auth/register')}
              >
                Create a free account
              </span>
            </p>
          </div>
        )}

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

        {/* Create Offer Form — logged in only */}
        {showForm && isLoggedIn && (
          <form
            onSubmit={handleCreateOffer}
            className="bg-card border border-border rounded-xl p-6 mb-6 flex flex-col gap-5"
          >
            <h3 className="text-foreground font-semibold text-base">Create New Offer</h3>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Offer Type</label>
              <div className="flex gap-2">
                {(['buy', 'sell'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-xs mb-1">Total</p>
            <p className="text-foreground font-bold text-xl">{offers.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-xs mb-1">Buy</p>
            <p className="text-primary font-bold text-xl">{buyOffers}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-xs mb-1">Sell</p>
            <p className="text-destructive font-bold text-xl">{sellOffers}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <select
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value)}
            className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="all">All Assets</option>
            {ASSETS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <p className="text-muted-foreground text-xs self-center ml-auto">
            {filtered.length} offer{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Offers List */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-muted-foreground text-sm mb-4">No active offers found.</p>
            {isLoggedIn && (
              <button
                onClick={() => setShowForm(true)}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                Create First Offer
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((o: any) => {
              const isOwnOffer = currentUserId && o.userId === currentUserId;
              return (
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
                      {isOwnOffer && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground">
                          Your offer
                        </span>
                      )}
                    </div>
                    <p className="text-foreground font-bold text-base">
                      ${parseFloat(o.price).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-xs">
                      {new Date(o.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                    {!isOwnOffer ? (
                      <button
                        onClick={() => handleStartTrade(o)}
                        className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Start Trade →
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push('/trades')}
                        className="px-4 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
                      >
                        View Trades
                      </button>
                    )}
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