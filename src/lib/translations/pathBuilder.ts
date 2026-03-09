/**
 * Utility for building JSON path strings
 */

/**
 * Builds a JSON path string from components
 *
 * @param basePath - The base path (e.g., 'sections[0]')
 * @param field - The field name (e.g., 'title')
 * @param index - Optional array index
 * @returns Full path string (e.g., 'sections[0].title')
 */
export function buildPath(basePath: string, field: string, index?: number): string {
  let path = basePath;

  // Add field to path
  if (path) {
    // If field is an array access, don't add dot
    if (index !== undefined) {
      path = `${path}.${field}[${index}]`;
    } else {
      path = `${path}.${field}`;
    }
  } else {
    // Root level field
    if (index !== undefined) {
      path = `${field}[${index}]`;
    } else {
      path = field;
    }
  }

  return path;
}

/**
 * Builds a path for an array element
 *
 * @param basePath - The base path (e.g., 'sections[0]')
 * @param arrayField - The array field name (e.g., 'items')
 * @param index - The array index
 * @returns Path string (e.g., 'sections[0].items[2]')
 */
export function buildArrayPath(basePath: string, arrayField: string, index: number): string {
  const fieldPath = basePath ? `${basePath}.${arrayField}` : arrayField;
  return `${fieldPath}[${index}]`;
}
