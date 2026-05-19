import { toLocaleDisplay } from "../config.js";
import { TOOL_PAGE_HREFS } from "./constants.js";
import {
  compileCardGridSection,
  compileFaqSection,
  interpolate,
} from "./sections.js";

export function compileToolPage(
  toolId: string,
  toolIcon: string,
  bundle: Record<string, any>,
  strapiLocale: string,
  environment: string,
): Record<string, any> {
  const toolName = bundle.toolNames[toolId];
  const templates = bundle.tools.templates;
  const vars = { name: toolName, nameLower: toolName.toLowerCase() };

  const tagline = interpolate(templates.tagline, vars);
  const description = interpolate(templates.description, vars);

  // Hero section for the tool
  const heroSection = {
    __component: "cosmic.hero-section",
    fe_component: "ToolHero",
    badge: null,
    title1: toolName,
    title2: null,
    subtitle: `<p>${tagline}</p><p>${description}</p>`,
    cta: {
      href: TOOL_PAGE_HREFS.cta,
      text: bundle.tools.ctaButton,
      aria_label: bundle.tools.ctaButton,
      icon: null,
    },
    upload_hint_text: bundle.tools.dropFile ?? null,
    upload_browse_text: bundle.tools.orBrowse ?? null,
    upload_error_type: null,
    upload_error_size: null,
    no_card_text: null,
    trial_text: null,
  };

  // Features as card grid
  const featureItems: Record<string, any> = {};
  for (const [key, feat] of Object.entries(templates.features) as [string, any][]) {
    featureItems[key] = {
      title: feat.title,
      description: interpolate(feat.description, vars),
    };
  }
  const featuresSection = compileCardGridSection("ToolFeatures", {
    title: bundle.tools.featuresTitle,
    subtitle: interpolate(bundle.tools.featuresSubtitle, vars),
    items: featureItems,
  });

  // How it works as card grid
  const howItWorksItems: Record<string, any> = {};
  for (const [key, step] of Object.entries(templates.howItWorks) as [string, any][]) {
    howItWorksItems[key] = {
      title: step.title,
      description: interpolate(step.description, vars),
    };
  }
  const howItWorksSection = compileCardGridSection("ToolHowItWorks", {
    title: bundle.tools.howItWorksTitle,
    subtitle: bundle.tools.howItWorksSubtitle,
    items: howItWorksItems,
  });

  // FAQs
  const faqItems: Record<string, any> = {};
  for (const [key, faq] of Object.entries(templates.faqs) as [string, any][]) {
    faqItems[key] = {
      q: interpolate(faq.question, vars),
      a: faq.answer,
    };
  }
  // GetStarted section (reuses hero component structure)
  const getStartedSection = {
    __component: "cosmic.hero-section",
    fe_component: "GetStarted",
    badge: null,
    title1: bundle.tools.ctaTitle,
    title2: null,
    subtitle: interpolate(templates.description, vars),
    cta: {
      href: TOOL_PAGE_HREFS.cta,
      text: bundle.tools.ctaButton,
      aria_label: bundle.tools.ctaButton,
      icon: null,
    },
    upload_hint_text: null,
    upload_browse_text: null,
    upload_error_type: null,
    upload_error_size: null,
    no_card_text: null,
    trial_text: null,
  };

  const faqSection = compileFaqSection("ToolFAQ", {
    title: bundle.tools.faqTitle,
    subtitle: interpolate(bundle.tools.faqSubtitle, vars),
    items: faqItems,
  });

  return {
    data: {
      environment,
      identifier: "cosmic-pdf",
      slug: `tools/${toolId}`,
      locale: strapiLocale,
      locale_display: toLocaleDisplay(strapiLocale),
      seo: {
        title: `${toolName} ${bundle.tools.pageTitleSuffix}`,
        description: tagline,
      },
      sections: [heroSection, featuresSection, howItWorksSection, getStartedSection, faqSection],
    },
  };
}
