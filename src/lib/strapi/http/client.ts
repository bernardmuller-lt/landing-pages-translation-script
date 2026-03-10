import qs from "qs";

export interface StrapiFilterOperator<T> {
  $eq?: T;
  $ne?: T;
  $in?: T[];
  $notIn?: T[];
  $lt?: T;
  $lte?: T;
  $gt?: T;
  $gte?: T;
  $contains?: T;
  $notContains?: T;
  $startsWith?: T;
  $endsWith?: T;
  $null?: boolean;
  $notNull?: boolean;
}

export interface StrapiFilters {
  [key: string]:
    | StrapiFilterOperator<string>
    | StrapiFilterOperator<number>
    | StrapiFilterOperator<boolean>;
}

export interface StrapiQueryParams {
  locale?: string;
  populate?: string;
  status?: string;
  filters?: StrapiFilters;
}

function getCMSApiToken(): string {
  const token = process.env.CMS_API_TOKEN;
  if (!token) {
    throw new Error("CMS_API_TOKEN environment variable is not set");
  }
  return token;
}

function getCMSApiUrl(): string {
  const url = process.env.CMS_API_URL;
  if (!url) {
    throw new Error("CMS_API_URL environment variable is not set");
  }
  return url;
}

export async function fetchFromStrapi<T>(
  endpoint: string,
  params?: StrapiQueryParams,
): Promise<T> {
  const baseUrl = getCMSApiUrl();
  const token = getCMSApiToken();

  const queryString = params
    ? qs.stringify(params, {
        encodeValuesOnly: true,
        arrayFormat: "brackets",
      })
    : "";

  const url = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Strapi API error: ${response.status} ${response.statusText}\n${errorText}`,
    );
  }

  const data = await response.json();
  return data as T;
}
