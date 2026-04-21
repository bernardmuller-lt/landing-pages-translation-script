import type { OnboardingPageData } from "../strapi/types/onboardingPage.js";
import { buildPath, buildArrayPath } from "./pathBuilder.js";
import { isTranslatableField } from "./types.js";

export interface ExtractionResult {
  translations: Record<string, string>;
  stats: {
    totalStrings: number;
  };
}

function extractFromObject(
  obj: any,
  basePath: string,
  translations: Record<string, string>,
): number {
  let count = 0;

  if (!obj || typeof obj !== "object") {
    return count;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (isTranslatableField(key, value)) {
      const path = buildPath(basePath, key);
      translations[path] = value as string;
      count++;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      const nestedPath = buildPath(basePath, key);
      count += extractFromObject(value, nestedPath, translations);
    } else if (Array.isArray(value)) {
      count += extractFromArray(value, basePath, key, translations);
    }
  }

  return count;
}

function extractFromArray(
  arr: any[],
  basePath: string,
  arrayField: string,
  translations: Record<string, string>,
): number {
  let count = 0;

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const itemPath = buildArrayPath(basePath, arrayField, i);

    if (item && typeof item === "object") {
      count += extractFromObject(item, itemPath, translations);
    }
  }

  return count;
}

export function extractOnboardingPageTranslations(
  data: OnboardingPageData,
): ExtractionResult {
  const translations: Record<string, string> = {};
  let totalStrings = 0;

  // Extract from SEO
  if (data.seo) {
    totalStrings += extractFromObject(data.seo, "seo", translations);
  }

  // Extract from default_slides
  if (data.default_slides && Array.isArray(data.default_slides)) {
    totalStrings += extractFromArray(
      data.default_slides,
      "",
      "default_slides",
      translations,
    );
  }

  // Extract from campaigns
  if (data.campaigns && Array.isArray(data.campaigns)) {
    for (let i = 0; i < data.campaigns.length; i++) {
      const campaign = data.campaigns[i];
      const campaignPath = `campaigns[${i}]`;

      // Extract campaign SEO
      if (campaign.seo) {
        totalStrings += extractFromObject(
          campaign.seo,
          buildPath(campaignPath, "seo"),
          translations,
        );
      }

      // Extract campaign slides
      if (campaign.slides && Array.isArray(campaign.slides)) {
        totalStrings += extractFromArray(
          campaign.slides,
          campaignPath,
          "slides",
          translations,
        );
      }
    }
  }

  return {
    translations,
    stats: {
      totalStrings,
    },
  };
}

export function sortTranslations(
  translations: Record<string, string>,
): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(translations).sort();

  for (const key of keys) {
    sorted[key] = translations[key];
  }

  return sorted;
}
