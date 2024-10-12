import { Locale } from '@/enums/user-locale.enum';
import { FormError } from '@/exceptions/form.exception';
import $t from './message.util';
import { InternalServerErrorException } from '@nestjs/common';

export default (
  fields: string[],
  errorMessages: string[],
  locale: Locale,
): FormError[] => {
  return errorMessages.map((errorMessage) => {
    let field = errorMessage.split(/\s/)[0];
    let message = $t(locale).FormError.Default;
    const duplicateMatch = errorMessage.match(
      /Key \((.*?)\)=\((.*?)\) already exists./,
    );
    const notEmailMatch = errorMessage.match(/(.*?) must be an email/);
    const underMinLengthMatch = errorMessage.match(
      /(.*?) must be longer than or equal to (\d+) characters/,
    );
    const overMaxLengthMatch = errorMessage.match(
      /(.*?) must be shorter than or equal to (\d+) characters/,
    );
    if (duplicateMatch) {
      const [, realField, value] = duplicateMatch;
      field = realField;
      message = $t(locale).FormError.Duplicated.replace('{value}', value);
    } else if (notEmailMatch) {
      const [, value] = notEmailMatch;
      message = $t(locale).FormError.NotEmail.replace('{value}', value);
    } else if (underMinLengthMatch) {
      const [, , value] = underMinLengthMatch;
      message = $t(locale)
        .FormError.UnderMinLength.replace('{field}', field)
        .replace('{value}', value);
    } else if (overMaxLengthMatch) {
      const [, , value] = overMaxLengthMatch;
      message = $t(locale)
        .FormError.OverMaxLength.replace('{field}', field)
        .replace('{value}', value);
    }
    if (!fields.includes(field)) {
      throw new InternalServerErrorException();
    }
    return {
      field,
      message,
    };
  });
};
