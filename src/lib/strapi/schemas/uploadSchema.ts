export {
  APIPayloadSchema,
  validateAPIPayload,
  type APIPayload,
} from "./pageDataSchema";

/**
 * @deprecated Use APIPayload from pageDataSchema.ts instead
 */
export type UploadPayload = import("./pageDataSchema").APIPayload;
