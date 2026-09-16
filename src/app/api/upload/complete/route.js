import { revalidatePath } from "next/cache.js";
import { cookies } from "next/headers.js";
import {
  completeUploadSchema,
  parseRequestBody,
  successResponse,
  errorResponse,
} from "../../../../lib/api-validation.js";
import { createDocument } from "../../../../lib/documents.js";
import { getCurrentUser } from "../../../../lib/auth.js";
import {
  detectDocumentType,
  extractTitleFromFileName,
  formatFileSize,
} from "../../../../lib/file-validation.js";

/**
 * POST /api/upload/complete
 * 
 * Finalizes direct-to-cloud file upload by persisting document metadata in the vault.
 * Revalidates vault paths and returns the created document.
 */
export async function POST(request) {
  const parsed = await parseRequestBody(request, completeUploadSchema);
  if (!parsed.success) {
    return parsed.response;
  }

  const { objectKey, fileName, contentType, fileSize, documentId } = parsed.data;

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

  const type = detectDocumentType(fileName, contentType) || "PDF";
  const title = extractTitleFromFileName(fileName) || "Uploaded Document";
  const formattedSize = formatFileSize(fileSize);

  try {
    const document = await createDocument({
      ...(documentId ? { id: documentId } : {}),
      title,
      description: `Verified ${type} document uploaded to secure vault.`,
      type,
      size: formattedSize,
      fileKey: objectKey,
      fileUrl: objectKey,
      mimeType: contentType,
      fileSizeBytes: fileSize,
      userId,
    });

    try {
      revalidatePath("/documents");
      revalidatePath("/dashboard");
      revalidatePath(`/documents/${document.id}`);
    } catch {
      // Graceful no-op in non-Next request contexts
    }

    return successResponse({ document }, 201);
  } catch (error) {
    console.error("Failed to complete upload:", error);
    return errorResponse("Failed to complete document upload", 500);
  }
}
