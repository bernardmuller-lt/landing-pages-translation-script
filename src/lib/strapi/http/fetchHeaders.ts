import { fetchFromStrapi } from "./client.js";
import type { HeaderData } from "../types/header.js";

export interface HeaderAPIResponse {
  data: HeaderData[];
}

export interface FetchHeadersOptions {
  locale: string;
  environment: string;
  slug?: string;
}

export async function fetchHeaders(
  options: FetchHeadersOptions,
): Promise<HeaderData[]> {
  const { locale, environment, slug = "ai-chat-header" } = options;

  console.log(`\nFetching headers from Strapi CMS...`);
  console.log(`  Slug: ${slug}`);
  console.log(`  Locale: ${locale}`);
  console.log(`  Environment: ${environment}`);

  const filters: any = {
    environment: {
      $eq: environment,
    },
    slug: {
      $eq: slug,
    },
  };

  try {
    const response = await fetchFromStrapi<HeaderAPIResponse>("/headers", {
      locale,
      populate: "*",
      status: "published",
      filters,
    });

    if (!response?.data || response.data.length === 0) {
      console.warn(`\n⚠️  No published header found for locale: ${locale}`);
      return [];
    }

    console.log(`\n✓ Found ${response.data.length} header(s)\n`);
    return response.data;
  } catch (error) {
    console.error(`\n❌ Error fetching headers:`, error);
    throw error;
  }
}
