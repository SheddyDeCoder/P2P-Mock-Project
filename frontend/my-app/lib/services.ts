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
  direction: 'balance_to_wallet' | 'wallet_to_balance'; // ← added
};
export type OfferPayload = {
  type: 'buy' | 'sell';
  asset: string;
  price: number;
};
export type TradePayload = {
  offerId: string;           // ← added
  counterpartyId: string;
  amount: number;
  walletAddress?: string;    // ← added for guests
};
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
  walletAddress: string;
  asset: string;
  amount: number;
};

// ============================================================
// AUTH
// ============================================================

export const register = async (payload: RegisterPayload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const login = async (payload: LoginPayload) => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};

export const logout = async (id: string) => {
  const { data } = await api.delete(`/auth/logout/${id}`);
  return data;
};

// ============================================================
// USERS
// ============================================================

export const getAllUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

export const getMyProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};

export const updateMyProfile = async (payload: UpdateProfilePayload) => {
  const { data } = await api.patch('/users/profile', payload);
  return data;
};

export const updateUserRole = async (id: string, payload: UpdateRolePayload) => {
  const { data } = await api.patch(`/users/${id}/role`, payload);
  return data;
};

export const getUserById = async (id: string) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

// ============================================================
// FUNDING
// ============================================================

export const createFunding = async (payload: FundingPayload) => {
  const { data } = await api.post('/funding', payload);
  return data;
};

export const getMyFunding = async () => {
  const { data } = await api.get('/funding');
  return data;
};

export const getFundingById = async (id: string) => {
  const { data } = await api.get(`/funding/${id}`);
  return data;
};

// ============================================================
// SWAP
// ============================================================

export const createSwap = async (payload: SwapPayload) => {
  const { data } = await api.post('/swap', payload);
  return data;
};

export const getSwapHistory = async () => {
  const { data } = await api.get('/swap/history');
  return data;
};

// ============================================================
// OFFERS
// ============================================================

export const createOffer = async (payload: OfferPayload) => {
  const { data } = await api.post('/offers', payload);
  return data;
};

export const getOffers = async () => {
  const { data } = await api.get('/offers');
  return data;
};

// ============================================================
// TRADES
// ============================================================

export const createTrade = async (payload: TradePayload) => {
  const { data } = await api.post('/trades', payload);
  return data;
};

export const getMyTrades = async () => {
  const { data } = await api.get('/trades/my-trades'); // ← fixed endpoint
  return data;
};

export const updateTradeStatus = async (id: string, status: string) => {
  const { data } = await api.patch(`/trades/${id}/status`, { status });
  return data;
};

// ============================================================
// ESCROW
// ============================================================

export const getEscrowByTrade = async (tradeId: string) => {
  const { data } = await api.get(`/escrow/trade/${tradeId}`);
  return data;
};

export const getEscrow = async (id: string) => {
  const { data } = await api.get(`/escrow/${id}`);
  return data;
};

export const updateEscrow = async (id: string, payload: EscrowUpdatePayload) => {
  const { data } = await api.patch(`/escrow/${id}`, payload);
  return data;
};

// ============================================================
// WALLET
// ============================================================

export const fundWallet = async (payload: WalletFundPayload) => {
  const { data } = await api.post('/wallet', payload);
  return data;
};

export const getMyWallets = async () => {
  const { data } = await api.get('/wallet');
  return data;
};