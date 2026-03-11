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
  environment: "test",

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
  "de": "German",
  "es": "Spanish",
  "ko-KR": "Korean (South Korea)",
  "pt-BR": "Portuguese (Brazil)",
  "fr": "French",
  "nl": "Dutch",
  "it": "Italian",
  "ja-JP": "Japanese (Japan)",
  "pl": "Polish",
  "da-DK": "Danish (Denmark)",
  "nb-NO": "Norwegian Bokmål",
};
