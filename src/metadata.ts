import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { config, TARGET_LOCALES } from "./config.js";
import { fetchHeaders } from "./lib/strapi/http/fetchHeaders.js";
import { fetchFooters } from "./lib/strapi/http/fetchFooters.js";
import {
  extractHeaderTranslations,
  extractFooterTranslations,
  sortTranslations,
} from "./lib/translations/extractorMetadata.js";
import { runTranslate } from "./translate.js";
import { runValidate } from "./validate.js";
import { runPrepare } from "./prepare.js";
import { runUpload } from "./upload.js";

export interface MetadataOptions {
  model: string;
  locales?: string[];
  concurrency?: number;
  environment?: "test" | "production";
}

/**
 * Save fetched metadata to output directory
 */
async function saveMetadataToFile(
  type: "header" | "footer",
  slug: string,
  locale: string,
  data: any,
): Promise<string> {
  const filename = `${type}-${slug}-${locale}.json`;
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
  type: "header" | "footer",
  slug: string,
  data: any,
): Promise<number> {
  const extractFn =
    type === "header" ? extractHeaderTranslations : extractFooterTranslations;
  const result = extractFn(data);

  if (result.stats.totalStrings === 0) {
    console.warn(
      `  ⚠️  ${type}:${slug} — no translatable strings found, skipping`,
    );
    return 0;
  }

  if (!existsSync(config.translationsOutputDir)) {
    await mkdir(config.translationsOutputDir, { recursive: true });
  }

  const sortedTranslations = sortTranslations(result.translations);
  const filename = `${type}-${slug}.json`;
  const outputPath = join(config.translationsOutputDir, filename);

  await writeFile(
    outputPath,
    JSON.stringify(sortedTranslations, null, 2),
    "utf-8",
  );
  console.log(
    `  ✅  ${type}:${slug} — ${result.stats.totalStrings} strings → ${outputPath}`,
  );

  return result.stats.totalStrings;
}

export async function runMetadata(options: MetadataOptions): Promise<void> {
  const { model, concurrency, environment = "test" } = options;

  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Metadata Translation Pipeline (Headers & Footers)    ║");
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

    // ── Step 1: Fetch Headers and Footers ──────────────────────────────────
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║   Step 1/6 — Fetch                                     ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    const headers = await fetchHeaders({
      locale: config.locale,
      environment: config.environment,
      slug: config.metadataSlugs.header,
    });

    const footers = await fetchFooters({
      locale: config.locale,
      environment: config.environment,
      slug: config.metadataSlugs.footer,
    });

    if (headers.length === 0 && footers.length === 0) {
      console.warn("\n⚠️  No headers or footers found in Strapi CMS.\n");
      process.exit(0);
    }

    // Save fetched data
    const savedFiles: string[] = [];
    if (headers.length > 0) {
      const headerPath = await saveMetadataToFile(
        "header",
        config.metadataSlugs.header,
        config.locale,
        headers[0],
      );
      savedFiles.push(headerPath);
    }

    if (footers.length > 0) {
      const footerPath = await saveMetadataToFile(
        "footer",
        config.metadataSlugs.footer,
        config.locale,
        footers[0],
      );
      savedFiles.push(footerPath);
    }

    console.log(
      `\n✅  Step 1/6 — Fetched ${savedFiles.length} metadata file(s)\n`,
    );
    savedFiles.forEach((path) => console.log(`  ✓ ${path}`));

    // ── Step 2: Parse ──────────────────────────────────────────────────────
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║   Step 2/6 — Parse                                     ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    let totalStrings = 0;
    if (headers.length > 0) {
      totalStrings += await parseAndSaveTranslations(
        "header",
        config.metadataSlugs.header,
        headers[0],
      );
    }

    if (footers.length > 0) {
      totalStrings += await parseAndSaveTranslations(
        "footer",
        config.metadataSlugs.footer,
        footers[0],
      );
    }

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

    const slugs: string[] = [];
    if (headers.length > 0) slugs.push(`header-${config.metadataSlugs.header}`);
    if (footers.length > 0) slugs.push(`footer-${config.metadataSlugs.footer}`);

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
    console.log("║   🏁  Metadata Pipeline Complete!                      ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");
  } catch (error) {
    console.error("\n❌ Metadata pipeline failed:", error);
    process.exit(1);
  }
}
