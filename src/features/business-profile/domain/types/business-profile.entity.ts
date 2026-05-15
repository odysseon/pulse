import { BusinessType } from './business-type.enum.js';
import { VerificationStatus } from './verification-status.enum.js';

/**
 * Represents a public commercial storefront identity owned by a user.
 *
 * Responsibilities:
 * - Establishes commercial presence on the platform
 * - Controls public discoverability
 * - Carries trust signals (verification, branding)
 * - Acts as parent identity for future listings/offerings
 *
 * NOT:
 * - A user account
 * - A team or org system
 * - A CRM record
 * - A legal entity abstraction
 */
export interface BusinessProfile {
  readonly id: string;

  /** Platform identity that owns this business profile */
  readonly ownerId: string;

  /** Public display name */
  readonly name: string;

  /**
   * Unique stable URL segment.
   * Example: "pulse-logistics" → /businesses/pulse-logistics
   * Immutable after creation.
   */
  readonly slug: string;

  /** Descriptive commercial classification — not a permission or role */
  readonly businessType: BusinessType;

  /** Controls whether this profile appears in public discovery */
  readonly isPublic: boolean;

  /** Trust indicator — not authorization, not role escalation */
  readonly verificationStatus: VerificationStatus;

  readonly description: string | null;

  /** Branding — increases trust and recognition */
  readonly logoUrl: string | null;
  readonly logoId: string | null;
  readonly bannerUrl: string | null;
  readonly bannerId: string | null;

  /** External contact — Pulse does not execute commerce, connection is external */
  readonly phoneNumber: string | null;
  readonly whatsapp: string | null;
  readonly email: string | null;
  readonly location: string | null;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}
