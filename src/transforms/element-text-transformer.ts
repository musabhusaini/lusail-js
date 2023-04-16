import { FieldTransform } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { ElementTextTransform } from './transforms';

export default class ElementTextTransformer extends Transformer<
  ElementTextTransform,
  Element | Element[],
  string | string[]
> {
  static isElementTextTransform(
    transform: FieldTransform,
  ): transform is ElementTextTransform {
    return transform.getBy === 'text';
  }

  async execute(input: Element | Element[]): Promise<string | string[]> {
    return this.applyTransform(
      input,
      (element) => element?.textContent?.trim() ?? '',
    );
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return ElementTextTransformer.isElementTextTransform(transform)
    ? new ElementTextTransformer(transform, options)
    : undefined;
});
