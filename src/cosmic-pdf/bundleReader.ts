import { readFile } from "fs/promises";
import { join } from "path";
import { cosmicConfig } from "./config.js";

export async function readBundle(locale: string): Promise<Record<string, any>> {
  const filePath = join(cosmicConfig.bundlesDir, `${locale}.json`);
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}
