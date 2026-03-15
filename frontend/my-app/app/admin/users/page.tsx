'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllUsers, updateUserRole, UpdateRolePayload } from '@/lib/services';

const ROLES = ['user', 'admin', 'moderator'] as const;

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) { router.replace('/auth/login'); return; }
    if (role !== 'admin') { router.replace('/dashboard'); return; }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data ?? []);
    } catch (err: any) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, role: string) => {
    setUpdatingId(userId);
    setError(null);
    setSuccess(null);
    try {
      await updateUserRole(userId, { role });
      setSuccess(`User role updated to ${role}`);
      await fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const roleStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-primary/20 text-primary';
      case 'moderator': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const filtered = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading users...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
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

        {/* Summary + Search */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Users', value: users.length },
            { label: 'Admins', value: users.filter((u) => u.role === 'admin').length },
            { label: 'Moderators', value: users.filter((u) => u.role === 'moderator').length },
          ].map((card) => (
            <div key={card.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-xs mb-1">{card.label}</p>
              <p className="text-foreground font-bold text-xl">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or username..."
            className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Users List */}
        <h2 className="text-base font-semibold text-foreground mb-3">
          All Users {search && `— ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </h2>

        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-muted-foreground text-sm">No users found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((u: any) => {
              const isUpdating = updatingId === u.id;
              return (
                <div
                  key={u.id}
                  className="bg-card border border-border rounded-xl px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-foreground font-semibold text-sm truncate">
                          {u.username || 'No username'}
                        </p>
                        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleStyle(u.role)}`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs truncate">{u.email}</p>
                      <p className="text-muted-foreground text-xs mt-1 font-mono">
                        #{u.id?.slice(0, 16)}...
                      </p>
                    </div>

                    {/* Role Selector */}
                    <div className="shrink-0">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 cursor-pointer"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
                    <div>
                      <p className="mb-0.5">Balance</p>
                      <p className="text-foreground font-medium">
                        ${parseFloat(u.balance ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5">Joined</p>
                      <p className="text-foreground font-medium">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5">Wallet</p>
                      <p className="text-foreground font-medium font-mono truncate">
                        {u.walletAddress ? `${u.walletAddress.slice(0, 10)}...` : '—'}
                      </p>
                    </div>
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
