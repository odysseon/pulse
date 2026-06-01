/**
 * Semantic role of a media item within its parent resource.
 *
 * Constraints:
 *   LOGO   — BusinessProfile only. Singleton (max 1 per profile).
 *   BANNER — BusinessProfile only. Singleton (max 1 per profile).
 *   COVER  — Listing only. Singleton (max 1 per listing).
 *   GALLERY — Both resource types. Multiple items. Reorderable.
 *
 * Singleton roles have order = null.
 * GALLERY items have a contiguous 0-based order value.
 */
export const MediaRole = {
  LOGO: 'LOGO',
  BANNER: 'BANNER',
  COVER: 'COVER',
  GALLERY: 'GALLERY',
} as const;

export type MediaRole = (typeof MediaRole)[keyof typeof MediaRole];

/** Roles that are singletons — at most one per resource. */
export const SINGLETON_ROLES: ReadonlySet<MediaRole> = new Set([
  MediaRole.LOGO,
  MediaRole.BANNER,
  MediaRole.COVER,
]);

/** Valid roles per resource type. */
export const ROLES_BY_RESOURCE_TYPE: Record<string, ReadonlySet<MediaRole>> = {
  BUSINESS_PROFILE: new Set([MediaRole.LOGO, MediaRole.BANNER, MediaRole.GALLERY]),
  LISTING: new Set([MediaRole.COVER, MediaRole.GALLERY]),
  // Reviews only support raw gallery photos — no logo, banner, or cover slots.
  REVIEW: new Set([MediaRole.GALLERY]),
};
