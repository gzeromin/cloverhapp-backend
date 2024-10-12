import { Locale } from 'src/enums/user-locale.enum';
import en from '@locales/en/message.json';
import jp from '@locales/jp/message.json';
import kr from '@locales/kr/message.json';

export default (locale: Locale) => {
  switch (locale) {
    case Locale.En:
      return en;
    case Locale.Kr:
      return kr;
    case Locale.Jp:
      return jp;
    default:
      return en;
  }
};
