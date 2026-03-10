#!/usr/bin/env node

import "dotenv/config";
import { fetchPages } from "./lib/strapi/http/fetchPages.js";
import { writePagesToFiles } from "./lib/utils/fileWriter.js";
import { config } from "./config.js";

function showUsage() {
  console.log("\nUsage: npm run fetch -- <slug>");
  console.log("\nExamples:");
  console.log("  npm run fetch -- home");
  console.log("  npm run fetch -- support");
  console.log("  npm run fetch -- onboarding");
  console.log("\nThe script will fetch the specified page from Strapi CMS");
  console.log("and save it as [slug]-en.json in the output directory.\n");
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Strapi CMS Content Fetch Script                     ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const slug = process.argv[2];

  if (!slug) {
    console.error("\n❌ Error: Missing required argument <slug>\n");
    showUsage();
    process.exit(1);
  }

  console.log(`\n📄 Fetching page: ${slug}`);

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
      slugs: [slug], // Fetch only the specified slug
    });

    if (pages.length === 0) {
      console.log(`\n⚠️  Page "${slug}" not found in Strapi CMS.`);
      console.log("Make sure the page exists and is published.\n");
      process.exit(0);
    }

    const filePaths = await writePagesToFiles(pages, config.outputDir);

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║   Summary                                              ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log(`  Page slug: ${slug}`);
    console.log(`  File written: ${filePaths[0]}`);
    console.log(`  Output directory: ${config.outputDir}`);
    console.log("\n✅ Done!\n");
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
