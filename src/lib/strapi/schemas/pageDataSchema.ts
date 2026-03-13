import { z } from "zod";

/**
 * Fields to exclude from the API payload
 * These fields should not be sent when creating new locale content
 */
const EXCLUDED_FIELDS = ["wide"];

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
 * - Removes excluded fields
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

    if (EXCLUDED_FIELDS.includes(key)) {
      continue;
    }

    result[key] = preprocessData(value);
  }

  return result;
}

// Base schemas for common structures
const SEOSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const TrackingEventsSchema = z.object({
  viewPageEventName: z.string(),
  landing_folder: z.string().nullable(),
  landing_parameter: z.string().nullable(),
});

const CTASchema = z.object({
  href: z.string(),
  text: z.string(),
  aria_label: z.string(),
  icon: z.string().nullable(),
  // 'wide' is excluded via EXCLUDED_FIELDS
});

const MediaSourceSchema = z.object({
  light: z.union([z.number(), z.null()]),
  dark: z.union([z.number(), z.null()]),
});

// Section schemas
const HeroSectionSchema = z.object({
  __component: z.literal("ai-chat.hero-section"),
  fe_component: z.literal("Hero"),
  title: z.string(),
  description: z.string(),
  cta: CTASchema,
  media: MediaSourceSchema,
});

const CarouselItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  rating: z.number(),
  author: z.string(),
});

const CarouselSectionSchema = z.object({
  __component: z.literal("ai-chat.carousel-section"),
  fe_component: z.literal("Carousel"),
  title: z.string(),
  items: z.array(CarouselItemSchema),
});

const MilestoneItemSchema = z.object({
  text: z.string(),
  media: z.union([z.number(), MediaSourceSchema]),
});

const MilestoneSectionSchema = z.object({
  __component: z.literal("ai-chat.milestone-section"),
  fe_component: z.literal("Milestones"),
  title: z.string().nullable(),
  items: z.array(MilestoneItemSchema),
});

const PriceDetailsSchema = z.object({
  pricePerDay: z.string(),
  duration: z.string(),
  fullPrice: z.string(),
});

const PlanFeatureSchema = z.object({
  icon: z.string(),
  title: z.string(),
  subtitle: z.string(),
});

const PlanItemSchema = z.object({
  isPopular: z.boolean().nullable(),
  priceDetails: PriceDetailsSchema,
  description: z.array(PlanFeatureSchema),
  cta: CTASchema,
});

const PlanSectionSchema = z.object({
  __component: z.literal("ai-chat.plan-section"),
  fe_component: z.literal("Plans"),
  title: z.string(),
  items: z.array(PlanItemSchema),
});

const ComparisonTableHeaderSchema = z.object({
  heading: z.string().nullable(),
});

const ComparisonTableRowSchema = z.object({
  title: z.string(),
  tier: z.string(),
  subtitle: z.string(),
  icon: MediaSourceSchema.nullable(),
});

const PerkComparisonTableSchema = z.object({
  __component: z.literal("ai-chat.perk-comparison-table"),
  header: z.array(ComparisonTableHeaderSchema),
  rows: z.array(ComparisonTableRowSchema),
});

const FeatureTabSchema = z.object({
  title: z.string(),
  text: z.string(),
  icon: MediaSourceSchema,
  cta: CTASchema,
});

const FeatureSectionSchema = z.object({
  __component: z.literal("ai-chat.feature-section"),
  fe_component: z.literal("Features"),
  client: z.boolean(),
  title: z.string(),
  media: MediaSourceSchema,
  tabs: z.array(FeatureTabSchema),
});

const FAQItemSchema = z.object({
  title: z.string(),
  content: z.string(),
});

const FAQSectionSchema = z.object({
  __component: z.literal("ai-chat.faq-section"),
  fe_component: z.literal("FAQ"),
  client: z.boolean(),
  title: z.string(),
  items: z.array(FAQItemSchema),
});

const HighlightItemSchema = z.object({
  title: z.string(),
  media: MediaSourceSchema,
  icon: MediaSourceSchema.nullable(),
});

const HighLightSectionSchema = z.object({
  __component: z.literal("ai-chat.high-light-section"),
  fe_component: z.literal("Highlights"),
  title: z.string(),
  items: z.array(HighlightItemSchema),
});

const TopicItemSchema = z.object({
  heading: z.string(),
});

const TopicsSectionSchema = z.object({
  __component: z.literal("ai-chat.topics-section"),
  fe_component: z.literal("Topics"),
  title: z.string(),
  items: z.array(TopicItemSchema),
});

const OnBoardingSlidesSectionSchema = z.object({
  __component: z.literal("ai-chat.onboarding-slides-section"),
  fe_component: z.literal("OnBoardingSlides"),
  items: z.array(MediaSourceSchema),
});

const OnBoardingContentItemSchema = z.object({
  title1: z.string(),
  title1Highlight: z.boolean(),
  title2: z.string(),
  title2Highlight: z.boolean(),
  description: z.string(),
  isContinue: z.boolean().nullable().optional(),
});

const OnBoardingContentSectionSchema = z.object({
  __component: z.literal("ai-chat.onboarding-content-section"),
  fe_component: z.literal("OnBoardingContent"),
  items: z.array(OnBoardingContentItemSchema),
});

const LegalSectionSchema = z.object({
  __component: z.literal("shared.legal"),
  fe_component: z.string(),
  title: z.string(),
  content: z.string(),
});

const SupportSectionSchema = z.object({
  __component: z.literal("shared.support"),
  fe_component: z.literal("Support"),
  title: z.string(),
  description: z.string(),
  cta: CTASchema,
});

const SectionSchema = z.discriminatedUnion("__component", [
  HeroSectionSchema,
  CarouselSectionSchema,
  MilestoneSectionSchema,
  PlanSectionSchema,
  PerkComparisonTableSchema,
  FeatureSectionSchema,
  HighLightSectionSchema,
  TopicsSectionSchema,
  OnBoardingSlidesSectionSchema,
  OnBoardingContentSectionSchema,
  FAQSectionSchema,
  LegalSectionSchema,
  SupportSectionSchema,
]);

/**
 * Cleaned PageData schema (after transformation)
 * This is what gets used in the API payload
 */
export const CleanPageDataSchema = z.object({
  slug: z.string(),
  locale: z.string(),
  seo: SEOSchema,
  sections: z.array(SectionSchema),
  events: TrackingEventsSchema.nullable().optional(),
});

/**
 * API Payload schema for upload
 */
export const APIPayloadSchema = z.object({
  data: z.object({
    environment: z.string(),
    identifier: z.string(),
    slug: z.string(),
    locale: z.string(),
    locale_display: z.string().optional(),
    seo: SEOSchema,
    events: TrackingEventsSchema.nullable().optional(),
    sections: z.array(SectionSchema),
  }),
});

/**
 * Transforms and validates PageData by:
 * - Reducing media objects to just their ID
 * - Stripping id/documentId from non-media objects
 * - Removing excluded fields
 *
 * @param pageData - Raw page data from Strapi
 * @returns Cleaned and validated page data
 */
export function transformPageData(pageData: unknown) {
  const preprocessed = preprocessData(pageData);

  return CleanPageDataSchema.parse(preprocessed);
}

/**
 * Validates an API payload for upload
 *
 * @param payload - The payload to validate
 * @returns Validated payload
 * @throws ZodError if validation fails
 */
export function validateAPIPayload(payload: unknown) {
  return APIPayloadSchema.parse(payload);
}

/**
 * Type exports
 */
export type CleanPageData = z.infer<typeof CleanPageDataSchema>;
export type APIPayload = z.infer<typeof APIPayloadSchema>;
