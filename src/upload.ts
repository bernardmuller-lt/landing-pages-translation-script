#!/usr/bin/env node

import "dotenv/config";
import { readFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { APIPayload } from "./lib/translations/apiFormatter.js";
import { validateUploadPayload } from "./lib/strapi/schemas/uploadSchema.js";
import { uploadPage } from "./lib/strapi/http/uploadPage.js";
import { config } from "./config.js";

async function uploadSingleFile(filePath: string): Promise<boolean> {
  if (!existsSync(filePath)) {
    console.error(`  ❌ File not found: ${filePath}`);
    return false;
  }

  const fileContent = await readFile(filePath, "utf-8");
  const payload: APIPayload = JSON.parse(fileContent);

  if (!validateUploadPayload(payload)) {
    console.error(`  ❌ Invalid payload in: ${filePath}`);
    return false;
  }

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
