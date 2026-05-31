export const ListingStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  PAUSED: 'PAUSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];
