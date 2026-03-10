#!/usr/bin/env node

import "dotenv/config";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import type { APIPayload } from "./lib/translations/apiFormatter.js";
import { validateUploadPayload } from "./lib/strapi/schemas/uploadSchema.js";
import { uploadPage } from "./lib/strapi/http/uploadPage.js";

function showUsage() {
  console.log("\nUsage: npm run upload -- <path/to/prepared-file>");
  console.log("\nExamples:");
  console.log("  npm run upload -- output/prepared/home-de.json");
  console.log("  npm run upload -- output/prepared/support-fr.json");
  console.log("  npm run upload -- output/prepared/onboarding-es.json");
  console.log("\nThe script will upload the prepared file to the CMS.\n");
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   CMS Upload                                           ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const filePath = process.argv[2];

  if (!filePath) {
    console.error("\n❌ Error: Missing required argument\n");
    showUsage();
    process.exit(1);
  }

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

    if (!existsSync(filePath)) {
      console.error(`\n❌ Error: File not found: ${filePath}\n`);
      process.exit(1);
    }

    console.log(`\n📂 Reading: ${filePath}`);

    const fileContent = await readFile(filePath, "utf-8");
    const payload: APIPayload = JSON.parse(fileContent);

    console.log("\nValidating payload...");
    if (!validateUploadPayload(payload)) {
      throw new Error(
        "Invalid payload format. Expected APIPayload structure matching post-data.json.",
      );
    }

    console.log(`  ✓ Valid payload structure`);
    console.log(`  ✓ Slug: ${payload.data.slug}`);
    console.log(`  ✓ Locale: ${payload.data.locale}`);
    console.log(`  ✓ Environment: ${payload.data.environment}`);
    console.log(`  ✓ Sections: ${payload.data.sections.length}`);

    console.log("\nUploading to CMS...");
    const result = await uploadPage(payload);

    if (result.success) {
      console.log("  ✓ Upload successful!");

      console.log(
        "\n╔════════════════════════════════════════════════════════╗",
      );
      console.log("║   Summary                                              ║");
      console.log("╚════════════════════════════════════════════════════════╝");
      console.log(`  Page: ${payload.data.slug}`);
      console.log(`  Locale: ${payload.data.locale}`);
      console.log(`  Identifier: ${payload.data.identifier}`);
      console.log(`  Status: ✅ Uploaded`);

      if (result.data) {
        console.log("\nResponse data:");
        console.log(JSON.stringify(result.data, null, 2));
      }

      console.log("\n✅ Done!\n");
    } else {
      console.error("  ❌ Upload failed");
      console.error(`\n${result.message}`);

      if (result.error) {
        console.error("\n📋 Error Details:");

        // Show HTTP status if available
        if (result.error.status) {
          console.error(
            `  Status: ${result.error.status} ${result.error.statusText}`,
          );
          console.error(`  Endpoint: ${result.error.url}`);
          console.error(`  Content-Type: ${result.error.contentType}`);
        }

        // Show response body
        if (result.error.body) {
          console.error("  Response:");
          if (typeof result.error.body === "object") {
            console.error(JSON.stringify(result.error.body, null, 2));
          } else {
            console.error(`  ${result.error.body}`);
          }
        }

        // Show network error details
        if (result.error.type === "network") {
          console.error(`  Network error accessing: ${result.error.url}`);
          if (result.error.details) {
            console.error(
              "  Details:",
              result.error.details instanceof Error
                ? result.error.details.message
                : result.error.details,
            );
          }
        }

        // Provide troubleshooting hints based on status code
        if (result.error.status === 405) {
          console.error("\n💡 Troubleshooting 405 Method Not Allowed:");
          console.error("  1. The endpoint might not accept POST requests");
          console.error("  2. Check if the UPLOAD_API_URL is correct");
          console.error(`     Current: ${process.env.UPLOAD_API_URL}`);
          console.error(
            "  3. Verify the API documentation for the correct endpoint",
          );
          console.error(
            "  4. The endpoint might require different authentication",
          );
        } else if (result.error.status === 401 || result.error.status === 403) {
          console.error("\n💡 Troubleshooting Authentication:");
          console.error("  1. Check if UPLOAD_API_KEY is correct");
          console.error("  2. Verify the API key has write permissions");
          console.error("  3. The API might require a different auth header");
        } else if (result.error.status === 404) {
          console.error("\n💡 Troubleshooting 404 Not Found:");
          console.error("  1. Check the endpoint URL in UPLOAD_API_URL");
          console.error(`     Current: ${process.env.UPLOAD_API_URL}/pages`);
          console.error("  2. The endpoint path might be different");
        }
      }

      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
main();
