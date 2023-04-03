import { chain } from 'lodash';
import { LusailOptions } from './lusail';
import { FieldTransform } from './schema';
import { Transformer } from './transformer';

export type TransformerFactory = (
  transform: FieldTransform,
  options?: LusailOptions,
) => Transformer | undefined;

interface RegisteredFactory {
  factory: TransformerFactory;
  precedence: number;
}

export class TransformerFactories {
  static readonly instance = new TransformerFactories();

  private readonly factories: RegisteredFactory[];

  private constructor() {
    this.factories = [];
  }

  registerTransform(factory: TransformerFactory, precedence = 0) {
    this.factories.push({ factory, precedence });
  }

  create(transform: FieldTransform, options?: LusailOptions): Transformer {
    const matches = this.factories
      .map(({ factory, precedence }) => ({
        transform: factory(transform, options),
        precedence,
      }))
      .filter(({ transform }) => !!transform);
    if (matches.length === 1 && matches[0].transform) {
      return matches[0].transform;
    } else if (matches.length > 1) {
      return chain(matches)
        .sortBy('precedence')
        .reverse()
        .map(({ transform }) => transform)
        .first()
        .value();
    }

    throw new Error('Unknown transform type: ' + transform.getBy);
  }
}
