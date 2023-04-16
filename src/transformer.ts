import { isArray } from 'lodash';
import { LusailOptions } from './lusail';
import { FieldTransform, LusailResult } from './schema';

export abstract class Transformer<
  T extends FieldTransform = FieldTransform,
  I = any,
  O = any,
> {
  constructor(
    protected transform: T,
    protected options: Required<LusailOptions>,
  ) {}

  abstract execute(
    input: I,
    parentResult: LusailResult,
  ): Promise<O | undefined>;

  protected applyTransform<V, U>(
    input: V | V[],
    transform: (input?: V) => U,
  ): U | U[] {
    return isArray(input)
      ? input.map((value) => transform(value))
      : transform(input);
  }
}
