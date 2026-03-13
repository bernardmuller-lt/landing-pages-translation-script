import type { AIChatDocument } from "../types.js";
import {
  transformPageData,
  type APIPayload,
} from "../schemas/pageDataSchema.js";

function getUploadApiUrl(): string {
  const url = process.env.CMS_API_URL;
  if (!url) {
    throw new Error("CMS_API_URL environment variable is not set");
  }
  return url;
}

function getUploadApiKey(): string {
  const key = process.env.UPLOAD_API_KEY;
  if (!key) {
    throw new Error("UPLOAD_API_KEY environment variable is not set");
  }
  return key;
}

export interface UpdatePageResponse {
  success: boolean;
  message?: string;
  error?: any;
}

/**
 * Updates a page in Strapi by sending the full page payload with locale_display injected.
 * Similar to uploadPage but uses PUT instead of POST.
 */
export async function updatePageLocaleDisplay(
  page: AIChatDocument,
  localeDisplay: string,
): Promise<UpdatePageResponse> {
  const endpoint = getUploadApiUrl();
  const apiKey = getUploadApiKey();

  try {
    // Transform the page data (strip IDs, reduce media to IDs, etc.)
    const transformedData = transformPageData({
      slug: page.slug,
      locale: page.locale,
      seo: page.seo,
      sections: page.sections,
      events: page.events,
    });

    // Build the complete API payload with locale_display injected
    const payload: APIPayload = {
      data: {
        environment: page.environment,
        identifier: page.identifier,
        slug: transformedData.slug,
        locale: transformedData.locale,
        locale_display: localeDisplay,
        seo: transformedData.seo,
        events: transformedData.events,
        sections: transformedData.sections,
      },
    };

    const url = `${endpoint}/pages/${page.documentId}?locale=${page.locale}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let data: any;
    try {
      if (isJson) {
        data = await response.json();
      } else {
        const textBody = await response.text();
        data = { message: textBody };
      }
    } catch (parseError) {
      data = { message: "Failed to parse response" };
    }

    if (!response.ok) {
      return {
        success: false,
        error: {
          status: response.status,
          statusText: response.statusText,
          body: data,
          url,
          contentType: contentType || "unknown",
        },
        message: `Update failed: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      message: "Update successful",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: "network",
        details: error,
        url: endpoint,
      },
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
