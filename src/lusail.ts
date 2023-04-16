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

/**
 * Provides methods to parse and extract information from HTML content based on a given template.
 */
export class Lusail {
  /**
   * Registers a custom transform factory.
   *
   * @param factory - The transformer factory to register.
   */
  static registerTransform(factory: TransformerFactory) {
    TransformerFactories.instance.registerTransform(factory);
  }

  /**
   * Creates a Lusail instance from a YAML template.
   *
   * @param yamlTemplate - The YAML template string.
   * @param options - Optional `LusailOptions` to configure the behavior of the parser.
   * @returns A new Lusail instance.
   */
  static fromYaml(yamlTemplate: string, options?: LusailOptions): Lusail {
    const template: LusailTemplate = parseYaml(yamlTemplate);
    return new Lusail(template, options);
  }

  private options: Required<LusailOptions>;

  /**
   * Constructs a new Lusail instance.
   *
   * @param template - The Lusail template object.
   * @param options - Optional `LusailOptions` to configure the behavior of the parser.
   */
  constructor(private template: LusailTemplate, options?: LusailOptions) {
    this.options = {
      logger: console,
      htmlDeserializer: this.defaultHtmlDeserializer,
      referenceDate: new Date(),
      fetchFunction: this.defaultFetchFunction,
      ...(options ?? {}),
    };
  }

  /**
   * Parses and extracts information from an HTML string.
   *
   * @param html - The HTML string to parse.
   * @returns A promise that resolves to a `LusailResult` object.
   */
  async parseFromString(html: string): Promise<LusailResult> {
    const dom = this.options.htmlDeserializer(html);
    return await this.parseFromElement(dom);
  }

  /**
   * Fetches an HTML page from the provided URL and extracts information.
   *
   * @param url - The URL of the HTML page to fetch and parse.
   * @returns A promise that resolves to a `LusailResult` object.
   */
  async parseFromUrl(url: string): Promise<LusailResult> {
    const html = await this.options.fetchFunction(url);
    return await this.parseFromString(html);
  }

  /**
   * Fetches an HTML page from the provided URL and extracts information.
   *
   * @param url - The URL of the HTML page to fetch and parse.
   * @returns A promise that resolves to a `LusailResult` object.
   */
  async parseFromElement(element: Element): Promise<LusailResult> {
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
      } catch (error: any) {
        this.options.logger.warn(
          `Error in transformation pipeline for ${key}: ${error}\n${error.stack}`,
        );
      }
    }

    return result;
  }

  private async defaultFetchFunction(url: string): Promise<string> {
    const response = await fetch(url);
    return await response.text();
  }

  private defaultHtmlDeserializer(html: string): Element {
    return new JSDOM(html).window.document.documentElement;
  }
}
