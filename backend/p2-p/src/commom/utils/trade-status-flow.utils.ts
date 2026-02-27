import { TradeStatus } from '@prisma/client';
export function validateTradeTransition(
  current: TradeStatus,
  next: TradeStatus,
) {
  const allowedTransitions = {
    pending: TradeStatus.funded,
    funded: TradeStatus.completed,
    completed: null, // No transitions allowed from completed
  };
  if (allowedTransitions[current] !== next) {
    throw new Error(
      `Invalid trade status transition from ${current} to ${next}`,
    );
  }
}
