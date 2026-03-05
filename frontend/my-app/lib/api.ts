// // src/lib/api.ts
// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',   // ← change to your backend URL
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Optional: Add request/response interceptors later (e.g. for auth tokens, error handling)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API Error:', error.message);
//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from 'axios';

/**
 * ============================================================
 * API CLIENT SETUP
 * ============================================================
 * We create a single axios instance with the base URL.
 * This means every request automatically goes to your NestJS backend.
 *
 * The interceptor automatically attaches the JWT token from
 * localStorage to every request — you don't have to add it manually.
 * ============================================================
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 * -------------------
 * Runs before every request.
 * Reads the token from localStorage and adds it to the Authorization header.
 * This is what allows @UseGuards(JwtAuthGuard) to work on the backend.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or wherever you store it
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// TYPES
// ============================================================

export type FundingType = 'deposit' | 'withdrawal';
export type SwapPayload = {
  fromAsset: string;
  toAsset: string;
  fromAmount: number;
};
export type FundingPayload = {
  type: FundingType;
  asset: string;
  amount: number;
};
export type LoginPayload = { email: string; password: string };
export type RegisterPayload = {
  email: string;
  password: string;
  username?: string;
};
export type OfferPayload = {
  type: 'buy' | 'sell';
  asset: string;
  price: number;
};
export type TradePayload = { offerId: string; amount: number };

// ============================================================
// AUTH
// ============================================================

/**
 * POST /auth/register
 * Creates a new user account.
 */
export const register = async (payload: RegisterPayload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

/**
 * POST /auth/login
 * Returns a JWT token. Store it in localStorage after calling this.
 *
 * Usage:
 *   const { access_token } = await login({ email, password });
 *   localStorage.setItem('token', access_token);
 */
export const login = async (payload: LoginPayload) => {
  const { data } = await api.post('/auth/login', payload);
  return data; // { access_token: '...' }
};

/**
 * DELETE /auth/logout/{id}
 * Logs out the user by their ID.
 */
export const logout = async (id: string) => {
  const { data } = await api.delete(`/auth/logout/${id}`);
  return data;
};

// ============================================================
// USERS
// ============================================================

/**
 * GET /users
 * Returns all users. Requires JWT token.
 */
export const getAllUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

// ============================================================
// OFFERS
// ============================================================

/**
 * POST /offers
 * Creates a new buy or sell offer.
 * userId is extracted from JWT on the backend — don't send it.
 */
export const createOffer = async (payload: OfferPayload) => {
  const { data } = await api.post('/offers', payload);
  return data;
};

/**
 * GET /offers
 * Returns all active offers.
 */
export const getOffers = async () => {
  const { data } = await api.get('/offers');
  return data;
};

// ============================================================
// TRADES
// ============================================================

/**
 * POST /trades
 * Creates a new trade against an offer.
 */
export const createTrade = async (payload: TradePayload) => {
  const { data } = await api.post('/trades', payload);
  return data;
};

/**
 * GET /trades
 * Returns all trades.
 */
export const getTrades = async () => {
  const { data } = await api.get('/trades');
  return data;
};

/**
 * PATCH /trades/{id}/status
 * Updates the status of a trade (e.g. funded, completed, cancelled).
 */
export const updateTradeStatus = async (id: string, status: string) => {
  const { data } = await api.patch(`/trades/${id}/status`, { status });
  return data;
};

// ============================================================
// ESCROW
// ============================================================

/**
 * GET /escrow/trade/{tradeId}
 * Returns the escrow record for a specific trade.
 */
export const getEscrowByTrade = async (tradeId: string) => {
  const { data } = await api.get(`/escrow/trade/${tradeId}`);
  return data;
};

/**
 * GET /escrow/{id}
 * Returns a single escrow record by its ID.
 */
export const getEscrow = async (id: string) => {
  const { data } = await api.get(`/escrow/${id}`);
  return data;
};

/**
 * PATCH /escrow/{id}
 * Updates an escrow record (e.g. release or dispute).
 */
export const updateEscrow = async (id: string, payload: { status: string }) => {
  const { data } = await api.patch(`/escrow/${id}`, payload);
  return data;
};

// ============================================================
// FUNDING
// ============================================================

/**
 * POST /funding
 * Creates a deposit or withdrawal.
 * userId is extracted from JWT on the backend — don't send it.
 *
 * Usage:
 *   await createFunding({ type: 'deposit', asset: 'USD', amount: 1000 });
 */
export const createFunding = async (payload: FundingPayload) => {
  const { data } = await api.post('/funding', payload);
  return data;
};

/**
 * GET /funding
 * Returns all funding entries for the currently logged-in user.
 */
export const getMyFunding = async () => {
  const { data } = await api.get('/funding');
  return data;
};

/**
 * GET /funding/{id}
 * Returns a single funding entry by ID.
 */
export const getFundingById = async (id: string) => {
  const { data } = await api.get(`/funding/${id}`);
  return data;
};

// ============================================================
// SWAP
// ============================================================

/**
 * POST /swap
 * Creates a new asset swap.
 * userId is extracted from JWT on the backend — don't send it.
 *
 * Usage:
 *   await createSwap({ fromAsset: 'USD', toAsset: 'BTC', fromAmount: 100 });
 */
export const createSwap = async (payload: SwapPayload) => {
  const { data } = await api.post('/swap', payload);
  return data;
};

/**
 * GET /swap/History
 * Returns swap history for the currently logged-in user.
 */
export const getSwapHistory = async () => {
  const { data } = await api.get('/swap/History');
  return data;
};

export default api;
