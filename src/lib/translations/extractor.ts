import type { PageData } from '../strapi/http/fetchPages.js';
import { buildPath, buildArrayPath } from './pathBuilder.js';
import { isTranslatableField } from './types.js';

/**
 * Translation extraction result
 */
export interface ExtractionResult {
  translations: Record<string, string>;
  stats: {
    totalStrings: number;
    seoStrings: number;
    sectionCounts: Record<string, number>;
  };
}

/**
 * Recursively extracts translatable strings from an object
 */
function extractFromObject(
  obj: any,
  basePath: string,
  translations: Record<string, string>
): number {
  let count = 0;

  if (!obj || typeof obj !== 'object') {
    return count;
  }

  for (const [key, value] of Object.entries(obj)) {
    // Check if this field is translatable
    if (isTranslatableField(key, value)) {
      const path = buildPath(basePath, key);
      translations[path] = value as string;
      count++;
    }
    // Recursively process nested objects
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nestedPath = buildPath(basePath, key);
      count += extractFromObject(value, nestedPath, translations);
    }
    // Recursively process arrays
    else if (Array.isArray(value)) {
      count += extractFromArray(value, basePath, key, translations);
    }
  }

  return count;
}

/**
 * Extracts translatable strings from an array
 */
function extractFromArray(
  arr: any[],
  basePath: string,
  arrayField: string,
  translations: Record<string, string>
): number {
  let count = 0;

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const itemPath = buildArrayPath(basePath, arrayField, i);

    if (item && typeof item === 'object') {
      count += extractFromObject(item, itemPath, translations);
    }
  }

  return count;
}

/**
 * Extracts all translatable strings from page data
 */
export function extractTranslations(pageData: PageData): ExtractionResult {
  const translations: Record<string, string> = {};
  const stats = {
    totalStrings: 0,
    seoStrings: 0,
    sectionCounts: {} as Record<string, number>,
  };

  // Extract from SEO
  if (pageData.seo) {
    stats.seoStrings = extractFromObject(pageData.seo, 'seo', translations);
    stats.totalStrings += stats.seoStrings;
  }

  // Extract from sections
  if (pageData.sections && Array.isArray(pageData.sections)) {
    pageData.sections.forEach((section, index) => {
      const sectionPath = `sections[${index}]`;
      // Use fe_component if available, otherwise extract from __component
      const sectionType = ('fe_component' in section && section.fe_component)
        ? section.fe_component
        : section.__component || 'Unknown';

      const count = extractFromObject(section, sectionPath, translations);

      // Track per-section type stats
      if (!stats.sectionCounts[sectionType]) {
        stats.sectionCounts[sectionType] = 0;
      }
      stats.sectionCounts[sectionType] += count;
      stats.totalStrings += count;
    });
  }

  return {
    translations,
    stats,
  };
}

/**
 * Sorts translation keys alphabetically
 */
export function sortTranslations(translations: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(translations).sort();

  for (const key of keys) {
    sorted[key] = translations[key];
  }

  return sorted;
}
