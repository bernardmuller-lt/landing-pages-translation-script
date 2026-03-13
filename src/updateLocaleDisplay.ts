import { config, LOCALE_SHORT_MAP } from "./config.js";
import { fetchLocales } from "./lib/strapi/http/fetchLocales.js";
import { fetchFromStrapi } from "./lib/strapi/http/client.js";
import { updatePageLocaleDisplay } from "./lib/strapi/http/updatePageLocaleDisplay.js";
import type { APIResponse, AIChatDocument } from "./lib/strapi/types.js";

export interface UpdateLocaleDisplayOptions {
  slug?: string;
  env?: string;
  locale?: string;
}

/**
 * Maps a Strapi locale code to its short display form
 */
function getLocaleDisplay(locale: string): string {
  return LOCALE_SHORT_MAP[locale] || locale;
}

export async function runUpdateLocaleDisplay(
  options: UpdateLocaleDisplayOptions,
): Promise<void> {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Update Locale Display Field                         ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  try {
    // Fetch all supported locales from Strapi
    console.log("\n📡 Fetching supported locales from Strapi...");
    const allLocales = await fetchLocales();

    if (allLocales.length === 0) {
      console.error("\n❌ No locales found in Strapi");
      process.exit(1);
    }

    console.log(`✓ Found ${allLocales.length} locale(s): ${allLocales.join(", ")}`);

    // Filter locales if specified
    const targetLocales = options.locale
      ? allLocales.filter((l) => l === options.locale)
      : allLocales;

    if (targetLocales.length === 0) {
      console.error(
        `\n❌ Locale '${options.locale}' not found in Strapi. Available locales: ${allLocales.join(", ")}`,
      );
      process.exit(1);
    }

    console.log(`\n🎯 Target locale(s): ${targetLocales.join(", ")}`);
    if (options.slug) {
      console.log(`🎯 Target slug: ${options.slug}`);
    }
    if (options.env) {
      console.log(`🎯 Target environment: ${options.env}`);
    }

    let totalUpdated = 0;
    let totalFailed = 0;

    // Process each locale
    for (const locale of targetLocales) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`Processing locale: ${locale}`);
      console.log("=".repeat(60));

      // Build filters
      const filters: any = {
        identifier: {
          $eq: config.identifier,
        },
      };

      if (options.env) {
        filters.environment = {
          $eq: options.env,
        };
      }

      if (options.slug) {
        filters.slug = {
          $eq: options.slug,
        };
      }

      // Fetch pages for this locale
      try {
        const response = await fetchFromStrapi<APIResponse>("/pages", {
          locale,
          populate: "*",
          filters,
        });

        if (!response?.data || response.data.length === 0) {
          console.log(`  ⚠️  No pages found for locale: ${locale}`);
          continue;
        }

        console.log(`  ✓ Found ${response.data.length} page(s)`);

        const localeDisplay = getLocaleDisplay(locale);
        console.log(
          `  📝 Will update locale_display to: ${localeDisplay} ${locale !== localeDisplay ? `(mapped from ${locale})` : "(no mapping)"}`,
        );

        // Update each page
        for (const page of response.data) {
          const pageInfo = `${page.slug} (${page.documentId})`;

          try {
            const result = await updatePageLocaleDisplay(page, localeDisplay);

            if (result.success) {
              console.log(`    ✅  Updated: ${pageInfo}`);
              totalUpdated++;
            } else {
              console.error(`    ❌  Failed: ${pageInfo} - ${result.message}`);
              if (result.error) {
                console.error(`        Error: ${JSON.stringify(result.error, null, 2)}`);
              }
              totalFailed++;
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`    ❌  Error: ${pageInfo} - ${message}`);
            totalFailed++;
          }
        }
      } catch (error) {
        console.error(`  ❌  Failed to fetch pages for locale ${locale}:`, error);
        totalFailed++;
      }
    }

    // Summary
    console.log(`\n${"=".repeat(60)}`);
    console.log("Summary");
    console.log("=".repeat(60));
    console.log(`✅  Successfully updated: ${totalUpdated} page(s)`);
    if (totalFailed > 0) {
      console.log(`❌  Failed: ${totalFailed} page(s)`);
    }
    console.log("");

    if (totalFailed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}
