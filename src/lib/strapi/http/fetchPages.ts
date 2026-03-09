import { fetchFromStrapi } from './client.js';
import type { APIResponse, AIChatDocument } from '../types.js';

export interface PageData {
  slug: string;
  locale: string;
  seo: AIChatDocument['seo'];
  sections: AIChatDocument['sections'];
  events: AIChatDocument['events'];
}

export interface FetchPagesOptions {
  identifier: string;
  locale: string;
  environment: string;
  slugs?: string[]; // Optional: fetch specific slugs only
}

/**
 * Fetches all pages from Strapi CMS
 * Returns array of page data with slug, locale, seo, sections, and events
 */
export async function fetchPages(options: FetchPagesOptions): Promise<PageData[]> {
  const { identifier, locale, environment, slugs } = options;

  console.log(`\nFetching pages from Strapi CMS...`);
  console.log(`  Identifier: ${identifier}`);
  console.log(`  Locale: ${locale}`);
  console.log(`  Environment: ${environment}`);
  if (slugs && slugs.length > 0) {
    console.log(`  Slugs: ${slugs.join(', ')}`);
  }

  const filters: any = {
    environment: {
      $eq: environment,
    },
    identifier: {
      $eq: identifier,
    },
  };

  // If specific slugs are provided, filter by them
  if (slugs && slugs.length > 0) {
    filters.slug = {
      $in: slugs,
    };
  }

  try {
    const response = await fetchFromStrapi<APIResponse>('/pages', {
      locale,
      populate: '*',
      status: 'published',
      filters,
    });

    if (!response?.data || response.data.length === 0) {
      console.warn(`\n⚠️  No published content found for locale: ${locale}`);
      return [];
    }

    console.log(`\n✓ Found ${response.data.length} page(s)\n`);

    // Transform the response data to PageData format
    const pages: PageData[] = response.data.map((pageData: AIChatDocument) => ({
      slug: pageData.slug,
      locale: pageData.locale,
      seo: pageData.seo,
      sections: pageData.sections,
      events: pageData.events,
    }));

    return pages;
  } catch (error) {
    console.error(`\n❌ Error fetching pages:`, error);
    throw error;
  }
}
