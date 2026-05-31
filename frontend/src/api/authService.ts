import { getTokenExpiry } from '@/api/client';

export const authService = {
  isTokenExpired(expiry: Date): boolean {
    return expiry.getTime() <= Date.now();
  },

  getTokenExpiry(token: string): Date | null {
    return getTokenExpiry(token);
  },
};
