import { FieldTransform, LusailTemplate } from '../schema';

/**
 * Represents a transform that retrieves a single element from an array by index.
 */
export interface SingleTransform extends FieldTransform<'single'> {
  /**
   * The index of the element to be retrieved. Defaults to zero.
   */
  index?: number;
}

/**
 * Represents a transform that retrieves a range of elements by start and end indexes.
 */
export interface RangeTransform extends FieldTransform<'range'> {
  /**
   * The starting index of the range. Defaults to 0.
   */
  start?: number;

  /**
   * The ending index of the range. Defaults to the length of the array.
   */
  end?: number;
}

/**
 * Represents a CSS selector transform that retrieves elements matching the given selector.
 */
export interface CssSelectorTransform extends FieldTransform<'cssSelector'> {
  /**
   * The CSS selector to match elements.
   */
  cssSelector: string;
}

/**
 * Represents an element text transform that retrieves the text content of an element.
 */
export interface ElementTextTransform extends FieldTransform<'text'> {
  getBy: 'text';
}

/**
 * Represents an attribute transform that retrieves the value of the specified attribute of an
 * element.
 */
export interface AttributeTransform extends FieldTransform<'attribute'> {
  /**
   * The name of the attribute to retrieve.
   */
  attribute: string;
}

/**
 * Represents the supported field types for type casting.
 */
export type FieldType = 'string' | 'number' | 'boolean' | 'date';

/**
 * Represents a type cast transform that casts the value to the specified field type.
 */
export interface TypeCastTransform extends FieldTransform<'cast'> {
  /**
   * The field type to cast the value to.
   */
  castTo: FieldType;
}

/**
 * Represents a date transform that casts a value to a date with an optional format and locale.
 */
export interface DateTransform extends TypeCastTransform {
  castTo: 'date';
  /**
   * The format of the date string. Can be any format supported by
   * [date-fns](https://date-fns.org/v2.29.3/docs/format) or 'timeAgo', which uses relative time
   * (e.g., '2 days ago').
   */
  format?: 'timeAgo' | string;
  /**
   * The locale to be used when parsing the date.
   */
  locale?: string;
}

/**
 * Represents a regex transform that applies a regex pattern and optional replacement to a value.
 */
export interface RegexTransform extends FieldTransform<'regex'> {
  /**
   * The regex pattern to apply.
   */
  regex: string | RegExp;
  /**
   * The string to replace matched patterns with.
   */
  replaceWith?: string;
}

/**
 * Represents an extract fields transform that extracts multiple fields from a value.
 */
export interface ExtractFieldsTransform extends FieldTransform<'fields'> {
  /**
   * The LusailTemplate for extracting fields.
   */
  fields: LusailTemplate;
  /**
   * When true, hoists fields to the parent result instead of creating a nested result.
   */
  hoist?: boolean;
}

/**
 * Represents a follow links transform that follows links and applies a LusailTemplate to the linked
 * content.
 */
export interface FollowLinksTransform
  extends FieldTransform<'followingLinks' | 'followLinks' | 'links'> {
  /**
   * The LusailTemplate to apply to the linked content.
   */
  followLinks: LusailTemplate;
  /**
   * When true, hoists fields to the parent result instead of creating a nested result.
   */
  hoist?: boolean;
}

/**
 * Represents a literal transform that transforms the input to a fixed literal value.
 */
export interface LiteralTransform extends FieldTransform<'literal'> {
  /**
   * The fixed literal value.
   */
  literal: any;
}
