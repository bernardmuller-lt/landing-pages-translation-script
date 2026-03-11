#!/usr/bin/env node

import "dotenv/config";
import { readFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";
import { ZodError } from "zod";
import { validateAPIPayload } from "./lib/strapi/schemas/pageDataSchema.js";
import { uploadPage } from "./lib/strapi/http/uploadPage.js";
import { config, TARGET_LOCALES } from "./config.js";

export interface UploadOptions {
  /** Only upload these slugs. Undefined = all discovered slugs. */
  slugs?: string[];
  /** Only upload these locale codes. Undefined = all locales found in preparedOutputDir. */
  locales?: string[];
  /** Upload a specific file path instead of filtering from preparedOutputDir. */
  filePath?: string;
}

/**
 * Given a prepared filename like "home-ko-KR.json", derive slug and locale.
 * Uses the known locale list so slugs with hyphens are handled correctly.
 */
function parsePreparedFilename(
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

async function uploadSingleFile(filePath: string): Promise<boolean> {
  if (!existsSync(filePath)) {
    console.error(`  ❌ File not found: ${filePath}`);
    return false;
  }

  try {
    const fileContent = await readFile(filePath, "utf-8");
    const parsedJSON = JSON.parse(fileContent);

    // Validate with Zod
    const payload = validateAPIPayload(parsedJSON);

    process.stdout.write(
      `  ⏳ ${payload.data.slug}/${payload.data.locale} ... `,
    );
    const result = await uploadPage(payload);

    if (result.success) {
      process.stdout.write("✅\n");
      return true;
    } else {
      process.stdout.write(`❌ ${result.message}\n`);
      if (result.error?.body) {
        console.error("    ", JSON.stringify(result.error.body));
      }
      return false;
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(`  ❌ Invalid payload in: ${filePath}`);
      console.error("    Validation errors:");
      error.issues.forEach((issue) => {
        console.error(`      - ${issue.path.join(".")}: ${issue.message}`);
      });
    } else if (error instanceof SyntaxError) {
      console.error(`  ❌ Invalid JSON in: ${filePath}`);
      console.error(`    ${error.message}`);
    } else {
      console.error(`  ❌ Error processing: ${filePath}`);
      console.error(`    ${error}`);
    }
    return false;
  }
}

export async function runUpload(options: UploadOptions = {}): Promise<void> {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   CMS Upload                                           ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  // Validate environment variables
  if (!process.env.UPLOAD_API_URL) {
    throw new Error(
      "UPLOAD_API_URL environment variable is not set. Please add it to your .env file.",
    );
  }
  if (!process.env.UPLOAD_API_KEY) {
    throw new Error(
      "UPLOAD_API_KEY environment variable is not set. Please add it to your .env file.",
    );
  }

  // Single file upload
  if (options.filePath) {
    console.log(`\n📂 Uploading: ${options.filePath}\n`);
    const ok = await uploadSingleFile(options.filePath);
    if (!ok) {
      throw new Error("Upload failed");
    }
    console.log("\n✅ Done!\n");
    return;
  }

  // Batch upload from preparedOutputDir
  if (!existsSync(config.preparedOutputDir)) {
    console.error(
      `\n❌ ${config.preparedOutputDir} not found. Run the prepare command first.\n`,
    );
    process.exit(1);
  }

  const allFiles = await readdir(config.preparedOutputDir);
  let filesToUpload = allFiles
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      filename: f,
      parsed: parsePreparedFilename(f),
    }))
    .filter((item): item is { filename: string; parsed: { slug: string; locale: string } } =>
      item.parsed !== null
    );

  // Apply optional slug filter
  if (options.slugs) {
    const slugSet = new Set(options.slugs);
    filesToUpload = filesToUpload.filter((item) => slugSet.has(item.parsed.slug));
  }

  // Apply optional locale filter
  if (options.locales) {
    const localeSet = new Set(options.locales);
    filesToUpload = filesToUpload.filter((item) => localeSet.has(item.parsed.locale));
  }

  if (filesToUpload.length === 0) {
    console.error(
      "\n❌ No prepared files found matching the criteria. Run the prepare command first.\n",
    );
    process.exit(1);
  }

  console.log(`\n📂 Uploading ${filesToUpload.length} file(s)...\n`);

  let ok = 0;
  let failed = 0;

  for (const { filename } of filesToUpload) {
    const success = await uploadSingleFile(
      join(config.preparedOutputDir, filename),
    );
    success ? ok++ : failed++;
  }

  console.log(`\n📊 Done — ${ok} uploaded, ${failed} failed.`);
  if (failed > 0) {
    throw new Error(`${failed} upload(s) failed`);
  }
  console.log("\n✅ All done!\n");
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   CMS Upload                                           ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const filePath = process.argv[2];

  try {
    if (!process.env.UPLOAD_API_URL) {
      throw new Error(
        "UPLOAD_API_URL environment variable is not set. Please add it to your .env file.",
      );
    }
    if (!process.env.UPLOAD_API_KEY) {
      throw new Error(
        "UPLOAD_API_KEY environment variable is not set. Please add it to your .env file.",
      );
    }

    if (filePath) {
      // Single file
      console.log(`\n📂 Uploading: ${filePath}`);
      const ok = await uploadSingleFile(filePath);
      if (!ok) process.exit(1);
      console.log("\n✅ Done!\n");
    } else {
      // All files in prepared dir
      if (!existsSync(config.preparedOutputDir)) {
        console.error(
          `\n❌ ${config.preparedOutputDir} not found. Run: npm run apply first.\n`,
        );
        process.exit(1);
      }
      const files = (await readdir(config.preparedOutputDir)).filter((f) =>
        f.endsWith(".json"),
      );
      if (files.length === 0) {
        console.error(
          "\n❌ No prepared files found. Run: npm run apply first.\n",
        );
        process.exit(1);
      }
      console.log(`\n📂 Uploading ${files.length} file(s)...\n`);
      let ok = 0;
      let failed = 0;
      for (const f of files) {
        const success = await uploadSingleFile(
          join(config.preparedOutputDir, f),
        );
        success ? ok++ : failed++;
      }
      console.log(`\n📊 Done — ${ok} uploaded, ${failed} failed.`);
      if (failed > 0) process.exit(1);
      console.log("\n✅ All done!\n");
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
