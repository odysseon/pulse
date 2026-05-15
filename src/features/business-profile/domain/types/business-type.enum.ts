export const BusinessType = {
  INDIVIDUAL: 'INDIVIDUAL',
  RETAILER: 'RETAILER',
  DISTRIBUTOR: 'DISTRIBUTOR',
  WHOLESALER: 'WHOLESALER',
  AGENCY: 'AGENCY',
} as const;

export type BusinessType = (typeof BusinessType)[keyof typeof BusinessType];
