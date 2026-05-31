export const Currency = {
  NGN: 'NGN',
  USD: 'USD',
  GBP: 'GBP',
  EUR: 'EUR',
} as const;

export type Currency = (typeof Currency)[keyof typeof Currency];
