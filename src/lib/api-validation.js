import { z } from "zod";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PAGE_SIZE = 100;
const allowedContentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/xml",
  "application/json",
];

const documentId = z.string().trim().min(1).max(128);
const fileName = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .refine((value) => !/[\\/]/.test(value), "File name must not contain a path");
const contentType = z.enum(allowedContentTypes);
const fileSize = z.number().int().positive().max(MAX_FILE_SIZE_BYTES);

export const documentQuerySchema = z
  .object({
    cursor: z.string().trim().min(1).max(512).optional(),
    limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(10),
  })
  .strict();

export const presignUploadSchema = z
  .object({
    fileName,
    contentType,
    fileSize,
  })
  .strict();

export const completeUploadSchema = z
  .object({
    documentId: documentId.optional(),
    objectKey: z.string().trim().min(1).max(1024),
    fileName,
    contentType,
    fileSize,
  })
  .strict();

export const createShareLinkSchema = z
  .object({
    expiresInMinutes: z.union([z.literal(10), z.literal(60), z.literal(1440)]),
    pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits").optional(),
    maxViews: z.union([z.literal(1), z.literal(3), z.literal(5)]).optional(),
  })
  .strict();

export const shareTokenSchema = z.string().trim().min(1).max(512);

export const uploadPresignSchema = presignUploadSchema;
export const uploadCompleteSchema = completeUploadSchema;
export const shareLinkSchema = createShareLinkSchema;

export function formatValidationErrors(error) {
  return error.issues.map(({ path, message }) => ({
    path: path.join("."),
    message,
  }));
}

export async function parseRequestBody(request, schema) {
  let body;

  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: Response.json(
        { error: "Invalid JSON payload", details: [] },
        { status: 400 }
      ),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      success: false,
      response: Response.json(
        { error: "Invalid request payload", details: formatValidationErrors(result.error) },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}
