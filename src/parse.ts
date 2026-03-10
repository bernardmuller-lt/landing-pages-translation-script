#!/usr/bin/env node

import "dotenv/config";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { config } from "./config.js";
import type { PageData } from "./lib/strapi/http/fetchPages.js";
import {
  extractTranslations,
  sortTranslations,
} from "./lib/translations/extractor.js";

function showUsage() {
  console.log("\nUsage: npm run parse -- <slug>");
  console.log("\nExamples:");
  console.log("  npm run parse -- home");
  console.log("  npm run parse -- support");
  console.log("  npm run parse -- onboarding");
  console.log("\nThe script will read output/[slug]-en.json and extract all");
  console.log("translatable strings to output/translations/[slug].json\n");
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Translation Parser                                   ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const slug = process.argv[2];

  if (!slug) {
    console.error("\n❌ Error: Missing required argument <slug>\n");
    showUsage();
    process.exit(1);
  }

  console.log(`\n📄 Parsing page: ${slug}`);

  const inputPath = join(config.outputDir, `${slug}-${config.locale}.json`);
  const outputPath = join(config.translationsOutputDir, `${slug}.json`);

  if (!existsSync(inputPath)) {
    console.error(`\n❌ Error: Input file not found: ${inputPath}`);
    console.error(
      "Run the fetch command first: npm run fetch -- " + slug + "\n",
    );
    process.exit(1);
  }

  console.log(`📂 Reading: ${inputPath}\n`);

  try {
    const fileContent = await readFile(inputPath, "utf-8");
    const pageData: PageData = JSON.parse(fileContent);

    console.log("Extracting translations...");
    const result = extractTranslations(pageData);

    if (result.stats.seoStrings > 0) {
      console.log(`  ✓ SEO fields: ${result.stats.seoStrings} strings`);
    }

    let sectionIndex = 0;
    for (const [sectionType, count] of Object.entries(
      result.stats.sectionCounts,
    )) {
      if (count > 0) {
        console.log(
          `  ✓ Section ${sectionIndex} (${sectionType}): ${count} strings`,
        );
        sectionIndex++;
      }
    }

    if (result.stats.totalStrings === 0) {
      console.warn("\n⚠️  No translatable strings found in the page data.\n");
      process.exit(0);
    }

    const sortedTranslations = sortTranslations(result.translations);

    if (!existsSync(config.translationsOutputDir)) {
      await mkdir(config.translationsOutputDir, { recursive: true });
      console.log(`\n✓ Created directory: ${config.translationsOutputDir}`);
    }

    console.log("\nWriting translations...");
    const jsonContent = JSON.stringify(sortedTranslations, null, 2);
    await writeFile(outputPath, jsonContent, "utf-8");
    console.log(`  ✓ ${outputPath}`);

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║   Summary                                              ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log(`  Total strings extracted: ${result.stats.totalStrings}`);
    console.log(`  Output file: ${outputPath}`);
    console.log("\n✅ Done!\n");
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
