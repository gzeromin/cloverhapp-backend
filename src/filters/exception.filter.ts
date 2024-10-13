import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { FormErrorEnum } from '@/exceptions/form.exception';
import formErrorUtils from '@/utils/form-error.utils';
import { Locale } from '@/enums/user-locale.enum';

@Catch()
export class BadRequestFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const statusCode = exception.getStatus ? exception.getStatus() : 500;
    const errorBody = exception.getResponse
      ? (exception.getResponse() as {
          error: string;
          statusCode: number;
          message: any;
        })
      : {
          error: 'System Error',
          statusCode: 500,
          message: '',
        };
    const errorMessage = errorBody.message;
    const isBadRequest = exception instanceof BadRequestException;
    if (isBadRequest) {
      // make to formError
      if (Array.isArray(errorMessage)) {
        const locale = request.user?.locale ? request.user.locale : Locale.Kr;
        errorBody.error = FormErrorEnum.Error;
        errorBody.message = formErrorUtils(
          Object.keys(request.body),
          errorMessage,
          locale,
        );
        errorBody.statusCode = FormErrorEnum.StatusCode;
      }
    }

    return response.status(statusCode).json(errorBody);
  }
}
