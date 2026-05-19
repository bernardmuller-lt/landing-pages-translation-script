import { compileHomePage } from "./compileHomePage.js";
import { compilePricingPage } from "./compilePricingPage.js";
import { compileAboutPage } from "./compileAboutPage.js";
import { compileContactPage } from "./compileContactPage.js";
import { compileLegalPage } from "./compileLegalPage.js";
import { compileFormsPage } from "./compileFormsPage.js";

type PageCompiler = (
  bundle: Record<string, any>,
  strapiLocale: string,
  environment: string,
  i18nLocale?: string,
) => Record<string, any>;

const compilers: Record<string, PageCompiler> = {
  home: compileHomePage,
  pricing: compilePricingPage,
  about: compileAboutPage,
  contact: compileContactPage,
  privacy: (bundle, locale, env, i18nLocale) => compileLegalPage("privacy", bundle, locale, env, i18nLocale),
  terms: (bundle, locale, env, i18nLocale) => compileLegalPage("terms", bundle, locale, env, i18nLocale),
  cookies: (bundle, locale, env, i18nLocale) => compileLegalPage("cookies", bundle, locale, env, i18nLocale),
  forms: compileFormsPage,
};

export function getPageCompiler(slug: string): PageCompiler | undefined {
  return compilers[slug];
}
