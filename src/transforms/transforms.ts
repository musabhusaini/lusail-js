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
 * Represents a transform that retrieves elements matching the given selector.
 */
export interface CssSelectorTransform extends FieldTransform<'cssSelector'> {
  /**
   * The CSS selector to match elements.
   */
  cssSelector: string;
}

/**
 * Represents a transform that retrieves the text content of an element.
 */
export interface ElementTextTransform extends FieldTransform<'text'> {
  getBy: 'text';
}

/**
 * Represents a transform that retrieves the value of the specified attribute of an
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
 * Represents a transform that casts the value to the specified field type.
 */
export interface TypeCastTransform extends FieldTransform<'cast'> {
  /**
   * The field type to cast the value to.
   */
  castTo: FieldType;
}

/**
 * Represents a transform that casts a value to a date with an optional format and locale.
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
 * Represents a transform that applies a regular expression pattern and optional replacement to the
 * input value.
 */
export interface RegexTransform extends FieldTransform<'regex'> {
  /**
   * The regular expression pattern to apply. Uses [JavaScript regular expressions](
   *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
   * ).
   */
  regex: string | RegExp;
  /**
   * The string to replace matched patterns with. Uses [JavaScript substitution syntax](
   *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
   * ).
   */
  replaceWith?: string;
  /**
   * Whether to require the regular expression to match the input pattern. If this is set to `true`,
   * and the input string value does not match the pattern, the output will be an empty string.
   */
  requireMatch?: boolean;
}

/**
 * Represents a transform that extracts multiple fields from a value.
 */
export interface ExtractFieldsTransform extends FieldTransform<'fields'> {
  /**
   * The LusailTemplate for extracting fields.
   */
  fields: LusailTemplate;
}

/**
 * Represents a transform that follows links and applies a LusailTemplate to the linked
 * content.
 */
export interface FollowLinksTransform
  extends FieldTransform<'followingLinks' | 'followLinks' | 'links'> {
  /**
   * The LusailTemplate to apply to the linked content.
   */
  followLinks: LusailTemplate;
}

/**
 * Represents a transform that transforms the input to a fixed literal value.
 */
export interface LiteralTransform extends FieldTransform<'literal'> {
  /**
   * The fixed literal value.
   */
  literal: any;
}

/**
 * Represents a transform that hoists nested fields to the top level of the result.
 */
export interface HoistTransform extends FieldTransform<'hoist' | 'hoisting'> {
  getBy: 'hoist' | 'hoisting';
}
