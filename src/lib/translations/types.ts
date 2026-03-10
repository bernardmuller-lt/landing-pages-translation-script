export const TRANSLATABLE_FIELD_NAMES = new Set([
  "title",
  "description",
  "text",
  "content",
  "heading",
  "subtitle",
  "author",
  "alt",
  "aria_label",
  "pricePerDay",
  "duration",
  "fullPrice",
]);

export const EXCLUDED_FIELD_NAMES = new Set([
  // Technical/System fields
  "id",
  "documentId",
  "__component",
  "fe_component",
  "createdAt",
  "updatedAt",
  "publishedAt",
  "locale",
  "environment",
  "slug",
  "identifier",

  // Resource identifiers
  "href",
  "src",
  "url",
  "icon",
  "hash",
  "ext",
  "mime",
  "provider",
  "provider_metadata",
  "path",
  "name",

  // Tracking/Analytics
  "viewPageEventName",
  "landing_folder",
  "landing_parameter",

  // Media metadata
  "width",
  "height",
  "size",
  "sizeInBytes",
  "previewUrl",
  "alternativeText", // We use 'alt' instead
  "caption",

  // Booleans/flags
  "isPopular",
  "muted",
  "loop",
  "autoplay",
  "playsinline",
  "wide",
  "client",
  "title1Highlight",
  "title2Highlight",
  "isContinue",

  // Numbers
  "rating",
]);

export function isTranslatableField(fieldName: string, value: any): boolean {
  if (typeof value !== "string") {
    return false;
  }

  if (!value.trim()) {
    return false;
  }

  if (EXCLUDED_FIELD_NAMES.has(fieldName)) {
    return false;
  }

  return TRANSLATABLE_FIELD_NAMES.has(fieldName);
}
