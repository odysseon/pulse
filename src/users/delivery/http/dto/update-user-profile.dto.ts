import { IsString, IsOptional, IsUrl } from 'class-validator';

/**
 * Payload for updating a user's profile information.
 * Used after a successful media upload to link the avatar to the user.
 */
export class UpdateUserProfileDto {
  /**
   * The updated full name of the user.
   * @example "Hammed Anuoluwapo"
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * The delivery URL of the newly uploaded avatar.
   */
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  /**
   * The management ID of the newly uploaded avatar.
   * Crucial for subsequent replacements or deletions.
   */
  @IsOptional()
  @IsString()
  avatarId?: string;

  /**
   * Direct contact number for the user/owner.
   * @example "+2348012345678"
   */
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
