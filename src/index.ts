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
  .description("Configure CMS API credentials")
  .action(async () => {
    try {
      const apiUrl = await prompt("Enter CMS API URL: ");
      const apiToken = await prompt("Enter CMS API Token (hidden): ", true);

      if (!apiUrl || !apiToken) {
        console.error("\n❌ Both API URL and Token are required.");
        process.exit(1);
      }

      updateShellConfig(apiUrl.trim(), apiToken.trim());
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
  .action(async (options) => {
    try {
      await runPrepare({
        slugs: options.slug,
        locales: options.locale,
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
      await runValidate({
        slugs: options.slug,
        locales: options.locale,
      });
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

program.parse();
