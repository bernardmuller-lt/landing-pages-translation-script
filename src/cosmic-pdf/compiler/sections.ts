/**
 * Section-level compiler functions.
 * Each function maps an i18n dictionary subtree to a Strapi component object.
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

function namedObjectToArray<T>(obj: Record<string, T>): T[] {
  return Object.values(obj);
}

function makeCta(
  href: string,
  text: string,
  ariaLabel?: string,
  icon?: string,
): Record<string, any> {
  return {
    href,
    text,
    aria_label: ariaLabel ?? text,
    icon: icon ?? null,
  };
}

export function interpolate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? vars[key] : `{${key}}`,
  );
}

// ─── Cosmic Sections ────────────────────────────────────────────────────────

export function compileHeroSection(
  hero: Record<string, any>,
  ctaHref: string,
): Record<string, any> {
  return {
    __component: "cosmic.hero-section",
    fe_component: "Hero",
    badge: hero.badge ?? null,
    title1: hero.title1 ?? null,
    title2: hero.title2 ?? null,
    subtitle: hero.subtitle,
    cta: makeCta(ctaHref, hero.cta),
    upload_hint_text: hero.dropHere ?? null,
    upload_browse_text: hero.orBrowse ?? null,
    upload_error_type: hero.pdfOnly ?? null,
    upload_error_size: hero.tooBig ?? null,
    no_card_text: hero.noCard ?? null,
    trial_text: hero.trial ?? null,
  };
}

export function compileSimpleHeroSection(
  data: {
    badge?: string;
    title?: string;
    title1?: string;
    title2?: string;
    subtitle?: string;
    pageTitle?: string;
  },
  feComponent: string,
): Record<string, any> {
  return {
    __component: "cosmic.hero-section",
    fe_component: feComponent,
    badge: data.badge ?? null,
    title1: data.title1 ?? data.title ?? data.pageTitle ?? null,
    title2: data.title2 ?? null,
    subtitle: data.subtitle ?? null,
    cta: null,
    upload_hint_text: null,
    upload_browse_text: null,
    upload_error_type: null,
    upload_error_size: null,
    no_card_text: null,
    trial_text: null,
  };
}

export function compileTrustedBySection(
  trustedBy: Record<string, any>,
): Record<string, any> {
  return {
    __component: "cosmic.trusted-by-section",
    fe_component: "TrustedBy",
    label: trustedBy.label,
    logos: [],
  };
}

export function compileCardGridSection(
  feComponent: string,
  data: Record<string, any>,
  iconMap?: Record<string, string>,
): Record<string, any> {
  const items = data.items
    ? namedObjectToArray(data.items).map((item: any, i: number) => {
        const key = Object.keys(data.items)[i];
        return {
          icon: iconMap?.[key] ?? null,
          title: item.title,
          description: item.description ?? item.body ?? null,
        };
      })
    : [];

  return {
    __component: "cosmic.card-grid-section",
    fe_component: feComponent,
    title: data.title ?? null,
    subtitle: data.subtitle ?? null,
    items,
  };
}

export function compilePromoSection(
  feComponent: string,
  data: Record<string, any>,
  ctaHref?: string,
  featureIconMap?: Record<string, string>,
  media?: { light: number | null; dark: number | null } | null,
): Record<string, any> {
  const features = data.features
    ? Object.entries(data.features).map(([key, item]: [string, any]) => ({
        icon: featureIconMap?.[key] ?? null,
        title: item.title,
        subtitle: item.body ?? item.subtitle ?? null,
      }))
    : [];

  return {
    __component: "cosmic.promo-section",
    fe_component: feComponent,
    badge: data.badge ?? null,
    title1: data.title1 ?? null,
    title2: data.title2 ?? null,
    subtitle: data.subtitle ?? null,
    features,
    cta: ctaHref && data.cta
      ? makeCta(ctaHref, data.cta)
      : null,
    cta_note: data.ctaNote ?? null,
    media: media ?? null,
  };
}

export function compileCtaBannerSection(
  feComponent: string,
  data: Record<string, any>,
  ctaHref: string,
): Record<string, any> {
  const bullets = data.bullets
    ? Object.values(data.bullets).map((text: any) => ({ text }))
    : [];

  const stats = data.stats
    ? Object.values(data.stats).map((s: any) => ({
        value: s.value,
        label: s.label,
      }))
    : [];

  return {
    __component: "cosmic.cta-banner-section",
    fe_component: feComponent,
    title1: data.title1 ?? null,
    title2: data.title2 ?? null,
    subtitle: data.subtitle ?? null,
    bullets,
    cta: makeCta(ctaHref, data.button ?? data.cta ?? data.ctaButton ?? ""),
    stats,
    quote: data.quote ?? null,
    quote_author: data.quoteAuthor ?? null,
  };
}

export function compileTestimonialsSection(
  data: Record<string, any>,
): Record<string, any> {
  const items = data.items
    ? namedObjectToArray(data.items).map((t: any) => ({
        name: t.name,
        role: t.role,
        company: t.company,
        initials: t.initials,
        content: t.content,
      }))
    : [];

  return {
    __component: "cosmic.testimonials-section",
    fe_component: "Testimonials",
    title: data.title,
    subtitle: data.subtitle,
    items,
  };
}

export function compileFaqSection(
  feComponent: string,
  data: Record<string, any>,
  supportHref?: string,
): Record<string, any> {
  const items = data.items
    ? namedObjectToArray(data.items).map((faq: any) => ({
        title: faq.q ?? faq.question ?? faq.title,
        content: faq.a ?? faq.answer ?? faq.content,
      }))
    : [];

  return {
    __component: "cosmic.faq-section",
    fe_component: feComponent,
    title: data.title1 && data.title2
      ? `<h2>${data.title1} <strong>${data.title2}</strong></h2>`
      : data.title ?? null,
    subtitle: data.subtitle ?? null,
    support_text: data.stillHave ?? null,
    support_link_text: data.contactSupport ?? null,
    support_link_href: supportHref ?? null,
    items,
  };
}

export function compileUploadSection(
  feComponent: string,
  data: Record<string, any>,
): Record<string, any> {
  return {
    __component: "cosmic.upload-section",
    fe_component: feComponent,
    title: data.title ?? null,
    subtitle: data.subtitle ?? null,
    drop_hint_text: data.dropHere ?? data.drop_hint_text ?? null,
    browse_text: data.orBrowse ?? data.browse_text ?? null,
  };
}

export function compileAllToolsSection(
  data: Record<string, any>,
  bundle: Record<string, any>,
  toolsBase: readonly { id: string; categoryKey: string; icon: string }[],
): Record<string, any> {
  // Group tools by categoryKey, preserving order
  const categoryOrder: string[] = [];
  const grouped: Record<string, { id: string; icon: string }[]> = {};
  for (const tool of toolsBase) {
    if (!grouped[tool.categoryKey]) {
      grouped[tool.categoryKey] = [];
      categoryOrder.push(tool.categoryKey);
    }
    grouped[tool.categoryKey].push({ id: tool.id, icon: tool.icon });
  }

  const categories = categoryOrder.map((catKey) => ({
    title: bundle.toolCategories?.[catKey] ?? catKey,
    tools: grouped[catKey].map((tool) => ({
      label: bundle.toolNames?.[tool.id] ?? tool.id,
      href: `/tools/${tool.id}`,
      icon: tool.icon,
    })),
  }));

  return {
    __component: "cosmic.all-tools-section",
    fe_component: "AllTools",
    title: data.title,
    subtitle: data.subtitle,
    categories,
  };
}

export function compilePricingSection(
  data: Record<string, any>,
  planCtaHrefs: Record<string, string>,
): Record<string, any> {
  const plans = data.plans
    ? Object.entries(data.plans).map(([key, plan]: [string, any]) => ({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        period: plan.period,
        is_popular: key === "pro",
        cta: makeCta(planCtaHrefs[key] ?? "/register", plan.cta),
        features: plan.features
          ? Object.values(plan.features).map((text: any) => ({ text }))
          : [],
        billing_note: plan.billingNote ?? null,
        billing_amount: plan.billingAmount ?? null,
        discount: plan.discount ?? null,
      }))
    : [];

  return {
    __component: "cosmic.pricing-section",
    fe_component: "Pricing",
    title: data.title ?? null,
    subtitle: data.subtitle ?? null,
    popular_label: data.popular ?? null,
    per_period_separator: data.perPeriod ?? null,
    enterprise_note: data.enterpriseNote ?? null,
    enterprise_cta: data.enterpriseCta ?? null,
    plans,
  };
}

export function compileLegalSection(
  feComponent: string,
  section: Record<string, any>,
): Record<string, any> {
  // Build HTML content from the section fields
  let content = "";
  if (section.body) content += `<p>${section.body}</p>`;
  if (section.intro) content += `<p>${section.intro}</p>`;

  // Handle sub-items (like privacy.sections.collected with identity/contact/etc.)
  const subKeys = Object.keys(section).filter(
    (k) => !["title", "body", "intro", "email"].includes(k),
  );
  for (const key of subKeys) {
    const item = section[key];
    if (typeof item === "object" && item.label && item.body) {
      content += `<p><strong>${item.label}</strong> ${item.body}</p>`;
    }
  }

  if (section.email) {
    content += `<p>${section.email}</p>`;
  }

  return {
    __component: "shared.legal",
    fe_component: feComponent,
    title: section.title ?? null,
    content: content || null,
  };
}
