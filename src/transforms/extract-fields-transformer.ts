import { isArray, isUndefined } from 'lodash';
import { Lusail } from '../lusail';
import { FieldTransform, LusailResult } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { ExtractFieldsTransform } from './transforms';

export default class ExtractFieldsTransformer extends Transformer<
  ExtractFieldsTransform,
  Element | Element[],
  LusailResult | LusailResult[]
> {
  static isExtractFieldsTransform(
    transform: FieldTransform,
  ): transform is ExtractFieldsTransform {
    return (
      (transform.getBy ?? 'fields') === 'fields' &&
      !isUndefined((transform as ExtractFieldsTransform).fields)
    );
  }

  async execute(
    input: Element | Element[],
  ): Promise<LusailResult | LusailResult[] | undefined> {
    if (!input) {
      return undefined;
    }

    const { fields } = this.transform;
    const lusail = new Lusail(fields, this.options);

    return isArray(input)
      ? Promise.all(
          input?.map((element) => this.transformElement(lusail, element)),
        )
      : this.transformElement(lusail, input);
  }

  private async transformElement(
    lusail: Lusail,
    element: Element,
  ): Promise<LusailResult | undefined> {
    try {
      return lusail.parseFromElement(element);
    } catch (error) {
      this.options?.logger?.warn(
        'Warning: Failed to extract fields from element: %s',
        error,
      );
      return undefined;
    }
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return ExtractFieldsTransformer.isExtractFieldsTransform(transform)
    ? new ExtractFieldsTransformer(transform, options)
    : undefined;
});
