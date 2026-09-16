import { successResponse } from "@/src/lib/api-validation";

/**
 * PUT /api/upload/mock-s3/[...key]
 * 
 * Mock endpoint simulating direct cloud storage (e.g. S3 PUT) for development
 * and automated testing environments.
 */
export async function PUT(request, { params }) {
  const resolvedParams = await params;
  const key = Array.isArray(resolvedParams?.key)
    ? resolvedParams.key.join("/")
    : resolvedParams?.key || "unknown";

  // In production, file binaries are delivered directly to Cloud Storage (e.g., S3).
  // Here we consume the stream and return success confirming receipt.
  try {
    const arrayBuffer = await request.arrayBuffer();
    return new Response(null, {
      status: 200,
      headers: {
        "ETag": `"${Date.now().toString(16)}"`,
        "Content-Length": String(arrayBuffer.byteLength),
      },
    });
  } catch {
    return new Response(null, { status: 200 });
  }
}
