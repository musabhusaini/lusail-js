import { isUndefined } from 'lodash';
import { FieldTransform } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { RangeTransform } from './transforms';

export default class RangeTransformer extends Transformer<
  RangeTransform,
  any[],
  any[]
> {
  static isRangeTransform(
    transform: FieldTransform,
  ): transform is RangeTransform {
    return (
      transform.getBy === 'range' ||
      (!transform.getBy &&
        (!isUndefined((transform as RangeTransform).start) ||
          !isUndefined((transform as RangeTransform).end)))
    );
  }

  async execute(input: any[]): Promise<any[] | undefined> {
    const { start = undefined, end = undefined } = this.transform;
    return input?.slice(start, end);
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return RangeTransformer.isRangeTransform(transform)
    ? new RangeTransformer(transform, options)
    : undefined;
});
