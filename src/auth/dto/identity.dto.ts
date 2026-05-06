export class ProfileResponse {
  /**
   * The unique identifier for the account.
   * @example 01J...
   */
  accountId!: string;

  /**
   * The date and time when the profile session or token expires.
   */
  expiresAt!: Date;
}
