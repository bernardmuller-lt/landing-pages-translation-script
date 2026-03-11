import type { PageData } from "../strapi/http/fetchPages.js";
import { config } from "../../config.js";

export interface APIPayload {
  data: {
    environment: string;
    identifier: string;
    slug: string;
    locale: string;
    seo: PageData["seo"];
    events: PageData["events"];
    sections: PageData["sections"];
  };
}

export function formatForAPI(pageData: PageData, locale: string, environment?: string): APIPayload {
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
