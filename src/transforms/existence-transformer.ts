import { identity, isArray, isUndefined } from 'lodash';
import { FieldTransform } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { ExistenceTransform } from './transforms';

export default class ExistenceTransformer extends Transformer<ExistenceTransform> {
  static isExistenceTransform(
    transform: FieldTransform,
  ): transform is ExistenceTransform {
    return (
      ['existence', 'exists'].includes(transform.getBy ?? 'exists') &&
      !isUndefined((transform as ExistenceTransform).exists)
    );
  }

  async execute(input: any | any[]): Promise<boolean> {
    const exists = isArray(input) ? input.some(identity) : !!input;
    return !!this.transform.exists === !!exists;
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return ExistenceTransformer.isExistenceTransform(transform)
    ? new ExistenceTransformer(transform, options)
    : undefined;
});
