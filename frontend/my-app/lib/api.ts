import axios from 'axios';

/**
 * ============================================================
 * STEP 1: AXIOS INSTANCE
 * ============================================================
 * We create ONE axios instance for the whole app.
 * Every API call goes through this instance.
 *
 * baseURL → your NestJS backend running on port 5005
 * Your backend routes are under /auth, /funding etc.
 * so the full URL becomes: http://localhost:5005/auth/register etc.
 * ============================================================
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005', // Removed /api
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * ============================================================
 * STEP 2: REQUEST INTERCEPTOR
 * ============================================================
 * This runs BEFORE every request automatically.
 * It reads the JWT token from localStorage and adds it to
 * the Authorization header so your JwtAuthGuard works.
 *
 * Without this, every protected route returns 401 Unauthorized.
 * ============================================================
 */
api.interceptors.request.use((config) => {
  // only runs in browser (not during SSR)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * ============================================================
 * STEP 3: RESPONSE INTERCEPTOR
 * ============================================================
 * This runs AFTER every response.
 * If the server returns 401 (token expired or invalid),
 * we clear the token and redirect to login automatically.
 * ============================================================
 */
api.interceptors.response.use(
  (response) => response, // pass through successful responses
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // redirect to login page
    }
    return Promise.reject(error);
  },
);

export default api;