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

    const resultPromise = isArray(input)
      ? this.transformElementArray(lusail, input)
      : this.transformElement(lusail, input);
    return await resultPromise;
  }

  private async transformElement(
    lusail: Lusail,
    element: Element,
  ): Promise<LusailResult | undefined> {
    try {
      return await lusail.parseFromElement(element);
    } catch (error: any) {
      this.options.logger.warn(
        `Failed to extract fields from element: ${error}\n${error?.stack}`,
      );
      return undefined;
    }
  }

  private async transformElementArray(
    lusail: Lusail,
    elements: Element[],
  ): Promise<LusailResult[]> {
    const result: LusailResult[] = [];
    for (const element of elements) {
      const singleResult = await this.transformElement(lusail, element);
      if (singleResult) {
        result.push(singleResult);
      }
    }
    return result;
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return ExtractFieldsTransformer.isExtractFieldsTransform(transform)
    ? new ExtractFieldsTransformer(transform, options)
    : undefined;
});
