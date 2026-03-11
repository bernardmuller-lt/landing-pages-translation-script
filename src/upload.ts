#!/usr/bin/env node

import "dotenv/config";
import { readFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";
import { ZodError } from "zod";
import { validateAPIPayload } from "./lib/strapi/schemas/pageDataSchema.js";
import { validateHeaderAPIPayload } from "./lib/strapi/schemas/headerDataSchema.js";
import { validateFooterAPIPayload } from "./lib/strapi/schemas/footerDataSchema.js";
import { uploadPage } from "./lib/strapi/http/uploadPage.js";
import { uploadHeader } from "./lib/strapi/http/uploadHeader.js";
import { uploadFooter } from "./lib/strapi/http/uploadFooter.js";
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
 * Given a prepared filename like "home-ko-KR.json", "header-ai-chat-header-de.json", derive type, slug and locale.
 * Uses the known locale list so slugs with hyphens are handled correctly.
 */
function parsePreparedFilename(
  filename: string,
): { type: "page" | "header" | "footer"; slug: string; locale: string } | null {
  const name = basename(filename, ".json");
  const locale = Object.keys(TARGET_LOCALES).find((l) =>
    name.endsWith(`-${l}`),
  );
  if (!locale) return null;
  const slug = name.slice(0, -(locale.length + 1)); // strip "-{locale}"

  // Detect content type from prefix
  if (slug.startsWith("header-")) {
    return { type: "header", slug, locale };
  } else if (slug.startsWith("footer-")) {
    return { type: "footer", slug, locale };
  } else {
    return { type: "page", slug, locale };
  }
}

async function uploadSingleFile(filePath: string): Promise<boolean> {
  if (!existsSync(filePath)) {
    console.error(`  ❌ File not found: ${filePath}`);
    return false;
  }

  try {
    const fileContent = await readFile(filePath, "utf-8");
    const parsedJSON = JSON.parse(fileContent);

    // Detect content type from filename
    const parsed = parsePreparedFilename(basename(filePath));
    const contentType = parsed?.type || "page";

    let payload: any;
    let result: any;

    if (contentType === "header") {
      // Validate and upload header
      payload = validateHeaderAPIPayload(parsedJSON);
      process.stdout.write(
        `  ⏳ header:${payload.data.slug}/${payload.data.locale} ... `,
      );
      result = await uploadHeader(payload);
    } else if (contentType === "footer") {
      // Validate and upload footer
      payload = validateFooterAPIPayload(parsedJSON);
      process.stdout.write(
        `  ⏳ footer:${payload.data.slug}/${payload.data.locale} ... `,
      );
      result = await uploadFooter(payload);
    } else {
      // Validate and upload page
      payload = validateAPIPayload(parsedJSON);
      process.stdout.write(
        `  ⏳ page:${payload.data.slug}/${payload.data.locale} ... `,
      );
      result = await uploadPage(payload);
    }

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
    .filter((item): item is { filename: string; parsed: { type: "page" | "header" | "footer"; slug: string; locale: string } } =>
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
