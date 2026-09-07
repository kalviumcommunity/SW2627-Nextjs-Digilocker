import { getDocumentById } from "@/src/lib/documents";
import {
  documentIdSchema,
  errorResponse,
  formatValidationErrors,
  successResponse,
} from "@/src/lib/api-validation";

export async function GET(_request, { params }) {
  let routeParams;

  try {
    routeParams = await params;
  } catch {
    return errorResponse("Invalid document ID", 400);
  }

  const result = documentIdSchema.safeParse(routeParams?.id);
  if (!result.success) {
    return errorResponse(
      "Invalid document ID",
      400,
      formatValidationErrors(result.error)
    );
  }

  try {
    const document = await getDocumentById(result.data);

    if (!document) {
      return errorResponse("Document not found", 404);
    }

    return successResponse({ document });
  } catch {
    return errorResponse("Failed to fetch document", 500);
  }
}