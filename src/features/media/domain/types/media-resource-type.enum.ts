export const MediaResourceType = {
  LISTING: 'LISTING',
  BUSINESS_PROFILE: 'BUSINESS_PROFILE',
  REVIEW: 'REVIEW',
} as const;

export type MediaResourceType = (typeof MediaResourceType)[keyof typeof MediaResourceType];
