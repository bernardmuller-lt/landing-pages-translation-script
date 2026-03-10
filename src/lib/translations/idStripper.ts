import type { PageData } from "../strapi/http/fetchPages.js";

/**
 * Fields to exclude from the API payload
 * These fields should not be sent when creating new locale content
 */
const EXCLUDED_FIELDS = ["wide"];

/**
 * Checks if an object appears to be a Strapi media object
 * Media objects have specific fields like hash, ext, mime, formats
 */
function isMediaObject(obj: any): boolean {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return false;
  }

  // Check for characteristic media fields
  return (
    obj.hash !== undefined ||
    obj.ext !== undefined ||
    obj.mime !== undefined ||
    obj.formats !== undefined ||
    (obj.url !== undefined && obj.provider !== undefined)
  );
}

/**
 * Recursively processes objects to:
 * - Reduce media objects to just their ID number
 * - Strip id/documentId from non-media objects
 * - Remove excluded fields like "wide"
 *
 * @param obj - The object to process
 * @param isMediaContext - Whether we're inside a media context
 * @returns The processed object
 */
function stripIdsFromObject(obj: any, isMediaContext: boolean = false): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => stripIdsFromObject(item, isMediaContext));
  }

  // Handle non-objects (primitives)
  if (typeof obj !== "object") {
    return obj;
  }

  // Check if this is an ACTUAL media object (has hash, ext, mime, etc.)
  const isMedia = isMediaObject(obj);

  // If this is a media object with an id, return just the ID number
  if (isMedia && obj.id !== undefined) {
    return obj.id;
  }

  // For non-media objects, process field by field
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip id and documentId fields for NON-media objects
    if ((key === "id" || key === "documentId") && !isMedia) {
      continue; // Skip this field
    }

    // Skip excluded fields (like "wide")
    if (EXCLUDED_FIELDS.includes(key)) {
      continue; // Skip this field
    }

    // Recursively process nested objects/arrays
    result[key] = stripIdsFromObject(value, isMediaContext);
  }

  return result;
}

/**
 * Prepares page data for API submission by:
 * - Reducing media objects to just their ID number to reference existing assets
 * - Stripping component IDs (Strapi will generate new ones)
 * - Removing excluded fields like "wide"
 *
 * @param pageData - The page data to clean
 * @returns Page data ready for POST request
 */
export function stripNonMediaIds(pageData: PageData): PageData {
  return stripIdsFromObject(pageData, false) as PageData;
}
