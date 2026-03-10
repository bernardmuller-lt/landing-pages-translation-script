import { Command } from "commander";
import "dotenv/config";
import { fetchPages } from "./lib/strapi/http/fetchPages.js";
import { writePagesToFiles } from "./lib/utils/fileWriter.js";
import { config } from "./config.js";
import { prompt, updateShellConfig } from "./lib/utils/shell.js";

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
  .description("Parse fetched content")
  .action(() => {
    console.log("Parsing fetched content...");
    // TODO: Implement parse logic
  });

program
  .command("translate")
  .description("Translate content")
  .action(() => {
    console.log("Translating content...");
    // TODO: Implement translate logic
  });

program
  .command("prepare")
  .description("Prepare content for upload")
  .action(() => {
    console.log("Preparing content for upload...");
    // TODO: Implement prepare logic
  });

program
  .command("validate")
  .description("Validate content")
  .action(() => {
    console.log("Validating content...");
    // TODO: Implement validate logic
  });

program
  .command("upload")
  .description("Upload content to Strapi CMS")
  .action(() => {
    console.log("Uploading content to Strapi CMS...");
    // TODO: Implement upload logic
  });

program.parse();
