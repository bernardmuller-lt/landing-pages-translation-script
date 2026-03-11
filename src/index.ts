import { Command } from "commander";
import "dotenv/config";
import { fetchPages } from "./lib/strapi/http/fetchPages.js";
import { writePagesToFiles } from "./lib/utils/fileWriter.js";
import { config, TARGET_LOCALES } from "./config.js";
import { prompt, updateShellConfig } from "./lib/utils/shell.js";
import { runTranslate } from "./translate.js";
import { runPrepare } from "./prepare.js";
import { runParse } from "./parse.js";
import { runValidate } from "./validate.js";

const program = new Command();

function commaSeparatedList(value: string) {
  return value.split(",");
}

program
  .name("llm-translation-script")
  .description("CLI to translate Strapi CMS content from EN to other languages")
  .version("1.0.0");

program
  .command("init")
  .description("Configure CMS API credentials and LLM settings")
  .action(async () => {
    try {
      const apiUrl = await prompt("Enter CMS API URL: ");
      const apiToken = await prompt("Enter CMS API Token (hidden): ", true);

      if (!apiUrl || !apiToken) {
        console.error("\n❌ Both API URL and Token are required.");
        process.exit(1);
      }

      const llmApiKey = await prompt("Enter LLM API Key (hidden): ", true);
      const llmModel = await prompt("Enter LLM Model (e.g. gpt-4o-mini): ");

      if (!llmApiKey || !llmModel) {
        console.error("\n❌ Both LLM API Key and Model are required.");
        process.exit(1);
      }

      updateShellConfig({
        AI_CHAT_CMS_API_URL: apiUrl.trim(),
        AI_CHAT_CMS_API_TOKEN: apiToken.trim(),
        LLM_API_KEY: llmApiKey.trim(),
        LLM_MODEL: llmModel.trim(),
      });
    } catch (error) {
      console.error("\n❌ Configuration failed:", error);
      process.exit(1);
    }
  });

program
  .command("fetch")
  .description("Fetch content from Strapi CMS")
  .option(
    "-s, --slug <slugs...>",
    "specific slug(s) to fetch, comma separated",
    commaSeparatedList,
  )
  .option("-l, --locale <locale>", "locale to fetch", config.locale)
  .action(async (options) => {
    const slugs = options.slug;
    const locale = options.locale;
    const fetchAll = !slugs || slugs.length === 0;

    try {
      const apiUrl = process.env.AI_CHAT_CMS_API_URL || process.env.CMS_API_URL;
      const apiToken =
        process.env.AI_CHAT_CMS_API_TOKEN || process.env.CMS_API_TOKEN;

      if (!apiUrl) {
        throw new Error(
          "API URL is not configured. Please run 'chatai-script init' first or set CMS_API_URL in .env file.",
        );
      }
      if (!apiToken) {
        throw new Error(
          "API Token is not configured. Please run 'chatai-script init' first or set CMS_API_TOKEN in .env file.",
        );
      }

      process.env.CMS_API_URL = apiUrl;
      process.env.CMS_API_TOKEN = apiToken;

      const pages = await fetchPages({
        identifier: config.identifier,
        locale: locale,
        environment: config.environment,
        slugs: fetchAll ? undefined : slugs,
      });

      if (pages.length === 0) {
        if (fetchAll) {
          console.log("\n⚠️  No pages found in Strapi CMS.");
        } else {
          console.log(
            `\n⚠️  Page(s) "${slugs.join(", ")}" not found in Strapi CMS.`,
          );
          console.log("Make sure the page exists and is published.");
        }
        console.log("");
        process.exit(0);
      }

      const filePaths = await writePagesToFiles(pages, config.outputDir);

      console.log(`  Pages fetched: ${filePaths.length}`);
      filePaths.forEach((p) => console.log(`  ✓ ${p}`));
      console.log(`  Output directory: ${config.outputDir}`);
      console.log("\n✅ Done!\n");
    } catch (error) {
      console.error("\n❌ Fatal error:", error);
      process.exit(1);
    }
  });

program
  .command("parse")
  .description("Parse fetched content into translatable strings")
  .option(
    "-s, --slug <slugs...>",
    "specific slug(s) to parse, comma separated",
    commaSeparatedList,
  )
  .action(async (options) => {
    try {
      await runParse({ slugs: options.slug });
    } catch (error) {
      console.error("\n❌ Fatal error:", error);
      process.exit(1);
    }
  });

program
  .command("translate")
  .description("Translate parsed content using an LLM")
  .option(
    "-m, --model <model>",
    "LLM model to use (e.g. gpt-4o-mini)",
    process.env.LLM_MODEL,
  )
  .option(
    "-s, --slug <slugs...>",
    "specific slug(s) to translate, comma separated",
    commaSeparatedList,
  )
  .option(
    "-l, --locale <locales...>",
    `target locale(s) to translate, comma separated (valid: ${Object.keys(TARGET_LOCALES).join(", ")})`,
    commaSeparatedList,
  )
  .option(
    "-c, --concurrency <number>",
    "max parallel LLM requests (default: 5)",
    (v) => parseInt(v, 10),
  )
  .action(async (options) => {
    const model: string | undefined = options.model;
    if (!model) {
      console.error(
        "\n❌ LLM model is required. Use --model <model> or set LLM_MODEL in .env\n",
      );
      process.exit(1);
    }

    try {
      await runTranslate({
        model,
        slugs: options.slug,
        locales: options.locale,
        concurrency: options.concurrency,
      });
    } catch (error) {
      console.error("\n❌ Fatal error:", error);
      process.exit(1);
    }
  });

program
  .command("prepare")
  .description("Prepare translated content for CMS upload")
  .option(
    "-s, --slug <slugs...>",
    "specific slug(s) to prepare, comma separated",
    commaSeparatedList,
  )
  .option(
    "-l, --locale <locales...>",
    `target locale(s) to prepare, comma separated (valid: ${Object.keys(TARGET_LOCALES).join(", ")})`,
    commaSeparatedList,
  )
  .option(
    "-e, --env <environment>",
    "target environment for the API payload: test or production (default: test)",
    "test",
  )
  .action(async (options) => {
    if (options.env !== "test" && options.env !== "production") {
      console.error(`\n❌ Invalid environment "${options.env}". Must be "test" or "production".\n`);
      process.exit(1);
    }
    try {
      await runPrepare({
        slugs: options.slug,
        locales: options.locale,
        environment: options.env,
      });
    } catch (error) {
      console.error("\n❌ Fatal error:", error);
      process.exit(1);
    }
  });

program
  .command("validate")
  .description("Validate translated files have all required keys")
  .option(
    "-s, --slug <slugs...>",
    "specific slug(s) to validate, comma separated",
    commaSeparatedList,
  )
  .option(
    "-l, --locale <locales...>",
    `target locale(s) to validate, comma separated (valid: ${Object.keys(TARGET_LOCALES).join(", ")})`,
    commaSeparatedList,
  )
  .action(async (options) => {
    try {
      const ok = await runValidate({
        slugs: options.slug,
        locales: options.locale,
      });
      if (!ok) process.exit(1);
    } catch (error) {
      console.error("\n❌ Fatal error:", error);
      process.exit(1);
    }
  });

program
  .command("upload")
  .description("Upload content to Strapi CMS")
  .action(() => {
    console.log("Uploading content to Strapi CMS...");
    // TODO: Implement upload logic
  });

program
  .command("run")
  .description("Run the full pipeline: fetch → parse → translate → validate → prepare")
  .option(
    "-s, --slug <slugs...>",
    "slug(s) to process, comma separated",
    commaSeparatedList,
  )
  .option(
    "-l, --locale <locales...>",
    `locale(s) to process, comma separated (valid: ${Object.keys(TARGET_LOCALES).join(", ")})`,
    commaSeparatedList,
  )
  .option("-m, --model <model>", "LLM model to use (e.g. gpt-4o-mini)", process.env.LLM_MODEL)
  .option(
    "-c, --concurrency <number>",
    "max parallel LLM requests (default: 5)",
    (v) => parseInt(v, 10),
  )
  .option(
    "-e, --env <environment>",
    "target environment for the prepared API payload: test or production (default: test)",
    "test",
  )
  .action(async (options) => {
    const model: string | undefined = options.model;
    if (!model) {
      console.error("\n❌ LLM model is required. Use --model <model> or set LLM_MODEL in .env\n");
      process.exit(1);
    }
    if (options.env !== "test" && options.env !== "production") {
      console.error(`\n❌ Invalid environment "${options.env}". Must be "test" or "production".\n`);
      process.exit(1);
    }

    console.log(`\n   Slugs:       ${options.slug ? options.slug.join(", ") : "all"}`);
    console.log(`   Locales:     ${options.locale ? options.locale.join(", ") : "all"}`);
    console.log(`   Model:       ${model}`);
    console.log(`   Environment: ${options.env}\n`);

    try {
      // ── Step 1: Fetch ──────────────────────────────────────────────────────
      const apiUrl = process.env.AI_CHAT_CMS_API_URL || process.env.CMS_API_URL;
      const apiToken = process.env.AI_CHAT_CMS_API_TOKEN || process.env.CMS_API_TOKEN;
      if (!apiUrl) throw new Error("API URL not configured. Run 'init' or set CMS_API_URL.");
      if (!apiToken) throw new Error("API Token not configured. Run 'init' or set CMS_API_TOKEN.");
      process.env.CMS_API_URL = apiUrl;
      process.env.CMS_API_TOKEN = apiToken;

      const pages = await fetchPages({
        identifier: config.identifier,
        locale: config.locale,
        environment: config.environment,
        slugs: options.slug,
      });
      if (pages.length === 0) {
        console.warn("\n⚠️  No pages found in Strapi CMS.\n");
        process.exit(0);
      }
      await writePagesToFiles(pages, config.outputDir);
      console.log(`\n✅  Step 1/5 — Fetched ${pages.length} page(s)\n`);

      // ── Step 2: Parse ──────────────────────────────────────────────────────
      await runParse({ slugs: options.slug });
      console.log("✅  Step 2/5 — Parse complete\n");

      // ── Step 3: Translate ──────────────────────────────────────────────────
      await runTranslate({
        model,
        slugs: options.slug,
        locales: options.locale,
        concurrency: options.concurrency,
      });
      console.log("✅  Step 3/5 — Translate complete\n");

      // ── Step 4: Validate ───────────────────────────────────────────────────
      const valid = await runValidate({ slugs: options.slug, locales: options.locale });
      if (!valid) {
        console.error("\n❌  Pipeline aborted at validation. Fix missing keys then run prepare manually.\n");
        process.exit(1);
      }
      console.log("✅  Step 4/5 — Validation passed\n");

      // ── Step 5: Prepare ────────────────────────────────────────────────────
      await runPrepare({ slugs: options.slug, locales: options.locale, environment: options.env });
      console.log("✅  Step 5/5 — Prepare complete\n");

      // ── Upload ─────────────────────────────────────────────────────────────
      // TODO: call runUpload() here once upload.ts is refactored (Phase 1)
      console.log("🏁  Pipeline complete! Run 'upload' to push prepared files to Strapi.\n");
    } catch (error) {
      console.error("\n❌ Pipeline failed:", error);
      process.exit(1);
    }
  });

program.parse();
