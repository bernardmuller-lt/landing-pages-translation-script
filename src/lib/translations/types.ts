/**
 * Defines which fields from Strapi types should be extracted for translation
 */

/**
 * List of field names that contain translatable text
 * Used to identify which string fields should be extracted
 */
export const TRANSLATABLE_FIELD_NAMES = new Set([
  'title',
  'description',
  'text',
  'content',
  'heading',
  'subtitle',
  'author',
  'alt',
  'aria_label',
  'pricePerDay',
  'duration',
  'fullPrice',
]);

/**
 * Fields that should be excluded from translation
 */
export const EXCLUDED_FIELD_NAMES = new Set([
  // Technical/System fields
  'id',
  'documentId',
  '__component',
  'fe_component',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'locale',
  'environment',
  'slug',
  'identifier',

  // Resource identifiers
  'href',
  'src',
  'url',
  'icon',
  'hash',
  'ext',
  'mime',
  'provider',
  'provider_metadata',
  'path',
  'name',

  // Tracking/Analytics
  'viewPageEventName',
  'landing_folder',
  'landing_parameter',

  // Media metadata
  'width',
  'height',
  'size',
  'sizeInBytes',
  'previewUrl',
  'alternativeText', // We use 'alt' instead
  'caption',

  // Booleans/flags
  'isPopular',
  'muted',
  'loop',
  'autoplay',
  'playsinline',
  'wide',
  'client',
  'title1Highlight',
  'title2Highlight',
  'isContinue',

  // Numbers
  'rating',
]);

/**
 * Check if a field name is translatable
 */
export function isTranslatableField(fieldName: string, value: any): boolean {
  // Must be a string
  if (typeof value !== 'string') {
    return false;
  }

  // Must not be empty
  if (!value.trim()) {
    return false;
  }

  // Must not be in excluded list
  if (EXCLUDED_FIELD_NAMES.has(fieldName)) {
    return false;
  }

  // Must be in translatable list
  return TRANSLATABLE_FIELD_NAMES.has(fieldName);
}
