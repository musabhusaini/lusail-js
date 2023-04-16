import { isUndefined } from 'lodash';
import { FieldTransform } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { RegexTransform } from './transforms';

export default class RegexTransformer extends Transformer<
  RegexTransform,
  string | string[],
  string | string[]
> {
  static isRegexTransform(
    transform: FieldTransform,
  ): transform is RegexTransform {
    return (
      (transform.getBy ?? 'regex') === 'regex' &&
      !isUndefined((transform as RegexTransform).regex)
    );
  }

  async execute(input: string | string[]): Promise<string | string[]> {
    const { regex } = this.transform;
    const re = typeof regex === 'string' ? new RegExp(regex, 'g') : regex;
    return this.applyTransform(input, (value) => {
      if (this.transform.requireMatch && !re.test(value ?? '')) {
        return '';
      }
      return value?.replace(re, this.transform.replaceWith ?? '$0') ?? '';
    });
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return RegexTransformer.isRegexTransform(transform)
    ? new RegexTransformer(transform, options)
    : undefined;
});
