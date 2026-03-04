import { randomBytes } from 'crypto';

export function generateWalletCode(length = 42): string {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = randomBytes(length);
  let result = '0x';

  for (let i = 0; i < length - 2; i++) {
    // -2 to account for '0x' prefix
    result += chars[bytes[i] % chars.length];
  }

  return result;
}
