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
    if (
      key === "createdAt" ||
      key === "updatedAt" ||
      key === "publishedAt" ||
      key === "localizations" ||
      key === "toremove"
    ) {
      continue;
    }

    result[key] = preprocessData(value);
  }

  return result;
}

// Button schema
const ButtonSchema = z.object({
  href: z.string(),
  text: z.string(),
  aria_label: z.string(),
  icon: z.string().optional().nullable(),
});

// Media source schema - after preprocessing, media objects become IDs
const MediaSourceSchema = z.object({
  light: z.union([z.number(), z.null()]),
  dark: z.union([z.number(), z.null()]).optional(),
});

/**
 * Cleaned HeaderData schema (after transformation)
 * This is what gets used in the API payload
 */
export const CleanHeaderDataSchema = z.object({
  slug: z.string(),
  locale: z.string(),
  environment: z.string(),
  href: z.string().optional(),
  loginBtn: ButtonSchema.optional(),
  registerBtn: ButtonSchema.optional(),
  logo: MediaSourceSchema.optional(),
});

/**
 * API Payload schema for upload
 */
export const HeaderAPIPayloadSchema = z.object({
  data: z.object({
    slug: z.string(),
    environment: z.string(),
    locale: z.string(),
    href: z.string().optional(),
    loginBtn: ButtonSchema.optional(),
    registerBtn: ButtonSchema.optional(),
    logo: MediaSourceSchema.optional(),
  }),
});

/**
 * Transforms and validates HeaderData by:
 * - Reducing media objects to just their ID
 * - Stripping id/documentId from non-media objects
 *
 * @param headerData - Raw header data from Strapi
 * @returns Cleaned and validated header data
 */
export function transformHeaderData(headerData: unknown) {
  const preprocessed = preprocessData(headerData);
  return CleanHeaderDataSchema.parse(preprocessed);
}

/**
 * Validates an API payload for upload
 *
 * @param payload - The payload to validate
 * @returns Validated payload
 * @throws ZodError if validation fails
 */
export function validateHeaderAPIPayload(payload: unknown) {
  return HeaderAPIPayloadSchema.parse(payload);
}

/**
 * Type exports
 */
export type CleanHeaderData = z.infer<typeof CleanHeaderDataSchema>;
export type HeaderAPIPayload = z.infer<typeof HeaderAPIPayloadSchema>;
