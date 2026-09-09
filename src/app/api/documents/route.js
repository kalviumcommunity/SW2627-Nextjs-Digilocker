import { revalidatePath } from "next/cache";
import { createDocument, getDocuments } from "@/src/lib/documents";
import { errorResponse, successResponse } from "@/src/lib/api-validation";

export async function GET() {
  try {
    const documents = await getDocuments();

    return successResponse({ documents });
  } catch {
    return errorResponse("Failed to fetch documents", 500);
  }
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse("Request body is required", 400);
  }

  if (typeof body.title !== "string" || body.title.trim() === "") {
    return errorResponse("The title field is required", 400);
  }

  try {
    const document = await createDocument({
      title: body.title.trim(),
      description: typeof body.description === "string" ? body.description : "",
      issuedOn: typeof body.issuedOn === "string" ? body.issuedOn : new Date().toISOString(),
      type: typeof body.type === "string" ? body.type : "",
      size: typeof body.size === "string" ? body.size : "",
    });

    revalidatePath("/documents");
    revalidatePath("/dashboard");
    revalidatePath(`/documents/${document.id}`);

    return successResponse({ document }, 201);
  } catch {
    return errorResponse("Failed to create document", 500);
  }
}