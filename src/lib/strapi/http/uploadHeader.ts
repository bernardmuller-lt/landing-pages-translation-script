import type { HeaderAPIPayload } from "../schemas/headerDataSchema.js";

export interface UploadResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: any;
}

function getUploadApiUrl(): string {
  const url = process.env.UPLOAD_API_URL;
  if (!url) {
    throw new Error("UPLOAD_API_URL environment variable is not set");
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

export async function uploadHeader(
  payload: HeaderAPIPayload,
): Promise<UploadResponse> {
  const baseUrl = getUploadApiUrl();
  const apiKey = getUploadApiKey();
  const endpoint = `${baseUrl}/headers`;

  try {
    const response = await fetch(
      endpoint.concat(`?locale=${payload.data.locale}`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      },
    );

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
          url: endpoint,
          contentType: contentType || "unknown",
        },
        message: `Upload failed: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: data,
      message: "Upload successful",
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
