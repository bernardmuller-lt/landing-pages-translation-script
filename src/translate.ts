import { readFile, writeFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { config, TARGET_LOCALES } from "./config.js";
import { translateToLocale } from "./lib/ai/llm.js";

export interface TranslateOptions {
  /** LLM model name, e.g. "gpt-4o-mini" */
  model: string;
  slugs?: string[];
  locales?: string[];
  concurrency?: number;
}

class Semaphore {
  private readonly queue: Array<() => void> = [];
  private running = 0;

  constructor(private readonly max: number) {}

  acquire(): Promise<void> {
    if (this.running < this.max) {
      this.running++;
      return Promise.resolve();
    }
    return new Promise((resolve) => this.queue.push(resolve));
  }

  release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) {
      this.running++;
      next();
    }
  }
}

export async function runTranslate(options: TranslateOptions): Promise<void> {
  const { model } = options;
  const concurrency = options.concurrency ?? 5;

  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   AI Translation — Batch (all locales × all slugs)     ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const dir = config.translationsOutputDir;
  if (!existsSync(dir)) {
    console.error(`\n❌ ${dir} not found. Run the parse command first.\n`);
    process.exit(1);
  }

  const allLocaleKeys = Object.keys(TARGET_LOCALES);

  const locales = options.locales ?? allLocaleKeys;
  if (options.locales) {
    const unknown = options.locales.filter((l) => !TARGET_LOCALES[l]);
    if (unknown.length > 0) {
      console.error(
        `\n❌ Unknown locale(s): ${unknown.join(", ")}\n   Valid locales: ${allLocaleKeys.join(", ")}\n`,
      );
      process.exit(1);
    }
  }

  const allFiles = await readdir(dir);
  const sourceFiles = allFiles
    .filter((f) => f.endsWith(".json"))
    .filter((f) => {
      const name = f.slice(0, -5);
      return !allLocaleKeys.some((l) => name.endsWith(`-${l}`));
    });

  if (sourceFiles.length === 0) {
    console.error("\n❌ No source files found. Run the parse command first.\n");
    process.exit(1);
  }

  const slugFilter = options.slugs ? new Set(options.slugs) : null;
  const slugs = sourceFiles
    .map((f) => f.slice(0, -5))
    .filter((s) => !slugFilter || slugFilter.has(s));

  if (slugs.length === 0) {
    console.error(
      `\n❌ No matching slugs for filter: ${options.slugs?.join(", ")}\n`,
    );
    process.exit(1);
  }

  const sourceMap = new Map<string, Record<string, string>>();
  for (const slug of slugs) {
    const content = await readFile(join(dir, `${slug}.json`), "utf-8");
    sourceMap.set(slug, JSON.parse(content));
  }

  const totalTasks = slugs.length * locales.length;
  console.log(`\n🤖 Model:       ${model}`);
  console.log(`🗨️  Concurrency: ${concurrency} parallel requests`);
  console.log(`📁 Locales:     ${locales.length}`);
  console.log(`📄 Slugs:       ${slugs.join(", ")}`);
  console.log(`📊 Tasks:       ${totalTasks} total\n`);

  const sem = new Semaphore(concurrency);
  const failedEntries: Array<{ slug: string; locale: string }> = [];
  let totalKeys = 0;
  let completed = 0;

  const tasks = slugs.flatMap((slug) =>
    locales.map((locale) => ({ slug, locale }))
  );

  await Promise.allSettled(
    tasks.map(({ slug, locale }) =>
      (async () => {
        const englishStrings = sourceMap.get(slug)!;
        await sem.acquire();
        try {
          const translated = await translateToLocale(englishStrings, locale, model);
          const outputPath = join(dir, `${slug}-${locale}.json`);
          await writeFile(outputPath, JSON.stringify(translated, null, 2), "utf-8");
          const count = Object.keys(translated).length;
          completed++;
          console.log(
            `  ✅  [${String(completed).padStart(String(totalTasks).length)}/${totalTasks}]  ${slug.padEnd(12)} / ${locale.padEnd(8)} — ${count} keys`,
          );
          totalKeys += count;
        } catch (err) {
          completed++;
          const msg = err instanceof Error ? err.message : String(err);
          console.error(
            `  ❌  [${String(completed).padStart(String(totalTasks).length)}/${totalTasks}]  ${slug.padEnd(12)} / ${locale.padEnd(8)} — ${msg}`,
          );
          failedEntries.push({ slug, locale });
        } finally {
          sem.release();
        }
      })()
    )
  );

  console.log(`\n📊  Done — ${totalKeys} total keys written`);

  if (failedEntries.length > 0) {
    console.warn(`\n⚠️  ${failedEntries.length} call(s) failed:`);
    failedEntries.forEach(({ slug, locale }) =>
      console.warn(`     - ${slug} / ${locale}`)
    );
    process.exit(1);
  }

  console.log("\n👉  Next: chatai-script validate\n");
}
