import { toLocaleDisplay } from "../config.js";
import { CONTACT_INFO_ICONS } from "./constants.js";
import { compileSimpleHeroSection, compileCardGridSection } from "./sections.js";

export function compileContactPage(
  bundle: Record<string, any>,
  strapiLocale: string,
  environment: string,
): Record<string, any> {
  const contact = bundle.contact;

  // Map contact info items to card-grid items
  const infoItems: Record<string, any> = {};
  if (contact.info?.items) {
    for (const [key, item] of Object.entries(contact.info.items) as [string, any][]) {
      infoItems[key] = {
        title: item.title,
        description: `${item.details}\n${item.description}`,
      };
    }
  }

  return {
    data: {
      environment,
      identifier: "cosmic-pdf",
      slug: "contact",
      locale: strapiLocale,
      locale_display: toLocaleDisplay(strapiLocale),
      seo: {
        title: contact.pageTitle,
        description: contact.subtitle,
      },
      sections: [
        compileSimpleHeroSection(
          {
            badge: contact.badge,
            title1: contact.title1,
            title2: contact.title2,
            subtitle: contact.subtitle,
          },
          "ContactHero",
        ),
        compileCardGridSection("ContactInfo", {
          title: `${contact.info.title1} ${contact.info.title2}`,
          subtitle: contact.info.subtitle,
          items: infoItems,
        }, CONTACT_INFO_ICONS),
      ],
    },
  };
}
