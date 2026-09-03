import { createDocument, getDocuments } from "@/src/lib/documents";

export async function GET() {
  try {
    const documents = await getDocuments();

    return Response.json({ success: true, documents });
  } catch {
    return Response.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      { success: false, error: "Request body is required" },
      { status: 400 }
    );
  }

  if (typeof body.title !== "string" || body.title.trim() === "") {
    return Response.json(
      { success: false, error: "The title field is required" },
      { status: 400 }
    );
  }

  try {
    const document = await createDocument({
      title: body.title.trim(),
      description: typeof body.description === "string" ? body.description : "",
      issuedOn: typeof body.issuedOn === "string" ? body.issuedOn : new Date().toISOString(),
      type: typeof body.type === "string" ? body.type : "",
      size: typeof body.size === "string" ? body.size : "",
    });

    return Response.json({ success: true, document }, { status: 201 });
  } catch {
    return Response.json(
      { success: false, error: "Failed to create document" },
      { status: 500 }
    );
  }
}