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
