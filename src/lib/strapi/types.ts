export interface LocaleInfo {
  id: number;
  documentId: string;
  environment: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  slug: string;
}

export interface SEO {
  id: number;
  title: string;
  description: string;
}

export interface TrackingEvents {
  viewPageEventName: string;
  landing_folder: string;
  landing_parameter: string;
}

export interface ImageSource {
  id: number;
  dark: string;
  light: string;
}

export interface Image {
  id: number;
  alt: string;
  title: string;
  src: ImageSource;
}

export interface CTA {
  id: number;
  href: string;
  text: string;
  aria_label: string;
  icon: string | null;
  wide?: boolean;
}

export interface RichTextNode {
  type: string;
  children?: Array<{
    type: string;
    text?: string;
    [key: string]: any;
  }>;
}

export interface Video {
  id: number;
  width: string;
  height: string;
  muted: boolean | null;
  loop: boolean | null;
  autoplay: boolean | null;
  playsinline: boolean | null;
  class: string;
  title: string;
  src: string;
}

export interface Logo {
  id: number;
  href: string | null;
  src: string;
  width: number | null;
  height: number | null;
  alt: string;
  title: string;
}

export interface Icon {
  id: number;
  src: string;
  alt: string;
}

export interface StrapiMediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  } | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface MediaSource {
  id: number;
  light: StrapiMedia | null;
  dark: StrapiMedia | null;
}

export interface HeroSection {
  __component: 'ai-chat.hero-section';
  id: number;
  fe_component: 'Hero';
  title: string;
  description: string;
  cta: CTA;
  media: MediaSource;
}

export interface CarouselItem {
  id: number;
  title: string;
  description: string;
  rating: number;
  author: string;
}

export interface CarouselSection {
  __component: 'ai-chat.carousel-section';
  id: number;
  fe_component: 'Carousel';
  title: string;
  items: CarouselItem[];
}

export interface MilestoneItem {
  id: number;
  text: string;
  media: StrapiMedia;
}

export interface MilestoneSection {
  __component: 'ai-chat.milestone-section';
  id: number;
  fe_component: 'Milestones';
  title: string | null;
  items: MilestoneItem[];
}

export interface PriceDetails {
  id: number;
  pricePerDay: string;
  duration: string;
  fullPrice: string;
}

export interface PlanFeature {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
}

export interface PlanItem {
  id: number;
  isPopular: boolean | null;
  priceDetails: PriceDetails;
  description: PlanFeature[];
  cta: CTA;
}

export interface PlanSection {
  __component: 'ai-chat.plan-section';
  id: number;
  fe_component: 'Plans';
  title: string;
  items: PlanItem[];
}

export interface ComparisonTableHeader {
  id: number;
  heading: string | null;
}

export interface ComparisonTableRow {
  id: number;
  title: string;
  tier: string;
  subtitle: string;
  icon: MediaSource | null;
}

export interface PerkComparisonTable {
  __component: 'ai-chat.perk-comparison-table';
  id: number;
  header: ComparisonTableHeader[];
  rows: ComparisonTableRow[];
}

export interface FeatureTab {
  id: number;
  title: string;
  text: string;
  icon: MediaSource;
  cta: CTA;
}

export interface FeatureSection {
  __component: 'ai-chat.feature-section';
  id: number;
  fe_component: 'Features';
  client: boolean;
  title: string;
  media: MediaSource;
  tabs: FeatureTab[];
}

export interface FAQItem {
  id: number;
  title: string;
  content: string;
}

export interface FAQSection {
  __component: 'ai-chat.faq-section';
  id: number;
  fe_component: 'FAQ';
  client: boolean;
  title: string;
  items: FAQItem[];
}

export interface HighlightItem {
  id: number;
  title: string;
  media: MediaSource;
  icon: MediaSource;
}

export interface HighLightSection {
  __component: 'ai-chat.high-light-section';
  id: number;
  fe_component: 'Highlights';
  title: string;
  items: HighlightItem[];
}

export interface TopicItem {
  id: number;
  heading: string;
}

export interface TopicsSection {
  __component: 'ai-chat.topics-section';
  id: number;
  fe_component: 'Topics';
  title: string;
  items: TopicItem[];
}

export interface OnBoardingSlidesSection {
  __component: 'ai-chat.onboarding-slides-section';
  id: number;
  fe_component: 'OnBoardingSlides';
  items: MediaSource[];
}

export interface OnBoardingContentItem {
  id: number;
  title1: string;
  title1Highlight: boolean;
  title2: string;
  title2Highlight: boolean;
  description: string;
  isContinue: boolean;
}

export interface OnBoardingContentSection {
  __component: 'ai-chat.onboarding-content-section';
  id: number;
  fe_component: 'OnBoardingContent';
  items: OnBoardingContentItem[];
}

export interface LegalSection {
  __component: 'shared.legal';
  id: number;
  fe_component: string;
  title: string;
  content: string;
}

export interface SupportSection {
  __component: 'shared.support';
  id: number;
  fe_component: 'Support';
  title: string;
  description: string;
  cta: CTA;
}

export type Section =
  | HeroSection
  | CarouselSection
  | MilestoneSection
  | PlanSection
  | PerkComparisonTable
  | FeatureSection
  | HighLightSection
  | TopicsSection
  | OnBoardingSlidesSection
  | OnBoardingContentSection
  | FAQSection
  | LegalSection
  | SupportSection;

export interface AIChatDocument {
  id: number;
  documentId: string;
  environment: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  slug: string;
  identifier: string;
  localizations: LocaleInfo[];
  seo: SEO;
  sections: Section[];
  events: TrackingEvents;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface APIResponse {
  data: AIChatDocument[];
  meta: {
    pagination: PaginationMeta;
  };
}
