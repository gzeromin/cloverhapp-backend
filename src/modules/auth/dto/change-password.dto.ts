import { Locale } from '@/enums/user-locale.enum';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  locale: Locale;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  passwordConfirm: string;
}
