import api from './api';

// ============================================================
// TYPES
// ============================================================

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = {
  email: string;
  password: string;
  username?: string;
};
export type FundingPayload = {
  type: 'deposit' | 'withdrawal';
  asset: string;
  amount: number;
};
export type SwapPayload = {
  fromAsset: string;
  toAsset: string;
  fromAmount: number;
};
export type OfferPayload = {
  type: 'buy' | 'sell';
  asset: string;
  price: number;
};
export type TradePayload = { counterpartyId: string; amount: number };

// ============================================================
// AUTH
// ============================================================

/**
 * POST /api/auth/register
 * Call this on your register page.
 */
export const register = async (payload: RegisterPayload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

/**
 * POST /api/auth/login
 * After calling this, save the token:
 *   localStorage.setItem('token', data.access_token)
 */
export const login = async (payload: LoginPayload) => {
  const { data } = await api.post('/auth/login', payload);
  return data; // { access_token: '...' }
};

/**
 * DELETE /api/auth/logout/:id
 */
export const logout = async (id: string) => {
  const { data } = await api.delete(`/auth/logout/${id}`);
  return data;
};

// ============================================================
// USERS
// ============================================================

/**
 * GET /api/users
 */
export const getAllUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

/**
 * GET /api/users/profile
 * Returns the currently logged-in user's profile.
 */
export const getMyProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};

/**
 * GET /api/users/:id
 */
export const getUserById = async (id: string) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

// ============================================================
// FUNDING
// ============================================================

/**
 * POST /api/funding
 * userId comes from JWT — don't send it.
 */
export const createFunding = async (payload: FundingPayload) => {
  const { data } = await api.post('/funding', payload);
  return data;
};

/**
 * GET /api/funding
 * Returns all funding entries for the logged-in user.
 */
export const getMyFunding = async () => {
  const { data } = await api.get('/funding');
  return data;
};

/**
 * GET /api/funding/:id
 */
export const getFundingById = async (id: string) => {
  const { data } = await api.get(`/funding/${id}`);
  return data;
};

// ============================================================
// SWAP
// ============================================================

/**
 * POST /api/swap
 */
export const createSwap = async (payload: SwapPayload) => {
  const { data } = await api.post('/swap', payload);
  return data;
};

/**
 * GET /api/swap/History
 */
export const getSwapHistory = async () => {
  const { data } = await api.get('/swap/History');
  return data;
};

// ============================================================
// OFFERS
// ============================================================

/**
 * POST /api/offers
 */
export const createOffer = async (payload: OfferPayload) => {
  const { data } = await api.post('/offers', payload);
  return data;
};

/**
 * GET /api/offers
 */
export const getOffers = async () => {
  const { data } = await api.get('/offers');
  return data;
};

// ============================================================
// TRADES
// ============================================================

/**
 * POST /api/trades
 * Backend auto-finds your active offer.
 * Only send counterpartyId + amount.
 */
export const createTrade = async (payload: TradePayload) => {
  const { data } = await api.post('/trades', payload);
  return data;
};

/**
 * GET /api/trades
 * Returns all trades where you are buyer or seller.
 */
export const getMyTrades = async () => {
  const { data } = await api.get('/trades');
  return data;
};

/**
 * PATCH /api/trades/:id/status
 */
export const updateTradeStatus = async (id: string, status: string) => {
  const { data } = await api.patch(`/trades/${id}/status`, { status });
  return data;
};

// ============================================================
// ESCROW
// ============================================================

/**
 * GET /api/escrow/trade/:tradeId
 */
export const getEscrowByTrade = async (tradeId: string) => {
  const { data } = await api.get(`/escrow/trade/${tradeId}`);
  return data;
};

/**
 * GET /api/escrow/:id
 */
export const getEscrow = async (id: string) => {
  const { data } = await api.get(`/escrow/${id}`);
  return data;
};

/**
 * PATCH /api/escrow/:id
 * To release: { status: 'released' }
 * To dispute: { status: 'disputed' }
 */
export const updateEscrow = async (
  id: string,
  payload: { status: string; contractAddress?: string },
) => {
  const { data } = await api.patch(`/escrow/${id}`, payload);
  return data;
};
