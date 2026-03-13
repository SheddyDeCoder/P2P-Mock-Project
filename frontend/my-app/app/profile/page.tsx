'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, updateMyProfile, UpdateProfilePayload } from '@/lib/services';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState<UpdateProfilePayload>({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getMyProfile();
        setProfile(data);
        setForm({ username: data.username ?? '', email: data.email ?? '', password: '' });
      } catch (err: any) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: UpdateProfilePayload = {};
      if (form.username) payload.username = form.username;
      if (form.email) payload.email = form.email;
      if (form.password) payload.password = form.password;

      const updated = await updateMyProfile(payload);
      setProfile(updated);
      setSuccess('Profile updated successfully');
      setEditing(false);
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-muted-foreground hover:text-foreground transition-colors text-xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
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

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {profile?.username || 'No username set'}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">{profile?.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                profile?.role === 'admin'
                  ? 'bg-primary/20 text-primary'
                  : profile?.role === 'moderator'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}>
                {profile?.role ?? 'user'}
              </span>
            </div>
            <button
              onClick={() => { setEditing(!editing); setError(null); setSuccess(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                editing
                  ? 'bg-secondary text-secondary-foreground hover:bg-muted'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Info Rows */}
          {!editing && (
            <div className="flex flex-col gap-3">
              {[
                { label: 'Email', value: profile?.email },
                { label: 'Username', value: profile?.username || '—' },
                { label: 'Balance', value: `$${parseFloat(profile?.balance ?? 0).toFixed(2)}` },
                { label: 'Wallet Address', value: profile?.walletAddress || '—' },
                {
                  label: 'Member Since',
                  value: profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : '—',
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center text-sm border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-foreground font-medium text-right max-w-[60%] break-all">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Form */}
        {editing && (
          <form
            onSubmit={handleUpdate}
            className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5"
          >
            <h3 className="text-foreground font-semibold text-base">Edit Details</h3>

            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Enter new username"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter new email"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                New Password{' '}
                <span className="text-muted-foreground font-normal">
                  (leave blank to keep current)
                </span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}