export * from './account.dto.js';
export * from './password.dto.js';
export * from './identity.dto.js';

export class ReceiptTokenResponse {
  /**
   * The authentication receipt token.
   * @example eyJhbGci...
   */
  token!: string;

  /**
   * The date and time when the token expires.
   */
  expiresAt!: Date;
}
