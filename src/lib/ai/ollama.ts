import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

/**
 * Default Ollama base URL if not specified in environment
 */
const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434/v1";

/**
 * Default model to use for Ollama chat completions
 */
const DEFAULT_MODEL = "llama3.2:1b";

/**
 * System prompt for website summarization
 */
const SUMMARIZATION_SYSTEM_PROMPT = `
You are an insightful assistant that analyzes the contents of a website,
and provides a short, concise, good summary, ignoring text that might be navigation related.
Respond in markdown. Do not wrap the markdown in a code block - respond just with the markdown.
`.trim();

/**
 * User prompt prefix for website summarization
 */
const SUMMARIZATION_USER_PROMPT_PREFIX = `
Here are the contents of a website.
Provide a short summary of this website.

`.trim();

/**
 * Get Ollama base URL from environment variables
 * Falls back to localhost if not set
 */
function getOllamaBaseUrl(): string {
  console.log("OLLAMA_BASE_URL:", process.env.OLLAMA_BASE_URL);
  return process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL;
}

/**
 * Creates an OpenAI client configured to use Ollama
 *
 * @returns OpenAI client instance pointing to Ollama endpoint
 */
export function createOllamaClient(): OpenAI {
  const baseUrl = getOllamaBaseUrl();

  return new OpenAI({
    baseURL: baseUrl,
    apiKey: "ollama", // Ollama doesn't require a real API key
  });
}

/**
 * Sends a chat completion request to Ollama
 *
 * @param messages - Array of chat messages
 * @param model - Model to use (defaults to llama3.2:1b)
 * @returns The AI response content
 */
export async function chatCompletion(
  messages: ChatCompletionMessageParam[],
  model: string = DEFAULT_MODEL,
): Promise<string> {
  const client = createOllamaClient();

  const response = await client.chat.completions.create({
    model,
    messages,
  });

  return response.choices[0].message.content || "";
}

/**
 * Builds messages array for website summarization
 *
 * @param websiteContent - The text content of a website
 * @returns Array of chat messages
 */
export function buildSummarizationMessages(
  websiteContent: string,
): ChatCompletionMessageParam[] {
  return [
    {
      role: "system",
      content: SUMMARIZATION_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: SUMMARIZATION_USER_PROMPT_PREFIX + "\n\n" + websiteContent,
    },
  ];
}

/**
 * Summarizes website content using Ollama
 *
 * @param websiteContent - The text content to summarize
 * @param model - Model to use (defaults to llama3.2:1b)
 * @returns Markdown-formatted summary
 */
export async function summarize(
  websiteContent: string,
  model: string = DEFAULT_MODEL,
): Promise<string> {
  const messages = buildSummarizationMessages(websiteContent);
  return chatCompletion(messages, model);
}

/**
 * Example usage function demonstrating how to use the Ollama client
 */
export async function exampleUsage() {
  // Example 1: Simple chat completion
  const funFact = await chatCompletion([
    { role: "user", content: "Tell me a fun fact" },
  ]);
  console.log("Fun fact:", funFact);

  // Example 2: Website summarization
  const websiteContent = `
    Welcome to Example.com

    We are a leading provider of innovative solutions.
    Our mission is to help businesses grow through technology.

    Services:
    - Web Development
    - Mobile Apps
    - Cloud Solutions
  `;

  const summary = await summarize(websiteContent);
  console.log("Summary:", summary);
}
