import { JSDOM } from 'jsdom';
import { parse as parseYaml } from 'yaml';
import { LusailResult, LusailTemplate } from './schema';
import {
  TransformerFactories,
  TransformerFactory,
} from './transformer-factories';
import { TransformPipeline } from './transform-pipeline';
export { TransformerFactory as TransformFactory };

export type FetchFunction = (url: string) => Promise<string>;

export interface LusailOptions {
  fetchFunction?: FetchFunction;
  referenceDate?: Date;
}

export class Lusail {
  static registerTransform(factory: TransformerFactory) {
    TransformerFactories.instance.registerTransform(factory);
  }

  static fromYaml(yamlTemplate: string, options?: LusailOptions): Lusail {
    const template: LusailTemplate = parseYaml(yamlTemplate);
    return new Lusail(template, options);
  }

  constructor(
    private template: LusailTemplate,
    private options?: LusailOptions,
  ) {}

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
      const value = await pipeline.execute(result);
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }
}
