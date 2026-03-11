import { z } from "zod";

/**
 * Helper to check if a value appears to be a Strapi media object
 */
function isStrapiMedia(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    obj.hash !== undefined ||
    obj.ext !== undefined ||
    obj.mime !== undefined ||
    obj.formats !== undefined ||
    (obj.url !== undefined && obj.provider !== undefined)
  );
}

/**
 * Preprocessor that recursively transforms data:
 * - Reduces media objects to just their ID
 * - Strips id/documentId from non-media objects
 */
function preprocessData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => preprocessData(item));
  }

  if (typeof data !== "object") {
    return data;
  }

  const obj = data as Record<string, unknown>;

  if (isStrapiMedia(obj) && obj.id !== undefined) {
    return obj.id;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === "id" || key === "documentId") {
      continue;
    }

    // Remove fields that should not be sent to API
    if (key === "createdAt" || key === "updatedAt" || key === "publishedAt" || key === "localizations") {
      continue;
    }

    result[key] = preprocessData(value);
  }

  return result;
}

// Footer item schema
const FooterItemSchema = z.object({
  text: z.string().optional(),
  href: z.string().optional(),
});

// Media source schema - after preprocessing, media objects become IDs
const MediaSourceSchema = z.object({
  light: z.union([z.number(), z.null()]),
  dark: z.union([z.number(), z.null()]).optional(),
});

/**
 * Cleaned FooterData schema (after transformation)
 * This is what gets used in the API payload
 */
export const CleanFooterDataSchema = z.object({
  slug: z.string(),
  locale: z.string(),
  environment: z.string(),
  copyright: z.string().optional(),
  href: z.string().optional(),
  items: z.array(FooterItemSchema).optional(),
  logo: MediaSourceSchema.optional(),
});

/**
 * API Payload schema for upload
 */
export const FooterAPIPayloadSchema = z.object({
  data: z.object({
    slug: z.string(),
    environment: z.string(),
    locale: z.string(),
    copyright: z.string().optional(),
    href: z.string().optional(),
    items: z.array(FooterItemSchema).optional(),
    logo: MediaSourceSchema.optional(),
  }),
});

/**
 * Transforms and validates FooterData by:
 * - Reducing media objects to just their ID
 * - Stripping id/documentId from non-media objects
 *
 * @param footerData - Raw footer data from Strapi
 * @returns Cleaned and validated footer data
 */
export function transformFooterData(footerData: unknown) {
  const preprocessed = preprocessData(footerData);
  return CleanFooterDataSchema.parse(preprocessed);
}

/**
 * Validates an API payload for upload
 *
 * @param payload - The payload to validate
 * @returns Validated payload
 * @throws ZodError if validation fails
 */
export function validateFooterAPIPayload(payload: unknown) {
  return FooterAPIPayloadSchema.parse(payload);
}

/**
 * Type exports
 */
export type CleanFooterData = z.infer<typeof CleanFooterDataSchema>;
export type FooterAPIPayload = z.infer<typeof FooterAPIPayloadSchema>;
