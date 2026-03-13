// app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AxiosError } from 'axios';
import { RegisterPayload } from '@/lib/services';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Basic client-side checks
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (form.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    try {
      const payload: RegisterPayload = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      const response = await api.post('/auth/register', payload);

      console.log('Registration successful:', response.status, response.data);

      const token = response.data?.token;

      // Optional: auto-login if backend returns token on register
      if (token) {
        localStorage.setItem('token', token);
        router.push('/dashboard');
        router.refresh();
        return;
      }

      // Show success message in the body instead of alert
      setSuccessMessage('Registration successful! Please log in.');

      // Redirect after a short delay to show the message
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      let displayError = 'Registration failed. Please try again.';

      if (err instanceof AxiosError) {
        const axiosErr = err as AxiosError<any>;
        console.error('Registration failed:', {
          status: axiosErr.response?.status,
          data: axiosErr.response?.data,
          message: axiosErr.message,
        });

        const data = axiosErr.response?.data;

        if (data) {
          if (data.message) {
            displayError = data.message;
          } else if (data.error) {
            displayError = data.error;
          } else if (data.errors) {
            const firstKey = Object.keys(data.errors)[0];
            displayError =
              data.errors[firstKey]?.[0] || JSON.stringify(data.errors);
          } else {
            displayError = JSON.stringify(data);
          }
        } else {
          displayError = axiosErr.message || 'Network or server issue';
        }
      }

      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '80px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>Register</h1>

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

      {successMessage && (
        <div
          style={{
            color: 'green',
            marginBottom: '16px',
            textAlign: 'center',
            padding: '10px',
            background: '#e8f5e9',
            borderRadius: '6px',
          }}
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}
          >
            Username
          </label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            minLength={3}
            autoComplete="username"
            placeholder="Choose a username"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}
          >
            Email
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
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

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}
          >
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
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

        <div style={{ marginBottom: '24px' }}>
          <label
            style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}
          >
            Confirm Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword || ''}
              onChange={handleChange}
              required
              autoComplete="new-password"
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#aaa' : 'var(--primary)', // ← changed to your brand gold
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '24px' }}>
        Already have an account?{' '}
        <a
          href="/auth/login"
          style={{ color: 'var(--primary)', textDecoration: 'underline' }} // ← changed to your brand gold
        >
          Login here
        </a>
      </p>
    </div>
  );
}