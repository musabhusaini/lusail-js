import { isUndefined } from 'lodash';
import { FieldTransform } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { AttributeTransform } from './transforms';

export default class AttributeTransformer extends Transformer<
  AttributeTransform,
  Element | Element[],
  string | string[]
> {
  static isAttributeTransform(
    transform: FieldTransform,
  ): transform is AttributeTransform {
    return (
      (transform.getBy ?? 'attribute') === 'attribute' &&
      !isUndefined((transform as AttributeTransform).attribute)
    );
  }

  async execute(input: Element | Element[]): Promise<string | string[]> {
    const { attribute } = this.transform;
    return this.applyTransform(
      input,
      (input) => input?.getAttribute(attribute) ?? '',
    );
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return AttributeTransformer.isAttributeTransform(transform)
    ? new AttributeTransformer(transform, options)
    : undefined;
});
