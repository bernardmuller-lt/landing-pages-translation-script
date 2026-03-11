import OpenAI from "openai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const TRANSLATION_SYSTEM_PROMPT = `
  You are an expert localization assistant that integrates directly into a feature-based translation workflow. Your sole purpose is to translate UI/marketing copy from English into a specified target language and return the result as a single, valid JSON object.

  ARCHITECTURE CONTEXT
  This project uses a CMS-backed translation architecture. The input is a flat JSON object where:
  - Keys are dot-notation paths pointing to fields inside Strapi CMS documents (pages, headers, footers)
  - Values are the English strings to translate
  - Key format: {contentType}.{slug}.{fieldPath} (e.g. "pages.home.sections.0.title")

  CRITICAL RULES
  - PRESERVE ALL JSON KEYS EXACTLY — never modify, rename, or reorder keys
  - TRANSLATE ONLY VALUES — keys remain as-is
  - MAINTAIN VALID JSON — output must be valid, production-ready JSON
  - PRESERVE ALL FORMATTING:
    - HTML-like tags: <bold>text</bold>, <underline>text</underline>, etc.
    - Placeholders: {{LLM_NAME}}, {{variable}}, etc.
    - Punctuation and capitalization style appropriate for SaaS/AI product
    - Line breaks and whitespace in string values
  - DO NOT add, remove, or rename JSON keys
  - DO NOT add explanations, comments, or additional text outside the JSON
  - Your entire response must be ONLY the translated JSON object — nothing else

  QUALITY STANDARDS
  - Target: 95–100% professional equivalence with human localization
  - Tone: Modern SaaS/AI product (conversational, professional, friendly)
  - Context: UI text, landing page copy, marketing content, authentication flows
  - Use natural, idiomatic language for the target language
  - Consider cultural nuances and regional preferences

  LANGUAGE-SPECIFIC GUIDELINES
  - de (German): Use formal register (Sie)
  - es (Spanish): Use standard, broadly neutral Spanish
  - ko-KR (Korean): Use polite/formal register
  - pt-BR (Portuguese, Brazil): Use Brazilian Portuguese conventions
  - fr (French): Use standard metropolitan French
  - nl (Dutch): Use standard Dutch
  - it (Italian): Use standard Italian
  - ja-JP (Japanese): Use polite register (です/ます)
  - pl (Polish): Use standard Polish
  - da-DK (Danish): Use standard Danish
  - nb-NO (Norwegian): Use Bokmål

  OUTPUT FORMAT
  Return ONLY a single JSON object — the translated version of the input. No markdown fences, no comments, no labels, no explanation. Just the raw JSON. NO MISTAKES!
`.trim();

function getLLMConfig(): { baseURL?: string; apiKey: string } {
  const baseURL = process.env.LLM_BASE_URL || undefined;
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    console.warn(
      "Warning: LLM_API_KEY not set. This may cause errors with cloud providers.",
    );
  }

  return {
    baseURL,
    apiKey: apiKey || "not-needed", // Fallback for local endpoints
  };
}

export function createLLMClient(): OpenAI {
  const { baseURL, apiKey } = getLLMConfig();

  return new OpenAI({
    baseURL,
    apiKey,
  });
}

export async function chatCompletion(
  messages: ChatMessage[],
  model: string,
): Promise<string> {
  const client = createLLMClient();

  const response = await client.chat.completions.create({
    model,
    messages,
  });

  return response.choices[0].message.content || "";
}

export function buildTranslationMessages(
  translations: Record<string, string>,
  targetLocale: string,
): ChatMessage[] {
  const protectedTranslations = protectTerms(translations);
  const jsonString = JSON.stringify(protectedTranslations, null, 2);

  const userPrompt = `Target language: ${targetLocale}

Input JSON to translate:

${jsonString}`;

  return [
    {
      role: "system",
      content: TRANSLATION_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];
}

export const PROTECTED_TERMS: readonly string[] = [
  "Palatine Global Capital LLC",
  "Claude Sonnet",
  "Gemini Pro",
  "ChatGPT",
  "GPT-4o",
  "GPT-5",
  "GPT-4",
  "DeepSeek",
  "AI Chat",
  "aichatapp.ai",
  "OpenAI",
  "Anthropic",
  "Gemini",
  "Claude",
  "Google",
  "Grok",
  "Flux",
  "PDF",
  "VAT",
];


function protectTerms(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      PROTECTED_TERMS.reduce((s, term, i) => s.split(term).join(`{{__PT${i}__}}`), v),
    ]),
  );
}


function restoreTerms(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      PROTECTED_TERMS.reduce((s, term, i) => s.split(`{{__PT${i}__}}`).join(term), v),
    ]),
  );
}


function unescapeValues(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v.replace(/\\"/g, '"')])
  );
}

function parseJsonResponse(raw: string): Record<string, string> {
  let text = raw.trim();

  // Strip markdown fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Remove a leading comment line (e.g. // de_de - German)
  text = text.replace(/^\/\/[^\n]*\n/, "").trim();

  // First attempt: parse as-is
  try {
    return restoreTerms(unescapeValues(JSON.parse(text)));
  } catch {
    // Fixup 1: some models output {\"key\": \"value\"} with literal backslash-quotes
    // instead of valid JSON. Strip those before re-attempting.
    const fixed1 = text.replace(/\\"/g, '"');
    try {
      return restoreTerms(unescapeValues(JSON.parse(fixed1)));
    } catch {
      // Fixup 2: remove duplicate trailing brace }} → }
      const fixed2 = text.replace(/\}\s*\}(\s*)$/, "}$1");
      try {
        return restoreTerms(unescapeValues(JSON.parse(fixed2)));
      } catch {
        throw new Error(
          `Failed to parse LLM response as JSON. Raw response:\n${raw}`,
        );
      }
    }
  }
}

export async function translateToLocale(
  translations: Record<string, string>,
  targetLocale: string,
  model: string,
): Promise<Record<string, string>> {
  const messages = buildTranslationMessages(translations, targetLocale);
  const response = await chatCompletion(messages, model);
  return parseJsonResponse(response);
}
