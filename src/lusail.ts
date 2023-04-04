import { JSDOM } from 'jsdom';
import { parse as parseYaml } from 'yaml';
import { LusailOptions } from './lusail-options';
import { LusailResult, LusailTemplate } from './schema';
import { TransformPipeline } from './transform-pipeline';
import {
  TransformerFactories,
  TransformerFactory,
} from './transformer-factories';
export * from './lusail-options';
export { TransformerFactory as TransformFactory };

export class Lusail {
  static registerTransform(factory: TransformerFactory) {
    TransformerFactories.instance.registerTransform(factory);
  }

  static fromYaml(yamlTemplate: string, options?: LusailOptions): Lusail {
    const template: LusailTemplate = parseYaml(yamlTemplate);
    return new Lusail(template, options);
  }

  private options: LusailOptions;

  constructor(private template: LusailTemplate, options?: LusailOptions) {
    this.options = {
      logger: console,
      ...(options ?? {}),
    };
  }

  async parseFromString(html: string): Promise<LusailResult> {
    const dom = new JSDOM(html);
    return this.parseFromElement(dom);
  }

  async parseFromUrl(url: string): Promise<LusailResult> {
    if (!this.options?.fetchFunction) {
      throw new Error('fetchFunction is not defined');
    }

    const html = await this.options?.fetchFunction(url);
    return this.parseFromString(html);
  }

  async parseFromElement(element: JSDOM | Element): Promise<LusailResult> {
    const result: LusailResult = {};

    for (const key in this.template) {
      const fieldTemplate = this.template[key];
      const pipeline = new TransformPipeline(
        element,
        fieldTemplate,
        this.options,
      );
      try {
        const value = await pipeline.execute(result);
        if (value !== undefined) {
          result[key] = value;
        }
      } catch (error) {
        this.options.logger?.warn(
          'Warning: Error in transformation pipeline for %s: %s',
          key,
          error,
        );
      }
    }

    return result;
  }
}
