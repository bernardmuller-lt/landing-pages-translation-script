import { readFileSync } from "fs";
import { join } from "path";
import { cosmicConfig, toLocaleDisplay } from "../config.js";

/**
 * Map i18n locale codes to legal directory folder names where they differ.
 */
const LEGAL_LOCALE_MAP: Record<string, string> = {
  "pt-BR": "pt",
};

function toLegalLocale(i18nLocale: string): string {
  return LEGAL_LOCALE_MAP[i18nLocale] ?? i18nLocale;
}

/**
 * Parse a markdown file with YAML frontmatter (between --- delimiters).
 * Returns { frontmatter, content }.
 */
function parseFrontmatter(raw: string): {
  frontmatter: Record<string, string>;
  content: string;
} {
  const frontmatter: Record<string, string> = {};

  if (!raw.startsWith("---")) {
    return { frontmatter, content: raw.trim() };
  }

  const endIndex = raw.indexOf("---", 3);
  if (endIndex === -1) {
    return { frontmatter, content: raw.trim() };
  }

  const yamlBlock = raw.slice(3, endIndex).trim();
  for (const line of yamlBlock.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    frontmatter[key] = value;
  }

  const content = raw.slice(endIndex + 3).trim();
  return { frontmatter, content };
}

export function compileLegalPage(
  slug: string,
  _bundle: Record<string, any>,
  strapiLocale: string,
  environment: string,
  i18nLocale?: string,
): Record<string, any> {
  const locale = i18nLocale ?? strapiLocale;
  const legalLocale = toLegalLocale(locale);
  const filePath = join(cosmicConfig.legalDir, legalLocale, `${slug}.md`);
  const raw = readFileSync(filePath, "utf-8");
  const { frontmatter, content } = parseFrontmatter(raw);

  return {
    data: {
      environment,
      identifier: "cosmic-pdf",
      slug,
      locale: strapiLocale,
      locale_display: toLocaleDisplay(strapiLocale),
      seo: {
        title: frontmatter.title ?? slug,
        description: frontmatter.description ?? "",
      },
      sections: [
        {
          __component: "shared.legal",
          fe_component: "Legal",
          title: frontmatter.title ?? slug,
          content,
        },
      ],
    },
  };
}
