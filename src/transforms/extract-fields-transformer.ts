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
    parentResult: LusailResult,
  ): Promise<LusailResult | LusailResult[] | undefined> {
    if (!input) {
      return undefined;
    }

    const { fields, hoist } = this.transform;
    const lusail = new Lusail(fields, this.options);

    const promisedResult = isArray(input)
      ? Promise.all(
          input?.map((element) =>
            this.transformElement(lusail, element, parentResult, hoist),
          ),
        )
      : this.transformElement(lusail, input, parentResult, hoist);
    const result = await promisedResult;
    return hoist ? undefined : result;
  }

  private async transformElement(
    lusail: Lusail,
    element: Element,
    parentResult: LusailResult,
    hoist?: boolean,
  ): Promise<LusailResult | undefined> {
    try {
      const result = await lusail.parseFromElement(element);
      if (hoist) {
        return Object.assign(parentResult, result);
      }
      return result;
    } catch (error) {
      console.warn('Warning: Failed to extract fields from element: %s', error);
      return undefined;
    }
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return ExtractFieldsTransformer.isExtractFieldsTransform(transform)
    ? new ExtractFieldsTransformer(transform, options)
    : undefined;
});
