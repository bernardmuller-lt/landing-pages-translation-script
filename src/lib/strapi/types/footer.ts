/**
 * TypeScript types for Footer content from Strapi CMS
 */

export interface FooterItem {
  text?: string;
  href?: string;
}

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

export interface FooterLogo {
  light: MediaAsset;
  dark?: MediaAsset;
}

export type FooterEnvironment = "production" | "staging" | "development" | "test" | "qa";

export interface FooterData {
  documentId: string;
  id: string | number;
  slug: string;
  environment: FooterEnvironment;
  copyright?: string;
  href?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt: string;
  locale: string;
  items?: FooterItem[];
  logo?: FooterLogo;
  readonly localizations?: FooterData[];
}

export interface FooterAPIPayload {
  data: {
    slug: string;
    environment: string;
    locale: string;
    copyright?: string;
    href?: string;
    items?: FooterItem[];
    logo?: FooterLogo;
  };
}
