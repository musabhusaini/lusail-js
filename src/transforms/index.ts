export * from './attribute-transformer';
export * from './css-selector-transformer';
export * from './date-transformer';
export * from './element-text-transformer';
export * from './existence-transformer';
export * from './extract-fields-transformer';
export * from './follow-links-transformer';
export * from './hoist-transformer';
export * from './literal-transformer';
export * from './map-transformer';
export * from './range-transformer';
export * from './regex-transformer';
export * from './single-transformer';
export * from './transforms';
export * from './type-cast-transformer';

export function registerAll() {
  // Actual registration of transforms takes place inside each transform file, but importing this
  // function will ensure that they are called.
}
