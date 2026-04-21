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
      key === "localizations"
    ) {
      continue;
    }

    result[key] = preprocessData(value);
  }

  return result;
}

// Media source schema - after preprocessing, media objects become IDs
const MediaSourceSchema = z.object({
  light: z.union([z.number(), z.null()]).optional().nullable(),
  dark: z.union([z.number(), z.null()]).optional().nullable(),
}).optional().nullable();

// SEO schema
const SEOSchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
}).optional().nullable();

// CTA schema
const CTASchema = z.object({
  href: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  aria_label: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  wide: z.boolean().optional().nullable(),
}).optional().nullable();

// Legal text schema
const LegalTextSchema = z.object({
  fe_component: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
}).optional().nullable();

// Slide title schema
const SlideTitleSchema = z.object({
  heading: z.string().optional().nullable(),
}).optional().nullable();

// Slide text component schema
const SlideTextSchema = z.object({
  description: z.string().optional().nullable(),
  backgroundColor: z.string().optional().nullable(),
  logo: MediaSourceSchema,
  title: SlideTitleSchema,
  cta: CTASchema,
  legal_text: LegalTextSchema,
  legal_image: MediaSourceSchema,
}).optional().nullable();

// Slide media component schema
const SlideMediaSchema = z.object({
  backgroundColor: z.string().optional().nullable(),
  media: MediaSourceSchema,
}).optional().nullable();

// Slide schema
const SlideSchema = z.object({
  left_media: SlideMediaSchema,
  left_text: SlideTextSchema,
  right_media: SlideMediaSchema,
  right_text: SlideTextSchema,
}).optional().nullable();

// Campaign schema
const CampaignSchema = z.object({
  slug: z.string().optional().nullable(),
  seo: SEOSchema,
  slides: z.array(SlideSchema).optional().nullable(),
}).optional().nullable();

/**
 * Cleaned OnboardingPageData schema (after transformation)
 */
export const CleanOnboardingPageDataSchema = z.object({
  default_slug: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  environment: z.string().optional().nullable(),
  identifier: z.string().optional().nullable(),
  locale_display: z.string().optional().nullable(),
  seo: SEOSchema,
  default_slides: z.array(SlideSchema).optional().nullable(),
  campaigns: z.array(CampaignSchema).optional().nullable(),
});

/**
 * API Payload schema for upload
 */
export const OnboardingPageAPIPayloadSchema = z.object({
  data: CleanOnboardingPageDataSchema,
});

/**
 * Transforms and validates OnboardingPageData by:
 * - Reducing media objects to just their ID
 * - Stripping id/documentId from non-media objects
 */
export function transformOnboardingPageData(data: unknown) {
  const preprocessed = preprocessData(data);
  return CleanOnboardingPageDataSchema.parse(preprocessed);
}

/**
 * Validates an API payload for upload
 */
export function validateOnboardingPageAPIPayload(payload: unknown) {
  return OnboardingPageAPIPayloadSchema.parse(payload);
}

/**
 * Type exports
 */
export type CleanOnboardingPageData = z.infer<
  typeof CleanOnboardingPageDataSchema
>;
export type OnboardingPageAPIPayload = z.infer<
  typeof OnboardingPageAPIPayloadSchema
>;
