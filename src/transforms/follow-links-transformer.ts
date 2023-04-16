import { isArray, isUndefined } from 'lodash';
import { Lusail } from '../lusail';
import { FieldTransform, LusailResult } from '../schema';
import { Transformer } from '../transformer';
import { TransformerFactories } from '../transformer-factories';
import { FollowLinksTransform } from './transforms';

export default class FollowLinksTransformer extends Transformer<
  FollowLinksTransform,
  string | string[],
  LusailResult | LusailResult[]
> {
  static isFollowLinksTransform(
    transform: FieldTransform,
  ): transform is FollowLinksTransform {
    return (
      ['followingLinks', 'followLinks', 'links'].includes(
        transform.getBy ?? 'links',
      ) && !isUndefined((transform as FollowLinksTransform).followLinks)
    );
  }

  async execute(
    input: string | string[],
  ): Promise<LusailResult | LusailResult[] | undefined> {
    if (!input) {
      return undefined;
    }

    const { followLinks } = this.transform;
    const lusail = new Lusail(followLinks, this.options);

    return isArray(input)
      ? this.transformElementArray(lusail, input)
      : this.transformElement(lusail, input);
  }

  private async transformElement(
    lusail: Lusail,
    url: string,
  ): Promise<LusailResult | undefined> {
    try {
      return lusail.parseFromUrl(url);
    } catch (error: any) {
      this.options.logger.warn(
        `Warning: Failed to fetch url ${url}: ${error}\n${error?.stack}`,
      );
      return undefined;
    }
  }

  private async transformElementArray(
    lusail: Lusail,
    urls: string[],
  ): Promise<LusailResult[]> {
    const result: LusailResult[] = [];
    for (const url of urls) {
      const singleResult = await this.transformElement(lusail, url);
      if (singleResult) {
        result.push(singleResult);
      }
    }
    return result;
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return FollowLinksTransformer.isFollowLinksTransform(transform)
    ? new FollowLinksTransformer(transform, options)
    : undefined;
});
