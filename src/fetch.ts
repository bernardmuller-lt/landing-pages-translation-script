#!/usr/bin/env node

import "dotenv/config";
import { fetchPages } from "./lib/strapi/http/fetchPages.js";
import { writePagesToFiles } from "./lib/utils/fileWriter.js";
import { config } from "./config.js";

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Strapi CMS Content Fetch Script                     ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const slug = process.argv[2];
  const fetchAll = !slug;

  if (fetchAll) {
    console.log("\n📄 No slug provided — fetching ALL pages");
  } else {
    console.log(`\n📄 Fetching page: ${slug}`);
  }

  try {
    if (!process.env.CMS_API_URL) {
      throw new Error(
        "CMS_API_URL environment variable is not set. Please create a .env file.",
      );
    }
    if (!process.env.CMS_API_TOKEN) {
      throw new Error(
        "CMS_API_TOKEN environment variable is not set. Please create a .env file.",
      );
    }

    const pages = await fetchPages({
      identifier: config.identifier,
      locale: config.locale,
      environment: config.environment,
      slugs: fetchAll ? undefined : [slug],
    });

    if (pages.length === 0) {
      if (fetchAll) {
        console.log("\n⚠️  No pages found in Strapi CMS.");
      } else {
        console.log(`\n⚠️  Page "${slug}" not found in Strapi CMS.`);
        console.log("Make sure the page exists and is published.");
      }
      console.log("");
      process.exit(0);
    }

    const filePaths = await writePagesToFiles(pages, config.outputDir);

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║   Summary                                              ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log(`  Pages fetched: ${filePaths.length}`);
    filePaths.forEach((p) => console.log(`  ✓ ${p}`));
    console.log(`  Output directory: ${config.outputDir}`);
    console.log("\n✅ Done!\n");
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
