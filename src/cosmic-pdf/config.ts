import { resolve } from "path";

export const cosmicConfig = {
  identifier: "cosmic-pdf",
  environment: "production",
  bundlesDir: resolve(process.cwd(), "i18n/bundles"),
  preparedOutputDir: resolve(process.cwd(), "output/prepared"),
  legalDir: resolve(process.cwd(), "i18n/legal"),
} as const;

/**
 * Locales available in the i18n bundles.
 */
export const COSMIC_LOCALES: Record<string, string> = {
  en: "English",
  de: "German",
  es: "Spanish",
  fr: "French",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  nl: "Dutch",
  pl: "Polish",
  "pt-BR": "Portuguese (Brazil)",
  tr: "Turkish",
  ar: "Arabic",
};

/**
 * Map i18n locale codes to Strapi locale codes where they differ.
 */
export const STRAPI_LOCALE_MAP: Record<string, string> = {
  ja: "ja-JP",
  ko: "ko-KR",
};

/**
 * Map Strapi locale codes to short display codes.
 */
export const LOCALE_DISPLAY_MAP: Record<string, string> = {
  "pt-BR": "br",
  "ja-JP": "jp",
  "ko-KR": "kr",
};

export function toStrapiLocale(i18nLocale: string): string {
  return STRAPI_LOCALE_MAP[i18nLocale] ?? i18nLocale;
}

export function toLocaleDisplay(strapiLocale: string): string {
  return LOCALE_DISPLAY_MAP[strapiLocale] ?? strapiLocale;
}

/**
 * Landing page slugs (excludes tool pages which are generated separately).
 */
export const PAGE_SLUGS = [
  "home",
  "pricing",
  "about",
  "contact",
  "privacy",
  "terms",
  "forms",
  "cookies",
] as const;

/**
 * Tool definitions for generating tool pages.
 * Each tool becomes its own Strapi page using template interpolation.
 */
export const TOOLS_BASE = [
  { id: "sign-pdf", categoryKey: "security", icon: "FileSignature" },
  { id: "password-protect", categoryKey: "security", icon: "Lock" },
  { id: "share-pdf", categoryKey: "security", icon: "Share2" },
  { id: "share-files", categoryKey: "security", icon: "FolderOpen" },
  { id: "split-pdf", categoryKey: "splitMerge", icon: "Scissors" },
  { id: "merge-pdf", categoryKey: "splitMerge", icon: "Combine" },
  { id: "combine-pdf", categoryKey: "splitMerge", icon: "LayoutGrid" },
  { id: "reorder-pdf", categoryKey: "splitMerge", icon: "ArrowUpDown" },
  { id: "extract-pages", categoryKey: "splitMerge", icon: "FileStack" },
  { id: "edit-pdf", categoryKey: "editPdf", icon: "Edit3" },
  { id: "edit-fill-pdf", categoryKey: "editPdf", icon: "FilePen" },
  { id: "edit-scanned-pdf", categoryKey: "editPdf", icon: "ScanLine" },
  { id: "add-image-to-pdf", categoryKey: "editPdf", icon: "ImagePlus" },
  { id: "watermark", categoryKey: "editPdf", icon: "Droplet" },
  { id: "rotate-pdf", categoryKey: "editPdf", icon: "RotateCw" },
  { id: "delete-pages", categoryKey: "editPdf", icon: "Trash2" },
  { id: "pages-numbering", categoryKey: "editPdf", icon: "Hash" },
  { id: "pdf-reader", categoryKey: "editPdf", icon: "FileText" },
  { id: "pdf-to-word", categoryKey: "convertFromPdf", icon: "FileOutput" },
  { id: "pdf-to-jpg", categoryKey: "convertFromPdf", icon: "FileImage" },
  { id: "pdf-to-png", categoryKey: "convertFromPdf", icon: "FileImage" },
  { id: "pdf-to-powerpoint", categoryKey: "convertFromPdf", icon: "Presentation" },
  { id: "pdf-to-excel", categoryKey: "convertFromPdf", icon: "FileSpreadsheet" },
  { id: "pdf-to-pdfa", categoryKey: "convertFromPdf", icon: "Archive" },
  { id: "word-to-pdf", categoryKey: "convertToPdf", icon: "FileInput" },
  { id: "jpg-to-pdf", categoryKey: "convertToPdf", icon: "FileInput" },
  { id: "png-to-pdf", categoryKey: "convertToPdf", icon: "FileInput" },
  { id: "powerpoint-to-pdf", categoryKey: "convertToPdf", icon: "FileInput" },
  { id: "excel-to-pdf", categoryKey: "convertToPdf", icon: "FileInput" },
  { id: "pdfa-to-pdf", categoryKey: "convertToPdf", icon: "FileInput" },
  { id: "compress-pdf", categoryKey: "compress", icon: "Minimize2" },
  { id: "compress-image", categoryKey: "compress", icon: "Minimize2" },
] as const;
