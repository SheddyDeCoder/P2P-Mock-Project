'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOffers } from '@/lib/services';

export default function AdminOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) { router.replace('/auth/login'); return; }
    if (role !== 'admin') { router.replace('/dashboard'); return; }
    fetchOffers();
  }, [router]);

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

  const offerTypeStyle = (type: string) => {
    return type === 'buy'
      ? 'bg-primary/10 text-primary'
      : 'bg-destructive/10 text-destructive';
  };

  const statusStyle = (status: string) => {
    return status === 'active'
      ? 'bg-primary/10 text-primary'
      : 'bg-secondary text-secondary-foreground';
  };

  const filtered = offers.filter((o) => {
    const matchesSearch =
      o.asset?.toLowerCase().includes(search.toLowerCase()) ||
      o.userId?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || o.type === filterType;
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading offers...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Offers</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: offers.length, style: 'text-foreground' },
            { label: 'Active', value: offers.filter((o) => o.status === 'active').length, style: 'text-primary' },
            { label: 'Buy', value: offers.filter((o) => o.type === 'buy').length, style: 'text-primary' },
            { label: 'Sell', value: offers.filter((o) => o.type === 'sell').length, style: 'text-destructive' },
          ].map((card) => (
            <div key={card.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-xs mb-1">{card.label}</p>
              <p className={`font-bold text-xl ${card.style}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by asset or user ID..."
            className="flex-1 min-w-[180px] px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Offers List */}
        <h2 className="text-base font-semibold text-foreground mb-3">
          All Offers {search || filterType !== 'all' || filterStatus !== 'all'
            ? `— ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
            : ''}
        </h2>

        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-muted-foreground text-sm">No offers found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((o: any) => (
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

                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>
                    <p className="mb-0.5">Price</p>
                    <p className="text-foreground font-medium">${parseFloat(o.price).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="mb-0.5">Trades</p>
                    <p className="text-foreground font-medium">{o.trades?.length ?? 0}</p>
                  </div>
                  <div>
                    <p className="mb-0.5">Created</p>
                    <p className="text-foreground font-medium">
                      {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-muted-foreground text-xs">
                    User ID:{' '}
                    <span className="text-foreground font-mono">#{o.userId?.slice(0, 16)}...</span>
                  </p>
                </div>

                {o.status === 'active' && (
                  <div className="mt-2">
                    <button
                      onClick={() => router.push('/admin/trades')}
                      className="text-xs text-primary underline cursor-pointer bg-transparent border-none"
                    >
                      View related trades →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}