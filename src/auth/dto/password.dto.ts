import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginPasswordDto {
  /**
   * The email address of the user.
   * @example ada@example.com
   */
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  /**
   * The password for the account.
   * @example secret123!
   */
  @IsNotEmpty()
  @IsStrongPassword()
  password!: string;
}
