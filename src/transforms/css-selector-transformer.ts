import { isArray, isUndefined } from 'lodash';
import { FieldTransform } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { CssSelectorTransform } from './transforms';

export default class CssSelectorTransformer extends Transformer<
  CssSelectorTransform,
  Element | Element[],
  Element[]
> {
  static isCssSelectorTransform(
    transform: FieldTransform,
  ): transform is CssSelectorTransform {
    return (
      (transform.getBy ?? 'cssSelector') === 'cssSelector' &&
      !isUndefined((transform as CssSelectorTransform).cssSelector)
    );
  }

  async execute(input: Element | Element[]): Promise<Element[]> {
    if (!isArray(input)) {
      return this.transformElement(input);
    }

    const results: Element[] = [];
    input.forEach((element) => {
      const selectedElements = this.transformElement(element);
      results.push(...selectedElements);
    });

    return results;
  }

  private transformElement(element: Element): Element[] {
    return Array.from(
      element?.querySelectorAll?.(this.transform.cssSelector) ?? [],
    );
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return CssSelectorTransformer.isCssSelectorTransform(transform)
    ? new CssSelectorTransformer(transform, options)
    : undefined;
});
