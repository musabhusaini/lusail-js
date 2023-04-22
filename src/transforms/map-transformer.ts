import { isUndefined } from 'lodash';
import { FieldTransform } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { MapTransform } from './transforms';

export default class MapTransformer extends Transformer<MapTransform> {
  static isMapTransform(transform: FieldTransform): transform is MapTransform {
    return (
      ['map', 'mapping'].includes(transform.getBy ?? 'map') &&
      !isUndefined((transform as MapTransform).map)
    );
  }

  async execute(input: any | any[]): Promise<boolean> {
    return this.applyTransform(input, (value) => {
      const output = this.transform.map[value];
      if (isUndefined(output)) {
        this.options.logger.warn(
          `Value ${value} did not match any key in the map; strict = ${this.transform.strict}`,
        );
        return this.transform.strict ? null : value;
      }
      return output;
    });
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return MapTransformer.isMapTransform(transform)
    ? new MapTransformer(transform, options)
    : undefined;
});
