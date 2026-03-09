import { resolve } from 'path';

/**
 * Application configuration constants
 */
export const config = {
  // Strapi identifiers
  identifier: 'ai-chat',

  // Locale to fetch (English only as per requirements)
  locale: 'en',

  // Environment to fetch from
  environment: 'production',

  // Known page slugs from chatai-www project
  pagesSlugs: {
    home: 'home',
    onboarding: 'onboarding',
    support: 'support',
  },

  // Output directory for JSON files (relative to project root)
  outputDir: resolve(process.cwd(), 'output'),

  // Output directory for translation files
  translationsOutputDir: resolve(process.cwd(), 'output/translations'),
} as const;
