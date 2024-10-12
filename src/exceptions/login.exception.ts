import { HttpException, HttpStatus } from '@nestjs/common';

export type LoginError = {
  field: string;
  message: string;
};

export enum LoginErrorEnum {
  Error = 'loginError',
  StatusCode = 2000,
}

export class LoginException extends HttpException {
  constructor(message) {
    super(
      {
        error: LoginErrorEnum.Error,
        message,
        statusCode: LoginErrorEnum.StatusCode,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
