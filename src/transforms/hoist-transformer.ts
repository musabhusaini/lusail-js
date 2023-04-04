import { FieldTransform, LusailResult } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { HoistTransform } from './transforms';

export default class HoistTransformer extends Transformer<HoistTransform> {
  static isHoistTransform(
    transform: FieldTransform,
  ): transform is HoistTransform {
    return ['hoist', 'hoisting'].includes(transform.getBy ?? '');
  }

  async execute(
    input: LusailResult,
    parentResult: LusailResult,
  ): Promise<undefined> {
    Object.assign(parentResult, input);
    return undefined;
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return HoistTransformer.isHoistTransform(transform)
    ? new HoistTransformer(transform, options)
    : undefined;
});
