import { HttpException, HttpStatus } from '@nestjs/common';

export type FormError = {
  field: string;
  message: string;
};

export enum FormErrorEnum {
  Error = 'formError',
  StatusCode = 1000,
}

export class FormException extends HttpException {
  constructor(formError: FormError[]) {
    super(
      {
        error: FormErrorEnum.Error,
        message: formError,
        statusCode: FormErrorEnum.StatusCode,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
