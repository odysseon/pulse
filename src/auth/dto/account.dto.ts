import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator";

export class RegisterDto {
  /**
   * The email address for the new account.
   * @example ada@example.com
   */
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  /**
   * The password for the new account.
   * @example secret123
   */
  @IsString()
  @IsStrongPassword()
  password!: string;

  /**
   * The unique username of the user/owner
   * @example "hammed_anu"
   */
  @IsString()
  @MinLength(2)
  username!: string;
}

export class RegisterResponse {
  /**
   * The unique identifier of the newly created account.
   * @example 01J...
   */
  accountId!: string;

  /**
   * The email address associated with the account.
   * @example ada@example.com
   */
  email!: string;

  /**
   * The unique identifier of the newly created user.
   * @example 01J...
   */
  userId!: string;

  /**
   * The unique username of the registered user.
   * @example "hammed_anu"
   */
  username!: string;

  /**
   * The date and time when the account was created.
   */
  createdAt!: Date;
}
