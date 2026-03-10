#!/usr/bin/env node

import "dotenv/config";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";
import { config } from "./config.js";
import type { PageData } from "./lib/strapi/http/fetchPages.js";
import { applyTranslations } from "./lib/translations/applier.js";
import { formatForAPI } from "./lib/translations/apiFormatter.js";

function showUsage() {
  console.log("\nUsage: npm run apply -- <locale> <path/to/kv-file>");
  console.log("\nExamples:");
  console.log("  npm run apply -- de output/translations/home_de.json");
  console.log("  npm run apply -- fr output/translations/support_fr.json");
  console.log("  npm run apply -- es /path/to/translations/onboarding_es.json");
  console.log("\nThe script will:");
  console.log("  1. Extract slug from KV filename (e.g., home_de.json → home)");
  console.log("  2. Read source page: output/[slug]-en.json");
  console.log("  3. Apply translations from KV file");
  console.log("  4. Format for API (post-data.json structure)");
  console.log("  5. Save to: output/prepared/[slug]-[locale].json\n");
}

function extractSlugFromFilename(filePath: string): string {
  const filename = basename(filePath, ".json");

  // Split by underscore and take first part
  const parts = filename.split("-");

  if (parts.length < 2) {
    throw new Error(
      `Invalid KV filename format: ${filename}\n` +
        "Expected format: [slug]_[locale].json (e.g., home_de.json)",
    );
  }

  return parts[0];
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Translation Prepare                                  ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const locale = process.argv[2];
  const kvFilePath = process.argv[3];

  if (!locale || !kvFilePath) {
    console.error("\n❌ Error: Missing required arguments\n");
    showUsage();
    process.exit(1);
  }

  try {
    const slug = extractSlugFromFilename(kvFilePath);
    console.log(`\n📄 Slug: ${slug}`);
    console.log(`🌍 Target locale: ${locale}`);

    const sourcePath = join(config.outputDir, `${slug}-${config.locale}.json`);
    const outputPath = join(config.preparedOutputDir, `${slug}_${locale}.json`);

    if (!existsSync(kvFilePath)) {
      console.error(`\n❌ Error: KV file not found: ${kvFilePath}\n`);
      process.exit(1);
    }

    if (!existsSync(sourcePath)) {
      console.error(`\n❌ Error: Source file not found: ${sourcePath}`);
      console.error(
        "Run the fetch command first: npm run fetch -- " + slug + "\n",
      );
      process.exit(1);
    }

    console.log(`📂 Source: ${sourcePath}`);
    console.log(`📝 Translations: ${kvFilePath}\n`);

    const sourceContent = await readFile(sourcePath, "utf-8");
    const sourceData: PageData = JSON.parse(sourceContent);

    const kvContent = await readFile(kvFilePath, "utf-8");
    const translations: Record<string, string> = JSON.parse(kvContent);

    const translationCount = Object.keys(translations).length;
    console.log(`Applying translations...`);
    console.log(`  📊 ${translationCount} translation(s) to apply`);

    const translatedData = applyTranslations(sourceData, translations);
    console.log(`  ✓ Applied translations`);

    console.log("\nFormatting for API...");
    const apiPayload = formatForAPI(translatedData, locale);
    console.log(`  ✓ Wrapped in API structure`);
    console.log(`  ✓ Updated locale to: ${locale}`);

    if (!existsSync(config.preparedOutputDir)) {
      await mkdir(config.preparedOutputDir, { recursive: true });
      console.log(`  ✓ Created directory: ${config.preparedOutputDir}`);
    }

    console.log("\nWriting output...");
    const jsonContent = JSON.stringify(apiPayload, null, 2);
    await writeFile(outputPath, jsonContent, "utf-8");
    console.log(`  ✓ ${outputPath}`);

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║   Summary                                              ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log(`  Translations applied: ${translationCount}`);
    console.log(`  Output file: ${outputPath}`);
    console.log(`  Ready for API submission!`);
    console.log("\n✅ Done!\n");
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
