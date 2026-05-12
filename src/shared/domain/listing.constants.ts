/**
 * Supported data types for dynamic attributes.
 * Dictates how the UI renders inputs and how the backend validates data.
 */
export const ATTRIBUTE_TYPES = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  SELECT: 'SELECT',
} as const;

/**
 * TypeScript type derived from ATTRIBUTE_TYPES const
 */
export type AttributeType = (typeof ATTRIBUTE_TYPES)[keyof typeof ATTRIBUTE_TYPES];

/**
 * Supported media formats for listing galleries.
 */
export const MEDIA_TYPES = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
} as const;

export type MediaType = (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES];
