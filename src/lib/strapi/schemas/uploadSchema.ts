import type { APIPayload } from '../../translations/apiFormatter.js';

/**
 * Upload payload schema (matches post-data.json structure)
 * This is the same as APIPayload from apiFormatter.ts
 */
export type UploadPayload = APIPayload;

/**
 * Validates that a payload matches the upload schema
 *
 * @param payload - The payload to validate
 * @returns True if valid, false otherwise
 */
export function validateUploadPayload(payload: any): payload is UploadPayload {
  // Check outer structure
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  if (!payload.data || typeof payload.data !== 'object') {
    return false;
  }

  const { data } = payload;

  // Validate required top-level fields
  if (typeof data.environment !== 'string' || !data.environment) {
    return false;
  }

  if (typeof data.identifier !== 'string' || !data.identifier) {
    return false;
  }

  if (typeof data.slug !== 'string' || !data.slug) {
    return false;
  }

  if (typeof data.locale !== 'string' || !data.locale) {
    return false;
  }

  // Validate SEO object
  if (!data.seo || typeof data.seo !== 'object') {
    return false;
  }

  if (typeof data.seo.title !== 'string') {
    return false;
  }

  if (typeof data.seo.description !== 'string') {
    return false;
  }

  // Validate events object
  if (!data.events || typeof data.events !== 'object') {
    return false;
  }

  // Validate sections array
  if (!Array.isArray(data.sections)) {
    return false;
  }

  // Basic validation passed
  return true;
}
