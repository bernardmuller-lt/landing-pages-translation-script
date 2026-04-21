import { fetchFromStrapi } from "./client.js";
import type { OnboardingPageData } from "../types/onboardingPage.js";

export interface OnboardingPageAPIResponse {
	data: OnboardingPageData[];
}

export interface FetchOnboardingPagesOptions {
	locale: string;
	environment: string;
	identifier: string;
	slug?: string;
}

export async function fetchOnboardingPages(
	options: FetchOnboardingPagesOptions,
): Promise<OnboardingPageData[]> {
	const { locale, environment, identifier, slug } = options;

	console.log(`\nFetching onboarding pages from Strapi CMS...`);
	console.log(`  Identifier: ${identifier}`);
	console.log(`  Locale: ${locale}`);
	console.log(`  Environment: ${environment}`);
	if (slug) {
		console.log(`  Slug: ${slug}`);
	}

	const filters: any = {
		environment: {
			$eq: environment,
		},
		identifier: {
			$eq: identifier,
		},
	};


	try {
		const response = await fetchFromStrapi<OnboardingPageAPIResponse>(
			"/onboarding-pages",
			{
				locale,
				populate: "*",
				status: "draft",
				filters,
			},
		);
		console.log(response)

		if (!response?.data || response.data.length === 0) {
			console.warn(
				`\n⚠️  No published onboarding pages found for locale: ${locale}`,
			);
			return [];
		}

		console.log(`\n✓ Found ${response.data.length} onboarding page(s)\n`);
		return response.data;
	} catch (error) {
		console.error(`\n❌ Error fetching onboarding pages:`, error);
		throw error;
	}
}
