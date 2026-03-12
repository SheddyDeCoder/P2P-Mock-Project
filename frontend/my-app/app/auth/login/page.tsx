// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import axios from 'axios';
import { LoginPayload } from '@/lib/services'; // Adjust import path as needed

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Using the LoginPayload type
      const payload: LoginPayload = {
        email: email.trim().toLowerCase(),
        password,
      };

      const response = await api.post('/auth/login', payload);

      const { token, user } = response.data ?? {}; // adjust based on your backend response shape

      if (!token) {
        throw new Error('No token received from server');
      }

      // Store token
      localStorage.setItem('token', token);

      // Optional: store minimal user info if returned
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);

      if (axios.isAxiosError(err)) {
        const serverMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Invalid email or password';

        setError(serverMessage);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '80px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>Login</h1>

      {error && (
        <div
          style={{
            color: 'red',
            marginBottom: '16px',
            textAlign: 'center',
            padding: '10px',
            background: '#ffebee',
            borderRadius: '6px',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="your.email@example.com"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}
          >
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '10px',
                paddingRight: '40px',
                borderRadius: '6px',
                border: '1px solid #ccc',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#666',
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#aaa' : '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '24px' }}>
        Don't have an account?{' '}
        <a
          href="/auth/register"
          style={{ color: '#0066cc', textDecoration: 'underline' }}
        >
          Register here
        </a>
      </p>
    </div>
  );
}
