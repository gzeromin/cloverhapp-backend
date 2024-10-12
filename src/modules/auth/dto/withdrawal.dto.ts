import { IsNotEmpty } from 'class-validator';

export class WithdrawalDto {
  @IsNotEmpty()
  password: string;
}
