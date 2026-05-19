/**
 * Static data that is not part of the i18n bundles.
 * CTA hrefs, icon mappings, and component identifiers.
 */

export const HOME_HREFS = {
  heroCta: "/tools",
  dashboardCta: "/dashboard",
  ctaCta: "/register",
  faqSupport: "/contact",
} as const;

export const QUICK_TOOLS_ICONS: Record<string, string> = {
  summarize: "Sparkles",
  extract: "TableProperties",
  translate: "Languages",
  ocr: "ScanText",
};

export const FEATURE_SHOWCASE_ICONS: Record<string, string> = {
  intelligence: "Brain",
  fast: "Zap",
  security: "Shield",
  access: "Globe",
};

export const DASHBOARD_FEATURE_ICONS: Record<string, string> = {
  centralized: "LayoutDashboard",
  trash: "Trash2",
  quickActions: "MousePointerClick",
};

export const PRICING_HREFS: Record<string, string> = {
  pro: "/register",
  business: "/register",
};

export const ABOUT_STAT_ICONS: Record<string, string> = {
  users: "Users",
  pdfs: "FileText",
  countries: "Globe",
  uptime: "Activity",
};

export const ABOUT_VALUE_ICONS: Record<string, string> = {
  innovation: "Lightbulb",
  user: "Heart",
  precision: "Target",
  simplicity: "Minimize2",
};

export const CONTACT_INFO_ICONS: Record<string, string> = {
  email: "Mail",
  sales: "DollarSign",
  security: "Shield",
  hours: "Clock",
};

export const TOOL_PAGE_HREFS = {
  cta: "/tools",
} as const;

/**
 * Strapi media IDs for static assets.
 * These reference media already uploaded to Strapi.
 */
export const MEDIA = {
  dashboardLight: 6,
} as const;
