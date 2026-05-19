import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import {
  cosmicConfig,
  COSMIC_LOCALES,
  PAGE_SLUGS,
  TOOLS_BASE,
  toStrapiLocale,
} from "./config.js";
import { readBundle } from "./bundleReader.js";
import { getPageCompiler } from "./compiler/registry.js";
import { compileToolPage } from "./compiler/compileToolPage.js";

export interface CosmicPdfOptions {
  locales?: string[];
  slugs?: string[];
  environment?: string;
  dryRun?: boolean;
}

export async function runCosmicPdf(options: CosmicPdfOptions = {}): Promise<void> {
  const environment = options.environment ?? cosmicConfig.environment;
  const dryRun = options.dryRun ?? false;

  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Cosmic-PDF Compiler                                  ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log(`\n   Environment: ${environment}`);
  console.log(`   Dry run:     ${dryRun}`);

  // Determine which locales to process
  const localesToProcess = options.locales ?? Object.keys(COSMIC_LOCALES);
  console.log(`   Locales:     ${localesToProcess.join(", ")}`);

  // Determine which slugs to process
  const requestedSlugs = options.slugs;
  const pageSlugsToProcess = requestedSlugs
    ? PAGE_SLUGS.filter((s) => requestedSlugs.includes(s))
    : [...PAGE_SLUGS];
  const toolSlugsToProcess = requestedSlugs
    ? TOOLS_BASE.filter((t) => requestedSlugs.includes(t.id))
    : [...TOOLS_BASE];

  const totalPages = pageSlugsToProcess.length + toolSlugsToProcess.length;
  const totalFiles = totalPages * localesToProcess.length;
  console.log(`   Pages:       ${totalPages} (${pageSlugsToProcess.length} landing + ${toolSlugsToProcess.length} tools)`);
  console.log(`   Total files: ${totalFiles}\n`);

  if (!existsSync(cosmicConfig.preparedOutputDir)) {
    await mkdir(cosmicConfig.preparedOutputDir, { recursive: true });
  }

  let ok = 0;
  let failed = 0;

  for (const i18nLocale of localesToProcess) {
    console.log(`\n📌 Locale: ${i18nLocale}`);

    let bundle: Record<string, any>;
    try {
      bundle = await readBundle(i18nLocale);
    } catch (err) {
      console.error(`  ❌ Failed to read bundle for ${i18nLocale}: ${err}`);
      failed += pageSlugsToProcess.length + toolSlugsToProcess.length;
      continue;
    }

    const strapiLocale = toStrapiLocale(i18nLocale);

    // Compile landing pages
    for (const slug of pageSlugsToProcess) {
      const compiler = getPageCompiler(slug);
      if (!compiler) {
        console.error(`  ❌ No compiler for slug: ${slug}`);
        failed++;
        continue;
      }

      try {
        const payload = compiler(bundle, strapiLocale, environment, i18nLocale);
        const filename = `cosmic-pdf-${slug}-${strapiLocale}.json`;
        const outputPath = join(cosmicConfig.preparedOutputDir, filename);

        if (dryRun) {
          console.log(`  🔍 ${slug}/${strapiLocale} (dry run)`);
          console.log(JSON.stringify(payload, null, 2));
        } else {
          await writeFile(outputPath, JSON.stringify(payload, null, 2), "utf-8");
          console.log(`  ✅ ${slug}/${strapiLocale} → ${filename}`);
        }
        ok++;
      } catch (err) {
        console.error(`  ❌ ${slug}/${strapiLocale}: ${err}`);
        failed++;
      }
    }

    // Compile tool pages
    for (const tool of toolSlugsToProcess) {
      try {
        const payload = compileToolPage(
          tool.id,
          tool.icon,
          bundle,
          strapiLocale,
          environment,
        );
        const filename = `cosmic-pdf-${tool.id}-${strapiLocale}.json`;
        const outputPath = join(cosmicConfig.preparedOutputDir, filename);

        if (dryRun) {
          console.log(`  🔍 ${tool.id}/${strapiLocale} (dry run)`);
          console.log(JSON.stringify(payload, null, 2));
        } else {
          await writeFile(outputPath, JSON.stringify(payload, null, 2), "utf-8");
          console.log(`  ✅ ${tool.id}/${strapiLocale} → ${filename}`);
        }
        ok++;
      } catch (err) {
        console.error(`  ❌ ${tool.id}/${strapiLocale}: ${err}`);
        failed++;
      }
    }
  }

  console.log(`\n📊 Done — ${ok} compiled, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}
