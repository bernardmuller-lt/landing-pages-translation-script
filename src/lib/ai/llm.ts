import OpenAI from "openai";

/**
 * LLM Integration for Translation
 *
 * This module provides functions to translate CMS content from English to various
 * target languages using any OpenAI-compatible LLM API (OpenAI, Ollama, etc.).
 * It integrates with the Strapi CMS translation workflow.
 */

/**
 * Chat message format for LLM API
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * System prompt for translation
 */
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
  - de_de (German): Use formal register (Sie)
  - es_419 (Spanish, Latin America): Use neutral Latin American Spanish
  - ko_kr (Korean): Use polite/formal register
  - pt_br (Portuguese, Brazil): Use Brazilian Portuguese conventions
  - fr_fr (French): Use standard metropolitan French
  - nl_nl (Dutch): Use standard Dutch
  - it_it (Italian): Use standard Italian
  - ja_jp (Japanese): Use polite register (です/ます)
  - pl_pl (Polish): Use standard Polish
  - da_dk (Danish): Use standard Danish
  - no_no (Norwegian): Use Bokmål
  - zh_cn (Chinese, Simplified): Use Simplified Chinese characters

  OUTPUT FORMAT
  Return ONLY a single JSON object — the translated version of the input. No markdown fences, no comments, no labels, no explanation. Just the raw JSON. NO MISTAKES!
`.trim();

/**
 * Get LLM configuration from environment variables
 */
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

/**
 * Creates an OpenAI-compatible LLM client
 *
 * @returns OpenAI client instance configured with LLM_BASE_URL and LLM_API_KEY
 */
export function createLLMClient(): OpenAI {
  const { baseURL, apiKey } = getLLMConfig();

  return new OpenAI({
    baseURL,
    apiKey,
  });
}

/**
 * Sends a chat completion request to the LLM
 *
 * @param messages - Array of chat messages
 * @param model - Model to use (e.g., "gpt-4o", "llama3.2:1b")
 * @returns The AI response content
 */
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

/**
 * Builds messages array for translation
 *
 * @param translations - The English key-value pairs to translate
 * @param targetLocale - Target locale code (e.g., "de_de", "es_419", "fr_fr")
 * @returns Array of chat messages
 */
export function buildTranslationMessages(
  translations: Record<string, string>,
  targetLocale: string,
): ChatMessage[] {
  const jsonString = JSON.stringify(translations, null, 2);

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

/**
 * Translates a set of strings to a target locale using the LLM
 *
 * @param translations - The English key-value pairs to translate
 * @param targetLocale - Target locale code (e.g., "de_de", "es_419", "fr_fr")
 * @param model - Model to use (e.g., "gpt-4o", "llama3.2:1b")
 * @returns The translated key-value pairs as JSON
 */
export async function translateToLocale(
  translations: Record<string, string>,
  targetLocale: string,
  model: string,
): Promise<Record<string, string>> {
  const messages = buildTranslationMessages(translations, targetLocale);
  const response = await chatCompletion(messages, model);

  // Parse the JSON response
  try {
    const translatedJson = JSON.parse(response);
    return translatedJson;
  } catch (error) {
    throw new Error(
      `Failed to parse LLM response as JSON. Response was: ${response}`,
    );
  }
}

/**
 * Example usage function demonstrating translation with the LLM
 */
export async function exampleUsage() {
  // Example 1: Simple chat completion
  const funFact = await chatCompletion(
    [{ role: "user", content: "Tell me a fun fact" }],
    "gpt-4o-mini",
  );
  console.log("Fun fact:", funFact);

  // Example 2: Translation
  const englishStrings = {
    "sections[0].title": "Welcome to our platform",
    "sections[0].description": "The best AI models in one place",
    "sections[0].cta.text": "Get Started",
  };

  const germanTranslations = await translateToLocale(
    englishStrings,
    "de_de",
    "gpt-4o-mini",
  );
  console.log("German translations:", germanTranslations);
}
