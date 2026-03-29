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
  direction: 'balance_to_wallet' | 'wallet_to_balance';
};
export type OfferPayload = {
  type: 'buy' | 'sell';
  asset: string;
  price: number;
};
export type TradePayload = { counterpartyId: string; amount: number };
export type UpdateProfilePayload = {
  username?: string;
  email?: string;
  password?: string;
};
export type UpdateRolePayload = {
  role: string;
};
export type EscrowUpdatePayload = {
  status: 'released' | 'disputed';
  contractAddress?: string;
};
export type WalletFundPayload = {
  type: 'deposit' | 'withdrawal';
  walletAddress: string;
  asset: string;
  amount: number;
};

// ============================================================
// AUTH
// ============================================================

/**
 * POST /auth/register
 */
export const register = async (payload: RegisterPayload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

/**
 * POST /auth/login
 * After calling this, save the token:
 *   localStorage.setItem('token', data.access_token)
 */
export const login = async (payload: LoginPayload) => {
  const { data } = await api.post('/auth/login', payload);
  return data; // { access_token: '...' }
};

/**
 * DELETE /auth/logout/:id
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
 */
export const getAllUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

/**
 * GET /users/profile
 * Returns the currently logged-in user's profile.
 */
export const getMyProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};

/**
 * PATCH /users/profile
 * Update the currently logged-in user's profile.
 */
export const updateMyProfile = async (payload: UpdateProfilePayload) => {
  const { data } = await api.patch('/users/profile', payload);
  return data;
};

/**
 * PATCH /users/:id/role
 * Admin only — update a user's role.
 */
export const updateUserRole = async (
  id: string,
  payload: UpdateRolePayload,
) => {
  const { data } = await api.patch(`/users/${id}/role`, payload);
  return data;
};

/**
 * GET /users/:id
 */
export const getUserById = async (id: string) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

// ============================================================
// FUNDING
// ============================================================

/**
 * POST /funding
 * userId comes from JWT — don't send it.
 */
export const createFunding = async (payload: FundingPayload) => {
  const { data } = await api.post('/funding', payload);
  return data;
};

/**
 * GET /funding
 * Returns all funding entries for the logged-in user.
 */
export const getMyFunding = async () => {
  const { data } = await api.get('/funding');
  return data;
};

/**
 * GET /funding/:id
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
 */
export const createSwap = async (payload: SwapPayload) => {
  const { data } = await api.post('/swap', payload);
  return data;
};

/**
 * GET /swap/history
 */
export const getSwapHistory = async () => {
  const { data } = await api.get('/swap/history'); // fixed: was '/swap/History'
  return data;
};

// ============================================================
// OFFERS
// ============================================================

/**
 * POST /offers
 */
export const createOffer = async (payload: OfferPayload) => {
  const { data } = await api.post('/offers', payload);
  return data;
};

/**
 * GET /offers
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
 * Backend auto-finds your active offer.
 * Only send counterpartyId + amount.
 */
export const createTrade = async (payload: TradePayload) => {
  const { data } = await api.post('/trades', payload);
  return data;
};

/**
 * GET /trades
 * Returns all trades where you are buyer or seller.
 */
export const getMyTrades = async () => {
  const { data } = await api.get('/trades');
  return data;
};

/**
 * PATCH /trades/:id/status
 */
export const updateTradeStatus = async (id: string, status: string) => {
  const { data } = await api.patch(`/trades/${id}/status`, { status });
  return data;
};

// ============================================================
// ESCROW
// ============================================================

/**
 * GET /escrow/trade/:tradeId
 */
export const getEscrowByTrade = async (tradeId: string) => {
  const { data } = await api.get(`/escrow/trade/${tradeId}`);
  return data;
};

/**
 * GET /escrow/:id
 */
export const getEscrow = async (id: string) => {
  const { data } = await api.get(`/escrow/${id}`);
  return data;
};

/**
 * PATCH /escrow/:id
 * To release: { status: 'released' }
 * To dispute: { status: 'disputed' }
 */
export const updateEscrow = async (
  id: string,
  payload: EscrowUpdatePayload,
) => {
  const { data } = await api.patch(`/escrow/${id}`, payload);
  return data;
};

// ============================================================
// WALLET
// ============================================================

/**
 * POST /wallet
 * Fund a wallet by wallet address.
 */
export const fundWallet = async (payload: WalletFundPayload) => {
  const { data } = await api.post('/wallet', payload);
  return data;
};

/**
 * GET /wallet
 * Get all my asset wallet balances.
 */
export const getMyWallets = async () => {
  const { data } = await api.get('/wallet');
  return data;
};
