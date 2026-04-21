export function applyTranslations<T = any>(
  sourceData: T,
  translations: Record<string, string>,
): T {
  const result = JSON.parse(JSON.stringify(sourceData)) as T;

  let appliedCount = 0;
  let failedPaths: string[] = [];

  for (const [path, translatedValue] of Object.entries(translations)) {
    try {
      setValueAtPath(result, path, translatedValue);
      appliedCount++;
    } catch (error) {
      failedPaths.push(path);
      console.warn(`Warning: Could not apply translation at path: ${path}`);
    }
  }

  if (failedPaths.length > 0) {
    console.warn(`\n⚠️  Failed to apply ${failedPaths.length} translation(s):`);
    failedPaths.forEach((path) => console.warn(`  - ${path}`));
  }

  return result;
}

function setValueAtPath(obj: any, path: string, value: string): void {
  const segments = parsePath(path);

  if (segments.length === 0) {
    throw new Error(`Invalid path: ${path}`);
  }

  let current = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];

    if (current[segment] === undefined) {
      throw new Error(`Path does not exist: ${path} (failed at ${segment})`);
    }

    current = current[segment];
  }

  const lastSegment = segments[segments.length - 1];
  if (current[lastSegment] === undefined) {
    throw new Error(
      `Path does not exist: ${path} (final segment ${lastSegment})`,
    );
  }

  current[lastSegment] = value;
}

function parsePath(path: string): string[] {
  const segments: string[] = [];

  const normalized = path.replace(/\[(\d+)\]/g, ".$1");

  const parts = normalized.split(".");

  for (const part of parts) {
    if (part) {
      segments.push(part);
    }
  }

  return segments;
}
