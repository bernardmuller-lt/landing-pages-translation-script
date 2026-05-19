import { toLocaleDisplay, TOOLS_BASE } from "../config.js";
import {
  HOME_HREFS,
  QUICK_TOOLS_ICONS,
  FEATURE_SHOWCASE_ICONS,
  DASHBOARD_FEATURE_ICONS,
  MEDIA,
} from "./constants.js";
import {
  compileHeroSection,
  compileTrustedBySection,
  compileCardGridSection,
  compilePromoSection,
  compileCtaBannerSection,
  compileTestimonialsSection,
  compileFaqSection,
  compileAllToolsSection,
} from "./sections.js";

export function compileHomePage(
  bundle: Record<string, any>,
  strapiLocale: string,
  environment: string,
): Record<string, any> {
  const home = bundle.home;

  return {
    data: {
      environment,
      identifier: "cosmic-pdf",
      slug: "home",
      locale: strapiLocale,
      locale_display: toLocaleDisplay(strapiLocale),
      seo: {
        title: home.pageTitle,
        description: home.hero.subtitle,
      },
      sections: [
        compileHeroSection(home.hero, HOME_HREFS.heroCta),
        compileTrustedBySection(home.trustedBy),
        compileCardGridSection("QuickTools", home.quickTools, QUICK_TOOLS_ICONS),
        compileCardGridSection("FeatureShowcase", home.featureShowcase, FEATURE_SHOWCASE_ICONS),
        compilePromoSection(
          "Dashboard",
          home.dashboard,
          HOME_HREFS.dashboardCta,
          DASHBOARD_FEATURE_ICONS,
          { light: MEDIA.dashboardLight, dark: null },
        ),
        compileCtaBannerSection("CTA", home.cta, HOME_HREFS.ctaCta),
        compileTestimonialsSection(home.testimonials),
        compileFaqSection("FAQ", home.faq, HOME_HREFS.faqSupport),
        compileAllToolsSection(home.allTools, bundle, TOOLS_BASE),
      ],
    },
  };
}
