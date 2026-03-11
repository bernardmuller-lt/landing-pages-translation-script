import { fetchFromStrapi } from "./client.js";
import type { FooterData } from "../types/footer.js";

export interface FooterAPIResponse {
  data: FooterData[];
}

export interface FetchFootersOptions {
  locale: string;
  environment: string;
  slug?: string;
}

export async function fetchFooters(
  options: FetchFootersOptions,
): Promise<FooterData[]> {
  const { locale, environment, slug = "ai-chat-footer" } = options;

  console.log(`\nFetching footers from Strapi CMS...`);
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
    const response = await fetchFromStrapi<FooterAPIResponse>("/footers", {
      locale,
      populate: "*",
      status: "published",
      filters,
    });

    if (!response?.data || response.data.length === 0) {
      console.warn(`\n⚠️  No published footer found for locale: ${locale}`);
      return [];
    }

    console.log(`\n✓ Found ${response.data.length} footer(s)\n`);
    return response.data;
  } catch (error) {
    console.error(`\n❌ Error fetching footers:`, error);
    throw error;
  }
}
