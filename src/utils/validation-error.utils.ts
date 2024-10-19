import { Locale } from '@/enums/user-locale.enum';
import { FormError } from '@/exceptions/form.exception';
import $t from './message.util';
import { ValidationError } from 'class-validator';

export default (errors: ValidationError[], locale: Locale): FormError[] => {
  return errors.map((error) => {
    let field = error.property;
    const constraints = error.constraints;
    const constraint =
      Object.values(constraints).length > 0
        ? Object.values(constraints)[0]
        : '';
    let message = $t(locale).FormError.Default;

    const duplicateMatch = constraint.match(
      /Key \((.*?)\)=\((.*?)\) already exists./,
    );
    const notEmailMatch = constraint.match(/(.*?) must be an email/);
    const underMinLengthMatch = constraint.match(
      /(.*?) must be longer than or equal to (\d+) characters/,
    );
    const overMaxLengthMatch = constraint.match(
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
    return {
      field,
      message,
    };
  });
};
