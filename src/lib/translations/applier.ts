import type { PageData } from '../strapi/http/fetchPages.js';

/**
 * Applies translated key-value pairs to source page data
 *
 * @param sourceData - Original page data (typically English)
 * @param translations - Key-value pairs with path: translated text
 * @returns Modified page data with translations applied
 */
export function applyTranslations(
  sourceData: PageData,
  translations: Record<string, string>
): PageData {
  // Deep clone to avoid mutating source
  const result = JSON.parse(JSON.stringify(sourceData)) as PageData;

  let appliedCount = 0;
  let failedPaths: string[] = [];

  // Apply each translation
  for (const [path, translatedValue] of Object.entries(translations)) {
    try {
      setValueAtPath(result, path, translatedValue);
      appliedCount++;
    } catch (error) {
      failedPaths.push(path);
      console.warn(`Warning: Could not apply translation at path: ${path}`);
    }
  }

  if (failedPaths.length > 0) {
    console.warn(`\n⚠️  Failed to apply ${failedPaths.length} translation(s):`);
    failedPaths.forEach((path) => console.warn(`  - ${path}`));
  }

  return result;
}

/**
 * Sets a value at a JSON path (e.g., "sections[0].title")
 *
 * @param obj - The object to modify
 * @param path - JSON path string (e.g., "seo.title", "sections[0].items[1].text")
 * @param value - The value to set
 */
function setValueAtPath(obj: any, path: string, value: string): void {
  const segments = parsePath(path);

  if (segments.length === 0) {
    throw new Error(`Invalid path: ${path}`);
  }

  // Navigate to parent
  let current = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];

    if (current[segment] === undefined) {
      throw new Error(`Path does not exist: ${path} (failed at ${segment})`);
    }

    current = current[segment];
  }

  // Set final value
  const lastSegment = segments[segments.length - 1];
  if (current[lastSegment] === undefined) {
    throw new Error(`Path does not exist: ${path} (final segment ${lastSegment})`);
  }

  current[lastSegment] = value;
}

/**
 * Parses a JSON path string into segments
 *
 * Examples:
 *   "seo.title" → ["seo", "title"]
 *   "sections[0].title" → ["sections", "0", "title"]
 *   "sections[1].items[3].description" → ["sections", "1", "items", "3", "description"]
 *
 * @param path - The path string to parse
 * @returns Array of path segments
 */
function parsePath(path: string): string[] {
  const segments: string[] = [];

  // Replace array notation with dots: "sections[0]" → "sections.0"
  const normalized = path.replace(/\[(\d+)\]/g, '.$1');

  // Split by dots
  const parts = normalized.split('.');

  for (const part of parts) {
    if (part) {
      segments.push(part);
    }
  }

  return segments;
}
