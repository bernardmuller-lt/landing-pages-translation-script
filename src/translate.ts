#!/usr/bin/env node

import "dotenv/config";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { config } from "./config.js";
import { translateToLocale } from "./lib/ai/llm.js";

function showUsage() {
  console.log("\nUsage: npm run translate -- <slug> <locale> [model]");
  console.log("\nExamples:");
  console.log("  npm run translate -- home de_de gpt-4o-mini");
  console.log("  npm run translate -- support es_419 llama3.2:1b");
  console.log("  npm run translate -- onboarding fr_fr");
  console.log("\nSupported locales:");
  console.log(
    "  de_de (German), es_419 (Spanish, Latin America), ko_kr (Korean)",
  );
  console.log("  pt_br (Portuguese, Brazil), fr_fr (French), nl_nl (Dutch)");
  console.log("  it_it (Italian), ja_jp (Japanese), pl_pl (Polish)");
  console.log(
    "  da_dk (Danish), no_no (Norwegian), zh_cn (Chinese, Simplified)",
  );
  console.log("\nModel:");
  console.log(
    "  - Optional: can be passed as third argument or set via LLM_MODEL env var",
  );
  console.log("  - Examples: gpt-4o-mini, gpt-4o, llama3.2:1b, etc.");
  console.log(
    "\nThe script will read output/translations/[slug].json and translate",
  );
  console.log("all strings to the target locale using the configured LLM.\n");
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   AI Translation (LLM)                                 ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const slug = process.argv[2];
  const targetLocale = process.argv[3];
  const modelArg = process.argv[4];

  if (!slug || !targetLocale) {
    console.error("\n❌ Error: Missing required arguments\n");
    showUsage();
    process.exit(1);
  }

  const model = modelArg || process.env.LLM_MODEL;
  if (!model) {
    console.error("\n❌ Error: Model not specified\n");
    console.error("Please either:");
    console.error(
      "  1. Pass model as third argument: npm run translate -- home de_de gpt-4o-mini",
    );
    console.error("  2. Set LLM_MODEL in your .env file\n");
    process.exit(1);
  }

  console.log(`\n📄 Translating page: ${slug}`);
  console.log(`🌍 Target locale: ${targetLocale}`);
  console.log(`🤖 Model: ${model}`);

  const inputPath = join(config.translationsOutputDir, `${slug}.json`);
  const outputPath = join(
    config.translationsOutputDir,
    `${slug}-${targetLocale}.json`,
  );

  if (!existsSync(inputPath)) {
    console.error(`\n❌ Error: Input file not found: ${inputPath}`);
    console.error(
      "Run the parse command first: npm run parse -- " + slug + "\n",
    );
    process.exit(1);
  }

  console.log(`📂 Reading: ${inputPath}`);

  try {
    const fileContent = await readFile(inputPath, "utf-8");
    const englishTranslations: Record<string, string> = JSON.parse(fileContent);

    const stringCount = Object.keys(englishTranslations).length;
    console.log(`  ✓ Found ${stringCount} strings to translate\n`);

    console.log(`🤖 Calling LLM (${model})...`);
    console.log("⏳ This may take a moment for large translation sets...\n");

    const translatedStrings = await translateToLocale(
      englishTranslations,
      targetLocale,
      model,
    );

    const translatedCount = Object.keys(translatedStrings).length;
    if (translatedCount !== stringCount) {
      console.warn(
        `\n⚠️  Warning: Expected ${stringCount} translations but got ${translatedCount}`,
      );
    }

    if (!existsSync(config.translationsOutputDir)) {
      await mkdir(config.translationsOutputDir, { recursive: true });
      console.log(`✓ Created directory: ${config.translationsOutputDir}`);
    }

    console.log("Writing translations...");
    const jsonContent = JSON.stringify(translatedStrings, null, 2);
    await writeFile(outputPath, jsonContent, "utf-8");
    console.log(`  ✓ ${outputPath}`);

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║   Summary                                              ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log(`  Source strings: ${stringCount}`);
    console.log(`  Translated strings: ${translatedCount}`);
    console.log(`  Target locale: ${targetLocale}`);
    console.log(`  Model: ${model}`);
    console.log(`  Output file: ${outputPath}`);
    console.log("\n✅ Done!\n");
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    console.error("\nTroubleshooting:");
    console.error(
      "  1. Check LLM_BASE_URL in .env file (e.g., https://api.openai.com/v1)",
    );
    console.error("  2. Check LLM_API_KEY in .env file");
    console.error("  3. Verify the model is available at your endpoint");
    console.error("  4. Verify the input JSON file is valid");
    console.error(
      "  5. For local models (Ollama): ensure service is running\n",
    );
    process.exit(1);
  }
}

main();
