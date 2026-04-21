import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { config } from "./config.js";
import { fetchOnboardingPages } from "./lib/strapi/http/fetchOnboardingPages.js";
import {
  extractOnboardingPageTranslations,
  sortTranslations,
} from "./lib/translations/extractorOnboarding.js";
import { runTranslate } from "./translate.js";
import { runValidate } from "./validate.js";
import { runPrepare } from "./prepare.js";
import { runUpload } from "./upload.js";

export interface OnboardingOptions {
  model: string;
  locales?: string[];
  concurrency?: number;
  environment?: "test" | "production";
}

/**
 * Save fetched onboarding page data to output directory
 */
async function saveOnboardingToFile(
  slug: string,
  locale: string,
  data: any,
): Promise<string> {
  const filename = `onboarding-page-${slug}-${locale}.json`;
  const filePath = join(config.outputDir, filename);

  if (!existsSync(config.outputDir)) {
    await mkdir(config.outputDir, { recursive: true });
  }

  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  return filePath;
}

/**
 * Parse and save translations to translations directory
 */
async function parseAndSaveTranslations(
  slug: string,
  data: any,
): Promise<number> {
  const result = extractOnboardingPageTranslations(data);

  if (result.stats.totalStrings === 0) {
    console.warn(
      `  ⚠️  onboarding-page:${slug} — no translatable strings found, skipping`,
    );
    return 0;
  }

  if (!existsSync(config.translationsOutputDir)) {
    await mkdir(config.translationsOutputDir, { recursive: true });
  }

  const sortedTranslations = sortTranslations(result.translations);
  const filename = `onboarding-page-${slug}.json`;
  const outputPath = join(config.translationsOutputDir, filename);

  await writeFile(
    outputPath,
    JSON.stringify(sortedTranslations, null, 2),
    "utf-8",
  );
  console.log(
    `  ✅  onboarding-page:${slug} — ${result.stats.totalStrings} strings → ${outputPath}`,
  );

  return result.stats.totalStrings;
}

export async function runOnboarding(options: OnboardingOptions): Promise<void> {
  const { model, concurrency, environment = "test" } = options;

  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Onboarding Page Translation Pipeline                 ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  console.log(
    `\n   Locales:     ${options.locales ? options.locales.join(", ") : "all"}`,
  );
  console.log(`   Model:       ${model}`);
  console.log(`   Environment: ${environment}\n`);

  try {
    // Validate environment variables
    const apiUrl = process.env.AI_CHAT_CMS_API_URL || process.env.CMS_API_URL;
    const apiToken =
      process.env.AI_CHAT_CMS_API_TOKEN || process.env.CMS_API_TOKEN;

    if (!apiUrl) {
      throw new Error("API URL not configured. Run 'init' or set CMS_API_URL.");
    }
    if (!apiToken) {
      throw new Error(
        "API Token not configured. Run 'init' or set CMS_API_TOKEN.",
      );
    }

    process.env.CMS_API_URL = apiUrl;
    process.env.CMS_API_TOKEN = apiToken;

    const onboardingSlug = config.onboardingSlugs.onboardingPage;

    // ── Step 1: Fetch Onboarding Pages ────────────────────────────────────
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║   Step 1/6 — Fetch                                     ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    const pages = await fetchOnboardingPages({
      locale: config.locale,
      environment: config.environment,
      identifier: config.identifier,
      slug: onboardingSlug,
    });

    if (pages.length === 0) {
      console.warn("\n⚠️  No onboarding pages found in Strapi CMS.\n");
      process.exit(0);
    }

    // Save fetched data
    const savedFiles: string[] = [];
    const filePath = await saveOnboardingToFile(
      onboardingSlug,
      config.locale,
      pages[0],
    );
    savedFiles.push(filePath);

    console.log(
      `\n✅  Step 1/6 — Fetched ${savedFiles.length} onboarding page(s)\n`,
    );
    savedFiles.forEach((path) => console.log(`  ✓ ${path}`));

    // ── Step 2: Parse ──────────────────────────────────────────────────────
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║   Step 2/6 — Parse                                     ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    const totalStrings = await parseAndSaveTranslations(
      onboardingSlug,
      pages[0],
    );

    console.log(
      `\n✅  Step 2/6 — Extracted ${totalStrings} translatable strings\n`,
    );

    if (totalStrings === 0) {
      console.warn("⚠️  No translatable strings found. Exiting.\n");
      process.exit(0);
    }

    // ── Step 3: Translate ──────────────────────────────────────────────────
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║   Step 3/6 — Translate                                 ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    const slugs = [`onboarding-page-${onboardingSlug}`];

    await runTranslate({
      model,
      slugs,
      locales: options.locales,
      concurrency,
    });

    console.log("✅  Step 3/6 — Translation complete\n");

    // ── Step 4: Validate ───────────────────────────────────────────────────
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║   Step 4/6 — Validate                                  ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    const valid = await runValidate({
      slugs,
      locales: options.locales,
    });

    if (!valid) {
      console.error(
        "\n❌  Pipeline aborted at validation. Fix missing keys then run prepare manually.\n",
      );
      process.exit(1);
    }

    console.log("✅  Step 4/6 — Validation passed\n");

    // ── Step 5: Prepare ────────────────────────────────────────────────────
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║   Step 5/6 — Prepare                                   ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    await runPrepare({
      slugs,
      locales: options.locales,
      environment,
    });

    console.log("✅  Step 5/6 — Prepare complete\n");

    // ── Step 6: Upload ─────────────────────────────────────────────────────
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║   Step 6/6 — Upload                                    ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    await runUpload({
      slugs,
      locales: options.locales,
    });

    console.log("✅  Step 6/6 — Upload complete\n");

    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║   🏁  Onboarding Pipeline Complete!                    ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");
  } catch (error) {
    console.error("\n❌ Onboarding pipeline failed:", error);
    process.exit(1);
  }
}
