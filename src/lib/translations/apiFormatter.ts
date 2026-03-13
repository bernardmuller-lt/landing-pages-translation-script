import type {
  CleanPageData,
  APIPayload,
} from "../strapi/schemas/pageDataSchema.js";
import { config, LOCALE_SHORT_MAP } from "../../config.js";

/**
 * @deprecated Import APIPayload from pageDataSchema.ts instead
 */
export type { APIPayload } from "../strapi/schemas/pageDataSchema.js";

/**
 * Maps a Strapi locale code to its short display form
 */
function getLocaleDisplay(locale: string): string {
  return LOCALE_SHORT_MAP[locale] || locale;
}

export function formatForAPI(
  pageData: CleanPageData,
  locale: string,
  environment?: string,
): APIPayload {
  return {
    data: {
      environment: environment ?? config.environment,
      identifier: config.identifier,
      slug: pageData.slug,
      locale: locale, // Target locale
      locale_display: getLocaleDisplay(locale),
      seo: pageData.seo,
      events: pageData.events,
      sections: pageData.sections,
    },
  };
}
