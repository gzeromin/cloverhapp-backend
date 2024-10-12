import { FormException } from '@/exceptions/form.exception';
import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import $t from '@/utils/message.util';

export class PasswordCheckPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.password !== value.passwordConfirm) {
      throw new FormException([
        {
          field: 'passwordConfirm',
          message: $t(value.locale).FormError.PasswordsNotMatch,
        },
      ]);
    }

    // 비밀번호 유효성 검사: 영어 대문자, 숫자, 특수문자가 포함되어 있는지 확인
    // const passwordRegex =
    //   /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // if (!passwordRegex.test(value.password)) {
    //   throw new FormException([
    //     {
    //       field: 'password',
    //       message:
    //         'Password must contain at least one uppercase letter, one number, and one special character',
    //     },
    //   ]);
    // }

    return value;
  }
}
