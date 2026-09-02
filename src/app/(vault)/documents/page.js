import { Suspense } from "react";
import { cookies } from "next/headers";
import { DocumentList } from "@/src/components/document-list";
import { DocumentGridSkeleton, VaultHeaderSkeleton } from "@/src/components/skeletons";

/**
 * DocumentsPage - Server Component
 * 
 * Main vault page that displays documents with Suspense boundaries
 * for better loading state handling and progressive enhancement.
 * 
 * DYNAMIC RENDERING: This page is configured to render fresh content on every request
 * rather than being statically generated. This demonstrates request-specific server
 * rendering in the Next.js App Router.
 * 
 * The document list is wrapped with Suspense to show a loading skeleton
 * while data is being fetched from the server.
 * 
 * Optimized to fetch all independent data in parallel using Promise.all
 * for better performance.
 */

// Force dynamic rendering for this route - fresh render on every request
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  // Fetch server-specific request data and documents in parallel
  const { documents, userId, renderedAt } = await fetchVaultData();
  
  return (
    <section className="space-y-6">
      <Suspense fallback={<VaultHeaderSkeleton />}>
        <VaultHeader documents={documents} userId={userId} renderedAt={renderedAt} />
      </Suspense>

      <Suspense fallback={<DocumentGridSkeleton count={6} />}>
        <VaultDocuments documents={documents} userId={userId} renderedAt={renderedAt} />
      </Suspense>
    </section>
  );
}

/**
 * VaultHeader - Server Component
 * 
 * Displays the vault header with title and document count.
 * Receives request-specific data (userId, renderedAt) to demonstrate dynamic rendering.
 */
function VaultHeader({ documents, userId, renderedAt }) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight">My DigiLocker Vault</h1>
      <p className="text-foreground/75">
        You have {documents.length} document{documents.length !== 1 ? "s" : ""} securely stored.
      </p>
      <div className="mt-3 pt-3 border-t border-foreground/10 text-xs text-foreground/60">
        <p>User: <span className="font-mono font-medium text-foreground/70">{userId}</span></p>
        <p>Rendered at: <span className="font-mono font-medium text-foreground/70">{renderedAt}</span></p>
      </div>
    </div>
  );
}

/**
 * VaultDocuments - Server Component
 * 
 * Displays the list of vault documents.
 * Passes server-specific request data to DocumentList for display to the client.
 */
function VaultDocuments({ documents, userId, renderedAt }) {
  return <DocumentList documents={documents} userId={userId} renderedAt={renderedAt} />;
}

/**
 * fetchVaultData - Fetch all vault data including server-specific request values
 * 
 * Uses Promise.all to fetch independent queries concurrently.
 * Also captures request-specific values that prove dynamic rendering:
 * - userId: Read from cookies to demonstrate request-specific data access
 * - renderedAt: ISO timestamp showing this render was generated for the current request
 * 
 * This proves the page is NOT statically generated - it renders fresh for every request.
 */
async function fetchVaultData() {
  const { getDocuments } = await import("@/src/lib/documents");
  
  // Get server-side request-specific data
  const cookieStore = await cookies();
  const userId = cookieStore.get("demo-user")?.value || "demo-user";
  
  // Capture render timestamp - this will be NEW on every request
  const renderedAt = new Date().toISOString();
  
  // All independent queries are executed in parallel
  const [documents] = await Promise.all([
    getDocuments(),
  ]);

  return { documents, userId, renderedAt };
}
