#!/usr/bin/env node

import "dotenv/config";
import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { config } from "./config.js";
import type { PageData } from "./lib/strapi/http/fetchPages.js";
import {
  extractTranslations,
  sortTranslations,
} from "./lib/translations/extractor.js";

async function parseSingleSlug(slug: string): Promise<number> {
  const inputPath = join(config.outputDir, `${slug}-${config.locale}.json`);
  const outputPath = join(config.translationsOutputDir, `${slug}.json`);

  if (!existsSync(inputPath)) {
    console.error(`  ❌ ${slug} — input not found: ${inputPath}`);
    return 0;
  }

  const fileContent = await readFile(inputPath, "utf-8");
  const pageData: PageData = JSON.parse(fileContent);
  const result = extractTranslations(pageData);

  if (result.stats.totalStrings === 0) {
    console.warn(`  ⚠️  ${slug} — no translatable strings found, skipping`);
    return 0;
  }

  if (!existsSync(config.translationsOutputDir)) {
    await mkdir(config.translationsOutputDir, { recursive: true });
  }

  const sortedTranslations = sortTranslations(result.translations);
  await writeFile(outputPath, JSON.stringify(sortedTranslations, null, 2), "utf-8");
  console.log(`  ✅  ${slug} — ${result.stats.totalStrings} strings → ${outputPath}`);
  return result.stats.totalStrings;
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Translation Parser                                   ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const slug = process.argv[2];

  try {
    if (slug) {
      // Single slug
      console.log(`\n📄 Parsing: ${slug}`);
      const count = await parseSingleSlug(slug);
      if (count > 0) console.log("\n✅ Done!\n");
    } else {
      // All: find every {slug}-en.json in outputDir
      if (!existsSync(config.outputDir)) {
        console.error(`\n❌ ${config.outputDir} not found. Run: npm run fetch first.\n`);
        process.exit(1);
      }
      const suffix = `-${config.locale}.json`;
      const allFiles = await readdir(config.outputDir);
      const slugs = allFiles
        .filter((f) => f.endsWith(suffix))
        .map((f) => f.slice(0, -suffix.length));

      if (slugs.length === 0) {
        console.error(`\n❌ No *${suffix} files found. Run: npm run fetch first.\n`);
        process.exit(1);
      }

      console.log(`\n📄 Parsing ${slugs.length} page(s): ${slugs.join(", ")}\n`);
      let total = 0;
      for (const s of slugs) total += await parseSingleSlug(s);
      console.log(`\n📊 Done — ${total} total strings extracted across ${slugs.length} page(s).\n`);
      console.log("👉  Next: npm run translate\n");
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
