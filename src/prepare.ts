import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";
import { config, TARGET_LOCALES } from "./config.js";
import type { PageData } from "./lib/strapi/http/fetchPages.js";
import { applyTranslations } from "./lib/translations/applier.js";
import { formatForAPI } from "./lib/translations/apiFormatter.js";
import { transformPageData } from "./lib/strapi/schemas/pageDataSchema.js";

export interface PrepareOptions {
  /** Only prepare these slugs. Undefined = all discovered slugs. */
  slugs?: string[];
  /** Only prepare these locale codes. Undefined = all locales found in translationsOutputDir. */
  locales?: string[];
  environment?: "test" | "production";
}

/**
 * Given a translation filename like "home-ko-KR.json", derive slug and locale.
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

  const sourceData: PageData = JSON.parse(await readFile(sourcePath, "utf-8"));
  const translations: Record<string, string> = JSON.parse(
    await readFile(kvFilePath, "utf-8"),
  );

  const translatedData = applyTranslations(sourceData, translations);
  const cleanedData = transformPageData(translatedData);
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
    .filter((p): p is { slug: string; locale: string } => p !== null);

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

  for (const { slug, locale } of pairs) {
    const kvPath = join(config.translationsOutputDir, `${slug}-${locale}.json`);
    const success = await prepareSingleFile(slug, locale, kvPath, environment);
    success ? ok++ : failed++;
  }

  console.log(`\n📊 Done — ${ok} prepared, ${failed} failed.`);
  if (failed > 0) process.exit(1);
  console.log("\n👉  Next: chatai-script upload\n");
}
