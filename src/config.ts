import { resolve } from "path";

/**
 * Application configuration constants
 */
export const config = {
  // Strapi identifiers
  identifier: "ai-chat",

  // Locale to fetch (English only as per requirements)
  locale: "en",

  // Environment to fetch from
  environment: "production",

  // Known page slugs from chatai-www project
  pagesSlugs: {
    home: "home",
    onboarding: "onboarding",
    support: "support",
  },

  // Output directory for JSON files (relative to project root)
  outputDir: resolve(process.cwd(), "output"),

  // Output directory for translation files
  translationsOutputDir: resolve(process.cwd(), "output/translations"),

  // Output directory for prepared (API-ready) files
  preparedOutputDir: resolve(process.cwd(), "output/prepared"),
} as const;

/**
 * Target locales for translation.
 * Keys are Strapi locale codes; values are human-readable names.
 */
export const TARGET_LOCALES: Record<string, string> = {
  de_de: "German",
  es_419: "Spanish (Latin America)",
  ko_kr: "Korean",
  pt_br: "Portuguese (Brazil)",
  fr_fr: "French",
  nl_nl: "Dutch",
  it_it: "Italian",
  ja_jp: "Japanese",
  pl_pl: "Polish",
  da_dk: "Danish",
  no_no: "Norwegian",
  zh_cn: "Chinese (Simplified)",
};
