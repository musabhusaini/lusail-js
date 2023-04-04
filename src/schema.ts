/**
 * Represents a mapping of field names to their respective arrays of field transformation objects.
 */
export type LusailTemplate = Record<string, FieldTransform[]>;

/**
 * Represents a mapping of field names to their extracted values.
 */
export type LusailResult = Record<string, any>;

/**
 * Defines a field transformation object, which includes a "getBy" property to specify the method
 * of extraction.
 *
 * @template T - A generic type parameter representing the getBy method type.
 */
export interface FieldTransform<T extends string = string> {
  /**
   * The key used to determine the type of transformation to apply to a field.
   */
  getBy?: T;
}
