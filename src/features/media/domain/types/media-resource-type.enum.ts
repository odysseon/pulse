export const MediaResourceType = {
  LISTING: 'LISTING',
  BUSINESS_PROFILE: 'BUSINESS_PROFILE',
} as const;

export type MediaResourceType = (typeof MediaResourceType)[keyof typeof MediaResourceType];
