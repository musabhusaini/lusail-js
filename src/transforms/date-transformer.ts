import { sub } from 'date-fns';
import parse from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';
import { FieldTransform } from '../schema';
import { TransformerFactories } from '../transformer-factories';
import { DateTransform, TypeCastTransform } from './transforms';
import TypeCastTransformer from './type-cast-transformer';

export default class DateTransformer extends TypeCastTransformer<
  any,
  Date | Date[]
> {
  static isDateTransform(
    transform: FieldTransform,
  ): transform is DateTransform {
    return (
      (transform.getBy ?? 'cast') === 'cast' &&
      (transform as TypeCastTransform).castTo === 'date'
    );
  }

  get referenceDate(): Date {
    return this.options?.referenceDate ?? new Date();
  }

  protected castValue(value: any) {
    const { format = '', locale = 'en-US' } = this.transform as DateTransform;
    if (format === 'timeAgo') {
      return this.parseTimeAgo(value, locale);
    } else if (format) {
      const parsedLocale = locale
        ? require(`date-fns/locale/${locale}`)
        : undefined;
      return parse(value, format ?? '', this.referenceDate, {
        locale: parsedLocale,
      });
    } else {
      return parseISO(value);
    }
  }

  private parseTimeAgo(timeAgoString: string, locale?: string): Date {
    if (!locale?.startsWith('en')) {
      throw new Error('timeAgo is only supported in en* locales for now');
    }

    const regex = /\b(\d+)\s+(\w+?)s?\s+ago\b/i;
    const match = timeAgoString.match(regex);

    if (!match) {
      throw new Error('Invalid timeAgo format: ' + timeAgoString);
    }

    const value = parseInt(match[1], 10) || 1;
    const unit = match[2].toLowerCase() + 's';
    return sub(this.referenceDate, { [unit]: value });
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return DateTransformer.isDateTransform(transform)
    ? new DateTransformer(transform, options)
    : undefined;
}, 1);
