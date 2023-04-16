import { isUndefined } from 'lodash';
import { FieldTransform } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { LiteralTransform } from './transforms';

export default class LiteralTransformer extends Transformer<LiteralTransform> {
  static isLiteralTransform(
    transform: FieldTransform,
  ): transform is LiteralTransform {
    return (
      (transform.getBy ?? 'literal') === 'literal' &&
      !isUndefined((transform as LiteralTransform).literal)
    );
  }

  async execute(): Promise<string | string[]> {
    return this.transform.literal;
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return LiteralTransformer.isLiteralTransform(transform)
    ? new LiteralTransformer(transform, options)
    : undefined;
});
