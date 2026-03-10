#!/usr/bin/env node

import "dotenv/config";
import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";
import { config, TARGET_LOCALES } from "./config.js";
import type { PageData } from "./lib/strapi/http/fetchPages.js";
import { applyTranslations } from "./lib/translations/applier.js";
import { formatForAPI } from "./lib/translations/apiFormatter.js";
import { stripNonMediaIds } from "./lib/translations/idStripper.js";

/**
 * Given a translation filename like "home-de_de.json", derive slug and locale.
 * Uses the known locale list so slugs with hyphens are handled correctly.
 */
function parseTranslationFilename(
  filename: string,
): { slug: string; locale: string } | null {
  const name = basename(filename, ".json");
  const locale = Object.keys(TARGET_LOCALES).find((l) =>
    name.endsWith(`-${l}`),
  );
  if (!locale) return null;
  const slug = name.slice(0, -(locale.length + 1)); // strip "-{locale}"
  return { slug, locale };
}

async function prepareSingleFile(
  slug: string,
  locale: string,
  kvFilePath: string,
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

  const sourceData: PageData = JSON.parse(await readFile(sourcePath, "utf-8"));
  const translations: Record<string, string> = JSON.parse(
    await readFile(kvFilePath, "utf-8"),
  );

  const translatedData = applyTranslations(sourceData, translations);
  const cleanedData = stripNonMediaIds(translatedData);
  const apiPayload = formatForAPI(cleanedData, locale);

  if (!existsSync(config.preparedOutputDir)) {
    await mkdir(config.preparedOutputDir, { recursive: true });
  }

  await writeFile(outputPath, JSON.stringify(apiPayload, null, 2), "utf-8");
  console.log(
    `  ✅  ${slug}/${locale} — ${Object.keys(translations).length} strings → ${outputPath}`,
  );
  return true;
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Translation Prepare                                  ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  // Single file: npm run apply -- output/translations/home-de_de.json
  const singleFilePath = process.argv[2];

  try {
    if (singleFilePath) {
      const parsed = parseTranslationFilename(singleFilePath);
      if (!parsed) {
        console.error(
          `\n❌ Cannot determine slug/locale from filename: ${singleFilePath}`,
        );
        console.error(
          "   Expected format: output/translations/{slug}-{locale}.json\n",
        );
        process.exit(1);
      }
      console.log(`\n📄 ${parsed.slug} / ${parsed.locale}`);
      const ok = await prepareSingleFile(
        parsed.slug,
        parsed.locale,
        singleFilePath,
      );
      if (ok) console.log("\n✅ Done!\n");
      else process.exit(1);
    } else {
      // All: find every {slug}-{locale}.json in translationsOutputDir
      if (!existsSync(config.translationsOutputDir)) {
        console.error(
          `\n❌ ${config.translationsOutputDir} not found. Run: npm run parse first.\n`,
        );
        process.exit(1);
      }

      const allFiles = await readdir(config.translationsOutputDir);
      const pairs = allFiles
        .map((f) =>
          parseTranslationFilename(
            join(config.translationsOutputDir, f),
          ),
        )
        .filter((p): p is { slug: string; locale: string } => p !== null);

      if (pairs.length === 0) {
        console.error(
          "\n❌ No translation files found. Run: npm run translate first.\n",
        );
        process.exit(1);
      }

      console.log(`\n📄 Preparing ${pairs.length} file(s)...\n`);
      let ok = 0;
      let failed = 0;
      for (const { slug, locale } of pairs) {
        const kvPath = join(
          config.translationsOutputDir,
          `${slug}-${locale}.json`,
        );
        const success = await prepareSingleFile(slug, locale, kvPath);
        success ? ok++ : failed++;
      }

      console.log(
        `\n📊 Done — ${ok} prepared, ${failed} failed.`,
      );
      if (failed > 0) process.exit(1);
      console.log("\n👉  Next: npm run upload\n");
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
