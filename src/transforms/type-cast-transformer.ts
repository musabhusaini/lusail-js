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
      (transform.getBy ?? 'cast') === 'cast' &&
      !isUndefined((transform as TypeCastTransform).castTo)
    );
  }

  async execute(input: I): Promise<O | undefined> {
    const { castTo: valueType } = this.transform;
    return this.applyTransform(input, (value) => {
      try {
        return this.castValue(value, valueType);
      } catch (error: any) {
        this.options.logger.warn(
          `Failed to cast value ${value} to ${valueType}: ${error}\n${error?.stack}`,
        );
        return undefined;
      }
    });
  }

  protected castValue(value: any, type: FieldType): any {
    switch (type) {
      case 'string':
        return toString(value)?.trim();
      case 'number':
        return toNumber(value?.trim?.());
      case 'boolean':
        return this.toBoolean(value);
      case 'date':
        return parseISO(value?.trim?.());
      default:
        throw new Error(`Unsupported value type: ${type}`);
    }
  }

  private toBoolean(value?: string): boolean {
    value = value?.trim?.().toLowerCase?.();
    return (
      value === 'true' ||
      value === 't' ||
      value === 'yes' ||
      value === 'y' ||
      value === '1'
    );
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return TypeCastTransformer.isTypeCastTransform(transform)
    ? new TypeCastTransformer(transform, options)
    : undefined;
});
