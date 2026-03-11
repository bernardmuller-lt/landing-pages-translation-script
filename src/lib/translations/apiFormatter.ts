import type {
  CleanPageData,
  APIPayload,
} from "../strapi/schemas/pageDataSchema.js";
import { config } from "../../config.js";

/**
 * @deprecated Import APIPayload from pageDataSchema.ts instead
 */
export type { APIPayload } from "../strapi/schemas/pageDataSchema.js";

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
      seo: pageData.seo,
      events: pageData.events,
      sections: pageData.sections,
    },
  };
}
