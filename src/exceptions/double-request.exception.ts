import { HttpException, HttpStatus } from '@nestjs/common';

export type DoubleRequestError = {
  field: string;
  message: string;
};

export enum DoubleRequestErrorEnum {
  Error = 'doubleRequestError',
  StatusCode = 3000,
}

export class DoubleRequestException extends HttpException {
  constructor(message) {
    super(
      {
        error: DoubleRequestErrorEnum.Error,
        message,
        statusCode: DoubleRequestErrorEnum.StatusCode,
      },
      HttpStatus.CONFLICT,
    );
  }
}
