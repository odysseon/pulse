import { UpdateUserProfileDto } from '../../delivery/http/dto/update-user-profile.dto.js';
import { UserEntity } from '../domain/user.types.js';

export const USER_REPOSITORY_TOKEN = Symbol('USER_REPOSITORY_TOKEN');

export interface IUserRepository {
  /**
   * Retrieves a domain user by their associated authentication account ID.
   */
  findByAccountId(accountId: string): Promise<UserEntity | null>;

  /**
   * Partially updates a user's profile.
   */
  updateProfile(accountId: string, payload: UpdateUserProfileDto): Promise<UserEntity>;
}
