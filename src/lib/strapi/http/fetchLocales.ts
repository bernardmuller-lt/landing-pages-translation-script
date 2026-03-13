import { fetchFromStrapi } from "./client.js";

export interface StrapiLocale {
  id: number;
  code: string;
  name: string;
  isDefault: boolean;
}

/**
 * Fetches all supported locales from Strapi i18n plugin
 */
export async function fetchLocales(): Promise<string[]> {
  try {
    const locales = await fetchFromStrapi<StrapiLocale[]>("/i18n/locales");

    if (!locales || locales.length === 0) {
      console.warn("\n⚠️  No locales found in Strapi");
      return [];
    }

    return locales.map((locale) => locale.code);
  } catch (error) {
    console.error("\n❌ Error fetching locales:", error);
    throw error;
  }
}
