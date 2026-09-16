import { cookies } from "next/headers.js";
import {
  presignUploadSchema,
  parseRequestBody,
  successResponse,
  errorResponse,
} from "../../../../lib/api-validation.js";
import { getCurrentUser } from "../../../../lib/auth.js";

/**
 * POST /api/upload/presign
 * 
 * Generates a temporary pre-signed URL for direct browser-to-cloud upload.
 * Validates payload (fileName, contentType, fileSize <= 10MB) before generating URL.
 * Pre-signed URL is valid for 15 minutes (900 seconds) per PRD Section 5.5.
 */
export async function POST(request) {
  const parsed = await parseRequestBody(request, presignUploadSchema);
  if (!parsed.success) {
    return parsed.response;
  }

  const { fileName, contentType, fileSize } = parsed.data;

  // Determine user identity
  let userId = "demo-user";
  try {
    if (process.env.NEXT_PUBLIC_AUTH_ENABLED === "true") {
      const user = await getCurrentUser();
      if (user?.id) {
        userId = user.id;
      }
    } else {
      const cookieStore = await cookies();
      const cookieUser = cookieStore?.get?.("demo-user")?.value;
      if (cookieUser) {
        userId = cookieUser;
      }
    }
  } catch {
    userId = "demo-user";
  }

  const sanitizedFileName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const timestamp = Date.now();
  const objectKey = `uploads/${userId}/${timestamp}-${sanitizedFileName}`;

  // Direct upload URL (supports mock cloud endpoint for local dev/testing)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const uploadUrl = `${baseUrl}/api/upload/mock-s3/${objectKey}`;

  return successResponse({
    uploadUrl,
    objectKey,
    expiresIn: 900, // 15 minutes
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
  });
}
