import { JSDOM } from 'jsdom';
import { LusailOptions } from './lusail';
import { FieldTransform, LusailResult } from './schema';
import { TransformerFactories } from './transformer-factories';

export class TransformPipeline {
  constructor(
    private element: JSDOM | Element,
    private pipeline: FieldTransform[],
    private options?: LusailOptions,
  ) {}

  async execute(parentResult: LusailResult = {}): Promise<any> {
    const pipeline = this.pipeline || [];
    let currentValues: any[] = [
      this.element instanceof JSDOM
        ? this.element.window.document.documentElement
        : this.element,
    ];

    for (const transform of pipeline) {
      const transformer = TransformerFactories.instance.create(
        transform,
        this.options,
      );
      currentValues = await transformer.execute(currentValues, parentResult);
    }

    return currentValues;
  }
}
