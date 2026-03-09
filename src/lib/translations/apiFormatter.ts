import type { PageData } from '../strapi/http/fetchPages.js';
import { config } from '../../config.js';

/**
 * API payload structure (matches post-data.json format)
 */
export interface APIPayload {
  data: {
    environment: string;
    identifier: string;
    slug: string;
    locale: string;
    seo: PageData['seo'];
    events: PageData['events'];
    sections: PageData['sections'];
  };
}

/**
 * Formats page data into API-ready structure
 * Wraps data in outer "data" object and flattens top-level fields
 *
 * @param pageData - The page data to format
 * @param locale - Target locale (e.g., "de", "fr", "es")
 * @returns API-ready payload matching post-data.json structure
 */
export function formatForAPI(pageData: PageData, locale: string): APIPayload {
  return {
    data: {
      environment: config.environment,
      identifier: config.identifier,
      slug: pageData.slug,
      locale: locale, // Target locale
      seo: pageData.seo,
      events: pageData.events,
      sections: pageData.sections,
    },
  };
}
