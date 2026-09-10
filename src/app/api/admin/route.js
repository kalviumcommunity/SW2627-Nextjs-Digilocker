import { requireRole } from "@/src/lib/auth";
import { getDocuments, getVaultStats } from "@/src/lib/documents";
import { errorResponse, successResponse } from "@/src/lib/api-validation";

export async function GET() {
  try {
    const adminUser = await requireRole("admin");
    const [documents, stats] = await Promise.all([
      getDocuments(),
      getVaultStats(),
    ]);

    return successResponse({
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
      stats: {
        totalDocuments: documents.length,
        totalCategories: stats.totalCategories,
        storageQuotaMB: stats.storageQuotaMB,
      },
    });
  } catch (err) {
    const statusCode = err?.statusCode || (err?.message?.includes("Unauthorized") ? 401 : 403);
    return errorResponse(err?.message || "Forbidden: Access denied.", statusCode);
  }
}
