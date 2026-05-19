import { toLocaleDisplay } from "../config.js";
import { ABOUT_VALUE_ICONS } from "./constants.js";
import {
  compileSimpleHeroSection,
  compilePromoSection,
  compileCardGridSection,
  compileFaqSection,
} from "./sections.js";

export function compileAboutPage(
  bundle: Record<string, any>,
  strapiLocale: string,
  environment: string,
): Record<string, any> {
  const about = bundle.about;

  return {
    data: {
      environment,
      identifier: "cosmic-pdf",
      slug: "about",
      locale: strapiLocale,
      locale_display: toLocaleDisplay(strapiLocale),
      seo: {
        title: about.pageTitle,
        description: about.subtitle,
      },
      sections: [
        compileSimpleHeroSection(
          {
            badge: about.badge,
            title1: about.title1,
            title2: about.title2,
            subtitle: about.subtitle,
          },
          "AboutHero",
        ),
        compilePromoSection("Mission", {
          title1: about.mission.title1,
          title2: about.mission.title2,
          subtitle: about.mission.body1,
        }),
        compileCardGridSection("Values", {
          title1: about.values.title1,
          title2: about.values.title2,
          title: `${about.values.title1} ${about.values.title2}`,
          subtitle: about.values.subtitle,
          items: about.values.items,
        }, ABOUT_VALUE_ICONS),
        compileFaqSection("AboutFAQ", about.faq),
      ],
    },
  };
}
