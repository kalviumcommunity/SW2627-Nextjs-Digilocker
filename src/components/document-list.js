import { getDocuments } from "@/src/lib/documents";
import { DocumentListClient } from "@/src/components/document-list-client";

/**
 * DocumentList - Server Component
 * 
 * This component demonstrates the Server → Client component boundary in Next.js App Router.
 * 
 * Responsibilities:
 * 1. Fetch document data on the server (secure, database-ready)
 * 2. Pass serializable data as props to the Client Component
 * 3. Remain a Server Component (no "use client" directive)
 * 
 * The DocumentListClient receives the data as props and handles all interactive behavior
 * like document selection, showing/hiding details, and user interactions.
 */
export async function DocumentList() {
  // Fetch all documents on the server
  // In production, this would be: const documents = await prisma.document.findMany();
  const documents = await getDocuments();

  // Pass serializable document data to the Client Component
  // The Client Component handles all state management and interactivity
  return <DocumentListClient documents={documents} />;
}
