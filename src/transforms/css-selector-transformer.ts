import { isArray, isUndefined } from 'lodash';
import { FieldTransform } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { CssSelectorTransform } from './transforms';

export default class CssSelectorTransformer extends Transformer<
  CssSelectorTransform,
  Element | Element[],
  Element | Element[]
> {
  static isCssSelectorTransform(
    transform: FieldTransform,
  ): transform is CssSelectorTransform {
    return (
      (transform.getBy ?? 'cssSelector') === 'cssSelector' &&
      !isUndefined((transform as CssSelectorTransform).cssSelector)
    );
  }

  async execute(input: Element | Element[]): Promise<Element | Element[]> {
    const { cssSelector: selector } = this.transform;
    if (!isArray(input)) {
      return Array.from(input?.querySelectorAll(selector));
    }

    const results: Element[] = [];
    input.forEach((element) => {
      const selectedElements = Array.from(element.querySelectorAll(selector));
      results.push(...selectedElements);
    });

    return results;
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return CssSelectorTransformer.isCssSelectorTransform(transform)
    ? new CssSelectorTransformer(transform, options)
    : undefined;
});
