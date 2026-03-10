export function buildPath(
  basePath: string,
  field: string,
  index?: number,
): string {
  let path = basePath;

  if (path) {
    if (index !== undefined) {
      path = `${path}.${field}[${index}]`;
    } else {
      path = `${path}.${field}`;
    }
  } else {
    if (index !== undefined) {
      path = `${field}[${index}]`;
    } else {
      path = field;
    }
  }

  return path;
}

export function buildArrayPath(
  basePath: string,
  arrayField: string,
  index: number,
): string {
  const fieldPath = basePath ? `${basePath}.${arrayField}` : arrayField;
  return `${fieldPath}[${index}]`;
}
