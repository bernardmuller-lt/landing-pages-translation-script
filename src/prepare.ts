import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";
import { config, TARGET_LOCALES } from "./config.js";
import type { PageData } from "./lib/strapi/http/fetchPages.js";
import type { HeaderData } from "./lib/strapi/types/header.js";
import type { FooterData } from "./lib/strapi/types/footer.js";
import type { OnboardingPageData } from "./lib/strapi/types/onboardingPage.js";
import { applyTranslations } from "./lib/translations/applier.js";
import { formatForAPI } from "./lib/translations/apiFormatter.js";
import { transformPageData } from "./lib/strapi/schemas/pageDataSchema.js";
import { transformHeaderData } from "./lib/strapi/schemas/headerDataSchema.js";
import { transformFooterData } from "./lib/strapi/schemas/footerDataSchema.js";
import { transformOnboardingPageData } from "./lib/strapi/schemas/onboardingPageDataSchema.js";

export interface PrepareOptions {
  /** Only prepare these slugs. Undefined = all discovered slugs. */
  slugs?: string[];
  /** Only prepare these locale codes. Undefined = all locales found in translationsOutputDir. */
  locales?: string[];
  environment?: "test" | "production";
}

/**
 * Given a translation filename like "home-ko-KR.json", "header-ai-chat-header-de.json", derive type, slug and locale.
 * Uses the known locale list so slugs with hyphens are handled correctly.
 */
type ContentType = "page" | "header" | "footer" | "onboarding-page";

function parseTranslationFilename(
  filename: string,
): { type: ContentType; slug: string; locale: string } | null {
  const name = basename(filename, ".json");
  const locale = Object.keys(TARGET_LOCALES).find((l) =>
    name.endsWith(`-${l}`),
  );
  if (!locale) return null;
  const slug = name.slice(0, -(locale.length + 1)); // strip "-{locale}"

  // Detect content type from prefix
  if (slug.startsWith("onboarding-page-")) {
    return { type: "onboarding-page", slug, locale };
  } else if (slug.startsWith("header-")) {
    return { type: "header", slug, locale };
  } else if (slug.startsWith("footer-")) {
    return { type: "footer", slug, locale };
  } else {
    return { type: "page", slug, locale };
  }
}

async function prepareSingleFile(
  type: ContentType,
  slug: string,
  locale: string,
  kvFilePath: string,
  environment?: string,
): Promise<boolean> {
  const sourcePath = join(config.outputDir, `${slug}-${config.locale}.json`);
  const outputPath = join(config.preparedOutputDir, `${slug}-${locale}.json`);

  if (!existsSync(kvFilePath)) {
    console.error(`  ❌ ${slug}/${locale} — KV file not found: ${kvFilePath}`);
    return false;
  }
  if (!existsSync(sourcePath)) {
    console.error(`  ❌ ${slug}/${locale} — source not found: ${sourcePath}`);
    return false;
  }

  const translations: Record<string, string> = JSON.parse(
    await readFile(kvFilePath, "utf-8"),
  );

  let apiPayload: any;

  if (type === "page") {
    const sourceData: PageData = JSON.parse(await readFile(sourcePath, "utf-8"));
    const translatedData = applyTranslations(sourceData, translations);
    const cleanedData = transformPageData(translatedData);
    apiPayload = formatForAPI(cleanedData, locale, environment);
  } else if (type === "header") {
    const sourceData: HeaderData = JSON.parse(await readFile(sourcePath, "utf-8"));
    const translatedData = applyTranslations(sourceData, translations);
    const cleanedData = transformHeaderData(translatedData);
    // Format for header API
    apiPayload = {
      data: {
        ...cleanedData,
        locale: locale,
        environment: environment || config.environment,
      },
    };
  } else if (type === "footer") {
    const sourceData: FooterData = JSON.parse(await readFile(sourcePath, "utf-8"));
    const translatedData = applyTranslations(sourceData, translations);
    const cleanedData = transformFooterData(translatedData);
    // Format for footer API
    apiPayload = {
      data: {
        ...cleanedData,
        locale: locale,
        environment: environment || config.environment,
      },
    };
  } else if (type === "onboarding-page") {
    const sourceData: OnboardingPageData = JSON.parse(await readFile(sourcePath, "utf-8"));
    const translatedData = applyTranslations(sourceData, translations);
    const cleanedData = transformOnboardingPageData(translatedData);
    apiPayload = {
      data: {
        ...cleanedData,
        locale: locale,
        environment: environment || config.environment,
      },
    };
  }

  if (!existsSync(config.preparedOutputDir)) {
    await mkdir(config.preparedOutputDir, { recursive: true });
  }

  await writeFile(outputPath, JSON.stringify(apiPayload, null, 2), "utf-8");
  console.log(
    `  ✅  ${type}:${slug}/${locale} — ${Object.keys(translations).length} strings → ${outputPath}`,
  );
  return true;
}

export async function runPrepare(options: PrepareOptions = {}): Promise<void> {
  const environment = options.environment ?? (config.environment as "test" | "production");

  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Translation Prepare                                  ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log(`\n   Environment: ${environment}`);

  if (!existsSync(config.translationsOutputDir)) {
    console.error(
      `\n❌ ${config.translationsOutputDir} not found. Run the parse command first.\n`,
    );
    process.exit(1);
  }

  const allFiles = await readdir(config.translationsOutputDir);
  let pairs = allFiles
    .map((f) =>
      parseTranslationFilename(join(config.translationsOutputDir, f)),
    )
    .filter((p): p is { type: ContentType; slug: string; locale: string } => p !== null);

  // Apply optional slug filter
  if (options.slugs) {
    const slugSet = new Set(options.slugs);
    pairs = pairs.filter((p) => slugSet.has(p.slug));
  }

  // Apply optional locale filter
  if (options.locales) {
    const localeSet = new Set(options.locales);
    pairs = pairs.filter((p) => localeSet.has(p.locale));
  }

  if (pairs.length === 0) {
    console.error(
      "\n❌ No matching translation files found. Run the translate command first.\n",
    );
    process.exit(1);
  }

  console.log(`\n📄 Preparing ${pairs.length} file(s)...\n`);
  let ok = 0;
  let failed = 0;

  for (const { type, slug, locale } of pairs) {
    const kvPath = join(config.translationsOutputDir, `${slug}-${locale}.json`);
    const success = await prepareSingleFile(type, slug, locale, kvPath, environment);
    success ? ok++ : failed++;
  }

  console.log(`\n📊 Done — ${ok} prepared, ${failed} failed.`);
  if (failed > 0) process.exit(1);
  console.log("\n👉  Next: chatai-script upload\n");
}
