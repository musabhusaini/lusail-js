import { TransformerFactories } from '@lusail/transformer-factories';
import { isArray, isUndefined } from 'lodash';
import { Lusail } from '../lusail';
import { FieldTransform, LusailResult } from '../schema';
import { Transformer } from '../transformer';
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
      ? Promise.all(input.map((url) => this.transformElement(lusail, url)))
      : this.transformElement(lusail, input);
  }

  private async transformElement(
    lusail: Lusail,
    url: string,
  ): Promise<LusailResult | undefined> {
    try {
      return lusail.parseFromUrl(url);
    } catch (error) {
      this.options?.logger?.warn(
        'Warning: Failed to fetch url %s: %s',
        url,
        error,
      );
      return undefined;
    }
  }
}

TransformerFactories.instance.registerTransform((transform, options) => {
  return FollowLinksTransformer.isFollowLinksTransform(transform)
    ? new FollowLinksTransformer(transform, options)
    : undefined;
});
