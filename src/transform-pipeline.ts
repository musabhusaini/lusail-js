import { LusailOptions } from './lusail';
import { FieldTransform, LusailResult } from './schema';
import { TransformerFactories } from './transformer-factories';

export class TransformPipeline {
  constructor(
    private element: Element,
    private pipeline: FieldTransform[],
    private options: Required<LusailOptions>,
  ) {}

  async execute(parentResult: LusailResult = {}): Promise<any> {
    const pipeline = this.pipeline || [];
    let currentValues: any[] = [this.element];

    for (const transform of pipeline) {
      const transformer = TransformerFactories.instance.create(
        transform,
        this.options,
      );
      try {
        currentValues = await transformer.execute(currentValues, parentResult);
      } catch (error: any) {
        this.options.logger.warn(
          `Error while performing transformation ${JSON.stringify(
            transform,
          )}: ${error}\n${error?.stack}`,
        );
        throw error;
      }
    }

    return currentValues;
  }
}
