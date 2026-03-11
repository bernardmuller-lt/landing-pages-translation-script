import type { HeaderData } from "../strapi/types/header.js";
import type { FooterData } from "../strapi/types/footer.js";
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

export function extractHeaderTranslations(
  headerData: HeaderData,
): ExtractionResult {
  const translations: Record<string, string> = {};
  let totalStrings = 0;

  // Extract from loginBtn
  if (headerData.loginBtn) {
    totalStrings += extractFromObject(
      headerData.loginBtn,
      "loginBtn",
      translations,
    );
  }

  // Extract from registerBtn
  if (headerData.registerBtn) {
    totalStrings += extractFromObject(
      headerData.registerBtn,
      "registerBtn",
      translations,
    );
  }

  return {
    translations,
    stats: {
      totalStrings,
    },
  };
}

export function extractFooterTranslations(
  footerData: FooterData,
): ExtractionResult {
  const translations: Record<string, string> = {};
  let totalStrings = 0;

  // Extract copyright
  if (isTranslatableField("copyright", footerData.copyright)) {
    translations["copyright"] = footerData.copyright as string;
    totalStrings++;
  }

  // Extract from items array
  if (footerData.items && Array.isArray(footerData.items)) {
    totalStrings += extractFromArray(
      footerData.items,
      "",
      "items",
      translations,
    );
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
