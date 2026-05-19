import { toLocaleDisplay, TOOLS_BASE } from "../config.js";
import {
  compileSimpleHeroSection,
  compileCardGridSection,
  compileUploadSection,
  compileAllToolsSection,
} from "./sections.js";

export function compileFormsPage(
  bundle: Record<string, any>,
  strapiLocale: string,
  environment: string,
): Record<string, any> {
  const forms = bundle.forms;

  // Map form items to card-grid items
  const formItems: Record<string, any> = {};
  if (forms.items) {
    for (const [key, item] of Object.entries(forms.items) as [string, any][]) {
      formItems[key] = {
        title: `${item.name} — ${item.title}`,
        description: item.description,
        badge: item.category,
        item_id: key,
      };
    }
  }

  return {
    data: {
      environment,
      identifier: "cosmic-pdf",
      slug: "forms",
      locale: strapiLocale,
      locale_display: toLocaleDisplay(strapiLocale),
      seo: {
        title: forms.pageTitle,
        description: forms.subtitle,
      },
      sections: [
        compileSimpleHeroSection(
          { title: forms.title, subtitle: forms.subtitle },
          "FormsHero",
        ),
        compileCardGridSection("FormItems", {
          title: forms.title,
          subtitle: forms.subtitle,
          items: formItems,
        }),
        compileUploadSection("Upload", {
          title: forms.uploadTitle,
          subtitle: forms.uploadSubtitle,
          dropHere: forms.dropHere,
          orBrowse: forms.orBrowse,
        }),
        compileAllToolsSection(
          { title: bundle.home.allTools.title, subtitle: bundle.home.allTools.subtitle },
          bundle,
          TOOLS_BASE,
        ),
      ],
    },
  };
}
