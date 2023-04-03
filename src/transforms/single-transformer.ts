import { isUndefined } from 'lodash';
import { FieldTransform } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { SingleTransform } from './transforms';

export default class SingleTransformer extends Transformer<
  SingleTransform,
  any[],
  any
> {
  static isSingleTransform(
    transform: FieldTransform,
  ): transform is SingleTransform {
    return (
      transform.getBy === 'single' ||
      (!transform.getBy && !isUndefined((transform as SingleTransform).index))
    );
  }

  async execute(input: any[]): Promise<any> {
    const { index = 0 } = this.transform;
    return input[index];
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return SingleTransformer.isSingleTransform(transform)
    ? new SingleTransformer(transform, options)
    : undefined;
});
