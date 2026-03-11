/**
 * TypeScript types for Header content from Strapi CMS
 */

export interface HeaderButton {
  href: string;
  text: string;
  aria_label: string;
  icon?: string | null;
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

export interface HeaderLogo {
  light: MediaAsset;
  dark?: MediaAsset;
}

export type HeaderEnvironment =
  | "production"
  | "staging"
  | "development"
  | "test"
  | "qa";

export interface HeaderData {
  documentId: string;
  id: string | number;
  slug: string;
  environment: HeaderEnvironment;
  href?: string;
  toremove?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt: string;
  locale: string;
  loginBtn?: HeaderButton;
  registerBtn?: HeaderButton;
  logo?: HeaderLogo;
  readonly localizations?: HeaderData[];
}

export interface HeaderAPIPayload {
  data: {
    slug: string;
    environment: string;
    locale: string;
    href?: string;
    loginBtn?: HeaderButton;
    registerBtn?: HeaderButton;
    logo?: HeaderLogo;
  };
}
