import { toLocaleDisplay } from "../config.js";
import { PRICING_HREFS, HOME_HREFS } from "./constants.js";
import { compilePricingSection, compileFaqSection } from "./sections.js";

export function compilePricingPage(
  bundle: Record<string, any>,
  strapiLocale: string,
  environment: string,
): Record<string, any> {
  const pricing = bundle.pricing;

  return {
    data: {
      environment,
      identifier: "cosmic-pdf",
      slug: "pricing",
      locale: strapiLocale,
      locale_display: toLocaleDisplay(strapiLocale),
      seo: {
        title: pricing.pageTitle,
        description: pricing.subtitle,
      },
      sections: [
        compilePricingSection(pricing, PRICING_HREFS),
        compileFaqSection("FAQ", bundle.home.faq, HOME_HREFS.faqSupport),
      ],
    },
  };
}
