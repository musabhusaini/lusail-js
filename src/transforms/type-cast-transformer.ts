import { parseISO } from 'date-fns';
import { isUndefined, toNumber, toString } from 'lodash';
import { FieldTransform } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { FieldType, TypeCastTransform } from './transforms';

export default class TypeCastTransformer<I = any, O = any> extends Transformer<
  TypeCastTransform,
  I,
  O
> {
  static isTypeCastTransform(
    transform: FieldTransform,
  ): transform is TypeCastTransform {
    return (
      (transform.getBy === 'cast' ?? 'cast') &&
      !isUndefined((transform as TypeCastTransform).castTo)
    );
  }

  async execute(input: I): Promise<O> {
    const { castTo: valueType } = this.transform;
    return this.applyTransform(input, (value) =>
      this.castValue(value, valueType),
    );
  }

  protected castValue(value: any, type: FieldType): any {
    switch (type) {
      case 'string':
        return toString(value);
      case 'number':
        return toNumber(value);
      case 'boolean':
        return value?.toLowerCase() === 'true';
      case 'date':
        return parseISO(value);
      default:
        throw new Error(`Unsupported value type: ${type}`);
    }
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return TypeCastTransformer.isTypeCastTransform(transform)
    ? new TypeCastTransformer(transform, options)
    : undefined;
});
