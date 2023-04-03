export type LusailTemplate = Record<string, FieldTransform[]>;
export type LusailResult = Record<string, any>;

export interface FieldTransform<T extends string = string> {
  getBy?: T;
}
