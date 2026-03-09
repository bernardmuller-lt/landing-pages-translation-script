#!/usr/bin/env node

import 'dotenv/config';
import { fetchPages } from './lib/strapi/http/fetchPages.js';
import { writePagesToFiles } from './lib/utils/fileWriter.js';
import { config } from './config.js';

/**
 * Main CLI script to fetch Strapi CMS content and save to JSON files
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Strapi CMS Content Fetch Script                     ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  try {
    // Validate environment variables
    if (!process.env.CMS_API_URL) {
      throw new Error('CMS_API_URL environment variable is not set. Please create a .env file.');
    }
    if (!process.env.CMS_API_TOKEN) {
      throw new Error('CMS_API_TOKEN environment variable is not set. Please create a .env file.');
    }

    // Fetch all pages from Strapi
    const pages = await fetchPages({
      identifier: config.identifier,
      locale: config.locale,
      environment: config.environment,
      // Optional: Uncomment to fetch specific pages only
      // slugs: Object.values(config.pagesSlugs),
    });

    if (pages.length === 0) {
      console.log('\n⚠️  No pages found. Exiting...\n');
      process.exit(0);
    }

    // Write pages to JSON files
    const filePaths = await writePagesToFiles(pages, config.outputDir);

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   Summary                                              ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`  Pages fetched: ${pages.length}`);
    console.log(`  Files written: ${filePaths.length}`);
    console.log(`  Output directory: ${config.outputDir}`);
    console.log('\n✅ Done!\n');
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();
