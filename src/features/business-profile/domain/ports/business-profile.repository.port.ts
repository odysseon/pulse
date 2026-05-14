import { BusinessProfile } from '../types/business-profile.entity.js';
import {
  CreateBusinessProfileInput,
  DiscoverBusinessesInput,
  PaginatedBusinessSummaries,
  UpdateBusinessProfileBrandingInput,
  UpdateBusinessProfileInput,
} from '../types/business-profile.types.js';

/**
 * Port: persistence contract for business profiles.
 *
 * Defined in Zone 0 (domain).
 * Implemented in Zone 3 (infrastructure — Prisma adapter).
 *
 * The domain depends on this interface, never on its implementation.
 */
export interface IBusinessProfileRepository {
  /**
   * Persist a new business profile.
   * Slug uniqueness is enforced at the persistence level.
   */
  create(input: CreateBusinessProfileInput, slug: string): Promise<BusinessProfile>;

  /**
   * Find a business profile by its internal ID.
   * Returns null if not found.
   */
  findById(id: string): Promise<BusinessProfile | null>;

  /**
   * Find a business profile by its public slug.
   * Returns null if not found.
   */
  findBySlug(slug: string): Promise<BusinessProfile | null>;

  /**
   * Check whether a slug is already taken.
   * Used before persisting to enforce the uniqueness invariant.
   */
  isSlugTaken(slug: string): Promise<boolean>;

  /**
   * Return all business profiles owned by a given user.
   */
  findByOwner(ownerId: string): Promise<BusinessProfile[]>;

  /**
   * Apply safe field updates to a business profile.
   * Does not touch ownership, slug, or verification status.
   */
  update(id: string, input: UpdateBusinessProfileInput): Promise<BusinessProfile>;

  /**
   * Apply branding asset updates.
   * Separate from update() because branding goes through the upload pipeline.
   */
  updateBranding(id: string, input: UpdateBusinessProfileBrandingInput): Promise<BusinessProfile>;

  /**
   * Remove a business profile by ID.
   */
  delete(id: string): Promise<void>;

  /**
   * Public discovery query.
   * Must return only public profiles.
   * Supports pagination, filtering, and text search.
   */
  discover(input: DiscoverBusinessesInput): Promise<PaginatedBusinessSummaries>;
}

