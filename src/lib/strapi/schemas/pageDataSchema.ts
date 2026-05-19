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

// ─── Cosmic PDF section schemas ──────────────────────────────────────────────

const CosmicHeroSectionSchema = z.object({
  __component: z.literal("cosmic.hero-section"),
  fe_component: z.string(),
  badge: z.string().nullable(),
  title1: z.string().nullable(),
  title2: z.string().nullable(),
  subtitle: z.string().nullable(),
  cta: CTASchema.nullable(),
  upload_hint_text: z.string().nullable(),
  upload_browse_text: z.string().nullable(),
  upload_error_type: z.string().nullable(),
  upload_error_size: z.string().nullable(),
  no_card_text: z.string().nullable(),
  trial_text: z.string().nullable(),
});

const CosmicTrustedBySectionSchema = z.object({
  __component: z.literal("cosmic.trusted-by-section"),
  fe_component: z.string(),
  label: z.string(),
  logos: z.array(z.any()),
});

const CosmicCardGridItemSchema = z.object({
  icon: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  badge: z.string().nullable().optional(),
  item_id: z.string().nullable().optional(),
});

const CosmicCardGridSectionSchema = z.object({
  __component: z.literal("cosmic.card-grid-section"),
  fe_component: z.string(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  items: z.array(CosmicCardGridItemSchema),
});

const CosmicListItemSchema = z.object({
  icon: z.string().nullable(),
  title: z.string(),
  subtitle: z.string().nullable(),
});

const CosmicPromoSectionSchema = z.object({
  __component: z.literal("cosmic.promo-section"),
  fe_component: z.string(),
  badge: z.string().nullable(),
  title1: z.string().nullable(),
  title2: z.string().nullable(),
  subtitle: z.string().nullable(),
  features: z.array(CosmicListItemSchema),
  cta: CTASchema.nullable(),
  cta_note: z.string().nullable(),
  media: z.any().nullable(),
});

const CosmicBulletItemSchema = z.object({
  text: z.string(),
});

const CosmicStatItemSchema = z.object({
  value: z.string(),
  label: z.string(),
});

const CosmicCtaBannerSectionSchema = z.object({
  __component: z.literal("cosmic.cta-banner-section"),
  fe_component: z.string(),
  title1: z.string().nullable(),
  title2: z.string().nullable(),
  subtitle: z.string().nullable(),
  bullets: z.array(CosmicBulletItemSchema),
  cta: CTASchema,
  stats: z.array(CosmicStatItemSchema),
  quote: z.string().nullable(),
  quote_author: z.string().nullable(),
});

const CosmicTestimonialSchema = z.object({
  name: z.string(),
  role: z.string(),
  company: z.string(),
  initials: z.string(),
  content: z.string(),
});

const CosmicTestimonialsSectionSchema = z.object({
  __component: z.literal("cosmic.testimonials-section"),
  fe_component: z.string(),
  title: z.string(),
  subtitle: z.string(),
  items: z.array(CosmicTestimonialSchema),
});

const CosmicFaqSectionSchema = z.object({
  __component: z.literal("cosmic.faq-section"),
  fe_component: z.string(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  support_text: z.string().nullable(),
  support_link_text: z.string().nullable(),
  support_link_href: z.string().nullable(),
  items: z.array(FAQItemSchema),
});

const CosmicPricingFeatureSchema = z.object({
  text: z.string(),
});

const CosmicPricingPlanSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.string(),
  period: z.string(),
  is_popular: z.boolean(),
  cta: CTASchema,
  features: z.array(CosmicPricingFeatureSchema),
  billing_note: z.string().nullable(),
  billing_amount: z.string().nullable(),
  discount: z.string().nullable(),
});

const CosmicPricingSectionSchema = z.object({
  __component: z.literal("cosmic.pricing-section"),
  fe_component: z.string(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  popular_label: z.string().nullable(),
  per_period_separator: z.string().nullable(),
  enterprise_note: z.string().nullable(),
  enterprise_cta: z.string().nullable(),
  plans: z.array(CosmicPricingPlanSchema),
});

const CosmicUploadSectionSchema = z.object({
  __component: z.literal("cosmic.upload-section"),
  fe_component: z.string(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  drop_hint_text: z.string().nullable(),
  browse_text: z.string().nullable(),
});

const CosmicAllToolsToolSchema = z.object({
  label: z.string(),
  href: z.string(),
  icon: z.string(),
});

const CosmicAllToolsCategorySchema = z.object({
  title: z.string(),
  tools: z.array(CosmicAllToolsToolSchema),
});

const CosmicAllToolsSectionSchema = z.object({
  __component: z.literal("cosmic.all-tools-section"),
  fe_component: z.string(),
  title: z.string(),
  subtitle: z.string(),
  categories: z.array(CosmicAllToolsCategorySchema),
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
  CosmicHeroSectionSchema,
  CosmicTrustedBySectionSchema,
  CosmicCardGridSectionSchema,
  CosmicPromoSectionSchema,
  CosmicCtaBannerSectionSchema,
  CosmicTestimonialsSectionSchema,
  CosmicFaqSectionSchema,
  CosmicPricingSectionSchema,
  CosmicUploadSectionSchema,
  CosmicAllToolsSectionSchema,
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
