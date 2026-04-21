/**
 * TypeScript types for Onboarding Page content from Strapi CMS
 */

export interface MediaAsset {
  documentId: string;
  id: string | number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: unknown;
  hash: string;
  ext?: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: unknown;
  createdAt?: string;
  updatedAt?: string;
  publishedAt: string;
  related?: unknown;
}

export interface MediaSource {
  light: MediaAsset;
  dark?: MediaAsset;
}

export interface OnboardingSEO {
  id?: number;
  title: string;
  description: string;
}

export interface OnboardingCTA {
  id?: number;
  href: string;
  text: string;
  aria_label: string;
  icon?: string | null;
  wide?: boolean;
}

export interface OnboardingLegalText {
  fe_component?: string;
  title?: string;
  content?: string;
}

export interface SlideTextComponent {
  id?: number;
  description: string;
  backgroundColor?: string;
  logo?: MediaSource;
  title: { heading?: string };
  cta: OnboardingCTA;
  legal_text?: OnboardingLegalText;
  legal_image?: MediaSource;
}

export interface SlideMediaComponent {
  id?: number;
  backgroundColor?: string;
  media: MediaSource;
}

export interface OnboardingSlide {
  id?: number;
  left_media?: SlideMediaComponent;
  left_text?: SlideTextComponent;
  right_media?: SlideMediaComponent;
  right_text?: SlideTextComponent;
}

export interface OnboardingCampaign {
  id?: number;
  slug: string;
  seo?: OnboardingSEO;
  slides: OnboardingSlide[];
}

export interface OnboardingPageData {
  documentId: string;
  id: string | number;
  environment: string;
  identifier: string;
  locale_display: string;
  default_slug: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt: string;
  locale: string;
  seo: OnboardingSEO;
  default_slides: OnboardingSlide[];
  campaigns: OnboardingCampaign[];
  readonly localizations?: unknown[];
}

export interface OnboardingPageAPIPayload {
  data: {
    default_slug: string;
    environment: string;
    locale: string;
    identifier: string;
    locale_display: string;
    seo: OnboardingSEO;
    default_slides: OnboardingSlide[];
    campaigns: OnboardingCampaign[];
  };
}
