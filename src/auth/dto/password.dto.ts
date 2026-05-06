import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

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
   * @example secret123
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
