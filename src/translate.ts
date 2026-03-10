#!/usr/bin/env node

/**
 * Batch translate — fires all 12 locales in parallel for every slug.
 *
 * Env vars:
 *   LLM_MODEL        Required. e.g. gpt-4o-mini
 *   LLM_BASE_URL     Optional. Defaults to OpenAI.
 *   LLM_API_KEY      Required for cloud providers.
 *   TRANSLATE_SLUGS  Optional. Comma-separated list to re-run specific slugs only.
 *
 * Run: npm run translate
 */

import "dotenv/config";
import { readFile, writeFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { config, TARGET_LOCALES } from "./config.js";
import { translateToLocale } from "./lib/ai/llm.js";

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   AI Translation — Batch (all locales × all slugs)     ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const model = process.env.LLM_MODEL;
  if (!model) {
    console.error("\n❌ LLM_MODEL is not set in .env\n");
    process.exit(1);
  }

  const dir = config.translationsOutputDir;
  if (!existsSync(dir)) {
    console.error(`\n❌ ${dir} not found. Run: npm run parse -- <slug> first.\n`);
    process.exit(1);
  }

  const locales = Object.keys(TARGET_LOCALES);

  // Find English source files by excluding known locale-suffixed files
  const allFiles = await readdir(dir);
  const sourceFiles = allFiles
    .filter((f) => f.endsWith(".json"))
    .filter((f) => {
      const name = f.slice(0, -5); // strip .json
      return !locales.some((l) => name.endsWith(`-${l}`));
    });

  if (sourceFiles.length === 0) {
    console.error("\n❌ No source files found. Run: npm run parse -- <slug> first.\n");
    process.exit(1);
  }

  // Optional filter: TRANSLATE_SLUGS=home,support
  const slugFilter = process.env.TRANSLATE_SLUGS
    ? new Set(process.env.TRANSLATE_SLUGS.split(",").map((s) => s.trim()))
    : null;

  const slugs = sourceFiles
    .map((f) => f.slice(0, -5))
    .filter((s) => !slugFilter || slugFilter.has(s));

  if (slugs.length === 0) {
    console.error(
      `\n❌ No matching slugs. TRANSLATE_SLUGS=${process.env.TRANSLATE_SLUGS}\n`,
    );
    process.exit(1);
  }

  console.log(`\n🤖 Model:   ${model}`);
  console.log(`📁 Locales: ${locales.length} (fired in parallel per slug)`);
  console.log(`📄 Slugs:   ${slugs.join(", ")}\n`);

  const failedEntries: Array<{ slug: string; locale: string }> = [];
  let totalKeys = 0;

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const inputPath = join(dir, `${slug}.json`);
    const fileContent = await readFile(inputPath, "utf-8");
    const englishStrings: Record<string, string> = JSON.parse(fileContent);
    const keyCount = Object.keys(englishStrings).length;

    console.log(`\n📄  [${i + 1}/${slugs.length}] ${slug}  (${keyCount} strings)`);
    console.log(`     Firing ${locales.length} locale calls in parallel...`);

    const results = await Promise.allSettled(
      locales.map((locale) =>
        translateToLocale(englishStrings, locale, model).then((translated) => ({
          locale,
          translated,
        }))
      )
    );

    for (let j = 0; j < results.length; j++) {
      const locale = locales[j];
      const result = results[j];

      if (result.status === "fulfilled") {
        const { translated } = result.value;
        const outputPath = join(dir, `${slug}-${locale}.json`);
        await writeFile(outputPath, JSON.stringify(translated, null, 2), "utf-8");
        const count = Object.keys(translated).length;
        console.log(`     ✅  ${locale.padEnd(8)} — ${count} keys`);
        totalKeys += count;
      } else {
        const msg =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);
        console.error(`     ❌  ${locale.padEnd(8)} — ${msg}`);
        failedEntries.push({ slug, locale });
      }
    }
  }

  console.log(`\n📊  Done — ${totalKeys} total keys written`);

  if (failedEntries.length > 0) {
    console.warn(`\n⚠️  ${failedEntries.length} call(s) failed:`);
    failedEntries.forEach(({ slug, locale }) =>
      console.warn(`     - ${slug} / ${locale}`)
    );
    console.warn(
      "\n   For manual fallback: npm run parse -- <slug>  (after saving Copilot Chat output)",
    );
    process.exit(1);
  }

  console.log("\n👉  Next: npm run validate");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
