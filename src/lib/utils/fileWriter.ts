import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { PageData } from '../strapi/http/fetchPages.js';

/**
 * Writes page data to a JSON file with format: [slug]-[locale].json
 */
export async function writePageToFile(
  page: PageData,
  outputDir: string
): Promise<string> {
  const fileName = `${page.slug}-${page.locale}.json`;
  const filePath = join(outputDir, fileName);

  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
    console.log(`✓ Created output directory: ${outputDir}`);
  }

  // Write JSON file with pretty formatting
  const jsonContent = JSON.stringify(page, null, 2);
  await writeFile(filePath, jsonContent, 'utf-8');

  return filePath;
}

/**
 * Writes multiple pages to JSON files
 */
export async function writePagesToFiles(
  pages: PageData[],
  outputDir: string
): Promise<string[]> {
  const filePaths: string[] = [];

  console.log(`\nWriting ${pages.length} page(s) to JSON files...`);

  for (const page of pages) {
    try {
      const filePath = await writePageToFile(page, outputDir);
      console.log(`  ✓ ${page.slug}-${page.locale}.json`);
      filePaths.push(filePath);
    } catch (error) {
      console.error(`  ❌ Failed to write ${page.slug}-${page.locale}.json:`, error);
      throw error;
    }
  }

  return filePaths;
}
