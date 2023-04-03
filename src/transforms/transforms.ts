import { FieldTransform, LusailTemplate } from '../schema';

export interface SingleTransform extends FieldTransform<'single'> {
  index?: number;
}

export interface RangeTransform extends FieldTransform<'range'> {
  start?: number;
  end?: number;
}

export interface CssSelectorTransform extends FieldTransform<'cssSelector'> {
  cssSelector: string;
}

export interface ElementTextTransform extends FieldTransform<'text'> {
  getBy: 'text';
}

export interface AttributeTransform extends FieldTransform<'attribute'> {
  attribute: string;
}

export type FieldType = 'string' | 'number' | 'boolean' | 'date';

export interface TypeCastTransform extends FieldTransform<'cast'> {
  castTo: FieldType;
}

export interface DateTransform extends TypeCastTransform {
  castTo: 'date';
  format?: string;
  locale?: string;
}

export interface RegexTransform extends FieldTransform<'regex'> {
  regex: string | RegExp;
  replaceWith?: string;
}

export interface ExtractFieldsTransform extends FieldTransform<'fields'> {
  fields: LusailTemplate;
  hoist?: boolean;
}

export interface FollowLinksTransform
  extends FieldTransform<'followingLinks' | 'followLinks' | 'links'> {
  followLinks: LusailTemplate;
  hoist?: boolean;
}

export interface LiteralTransform extends FieldTransform<'literal'> {
  literal: any;
}
