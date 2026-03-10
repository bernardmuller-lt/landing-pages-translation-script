#!/usr/bin/env node

/**
 * validate — checks that every locale translation file for every slug
 * contains all the same keys as the English source file.
 *
 * Source files  : output/translations/{slug}.json
 * Locale files  : output/translations/{slug}-{locale}.json
 *
 * Exits with code 1 if any file is missing or has missing keys.
 *
 * Run: npm run validate
 */

import "dotenv/config";
import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { config, TARGET_LOCALES } from "./config.js";

async function main(): Promise<void> {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Translation Validation                               ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const dir = config.translationsOutputDir;
  if (!existsSync(dir)) {
    console.error(`\n❌ ${dir} not found. Run: npm run parse -- <slug> first.\n`);
    process.exit(1);
  }

  const locales = Object.keys(TARGET_LOCALES);

  // Identify English source files: {slug}.json, excluding {slug}-{locale}.json
  const allFiles = await readdir(dir);
  const sourceFiles = allFiles
    .filter((f) => f.endsWith(".json"))
    .filter((f) => {
      const name = f.slice(0, -5);
      return !locales.some((l) => name.endsWith(`-${l}`));
    });

  if (sourceFiles.length === 0) {
    console.error("\n❌ No source files found. Run: npm run parse -- <slug> first.\n");
    process.exit(1);
  }

  const slugs = sourceFiles.map((f) => f.slice(0, -5));

  console.log(
    `\n📋 Validating ${slugs.length} slug(s) × ${locales.length} locales...\n`,
  );

  let hasErrors = false;

  for (const slug of slugs) {
    const sourcePath = join(dir, `${slug}.json`);
    const source: Record<string, string> = JSON.parse(
      await readFile(sourcePath, "utf-8"),
    );
    const sourceKeys = Object.keys(source);

    console.log(`📄  ${slug}  (${sourceKeys.length} source keys)`);

    for (const locale of locales) {
      const localeLabel = TARGET_LOCALES[locale];
      const localePath = join(dir, `${slug}-${locale}.json`);

      if (!existsSync(localePath)) {
        console.log(`     ❌  ${locale.padEnd(8)} (${localeLabel}) — FILE MISSING`);
        hasErrors = true;
        continue;
      }

      const localeData: Record<string, string> = JSON.parse(
        await readFile(localePath, "utf-8"),
      );
      const localeKeys = new Set(Object.keys(localeData));
      const missing = sourceKeys.filter((k) => !localeKeys.has(k));

      if (missing.length === 0) {
        const extraCount = localeKeys.size - sourceKeys.length;
        const extraNote = extraCount > 0 ? `  (+${extraCount} extra)` : "";
        console.log(
          `     ✅  ${locale.padEnd(8)} — ${localeKeys.size} keys — OK${extraNote}`,
        );
      } else {
        hasErrors = true;
        console.log(
          `     ❌  ${locale.padEnd(8)} — ${localeKeys.size}/${sourceKeys.length} — ${missing.length} MISSING`,
        );
        missing.slice(0, 5).forEach((k) => console.log(`          · ${k}`));
        if (missing.length > 5) {
          console.log(`          · ... and ${missing.length - 5} more`);
        }
      }
    }

    console.log("");
  }

  if (hasErrors) {
    console.error("❌  Validation failed. Fix missing keys before running apply/upload.");
    console.error(
      "    Tip: re-run npm run translate (or npm run translate with TRANSLATE_SLUGS=<slug>)",
    );
    process.exit(1);
  }

  console.log("✅  All locale files are complete.");
  console.log("\n👉  Next: npm run apply -- output/translations/<slug>-<locale>.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
