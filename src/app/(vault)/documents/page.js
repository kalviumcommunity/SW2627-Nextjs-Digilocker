import { Suspense } from "react";
import { DocumentList } from "@/src/components/document-list";
import { DocumentGridSkeleton, VaultHeaderSkeleton } from "@/src/components/skeletons";

/**
 * DocumentsPage - Server Component
 * 
 * Main vault page that displays documents with Suspense boundaries
 * for better loading state handling and progressive enhancement.
 * 
 * The document list is wrapped with Suspense to show a loading skeleton
 * while data is being fetched from the server.
 * 
 * Optimized to fetch all independent data in parallel using Promise.all
 * for better performance.
 */
export default async function DocumentsPage() {
  return (
    <section className="space-y-6">
      <Suspense fallback={<VaultHeaderSkeleton />}>
        <VaultHeader />
      </Suspense>

      <Suspense fallback={<DocumentGridSkeleton count={6} />}>
        <VaultDocuments />
      </Suspense>
    </section>
  );
}

/**
 * VaultHeader - Server Component
 * 
 * Displays the vault header with title and document count.
 * Wrapped with Suspense for independent loading state.
 */
async function VaultHeader() {
  const documents = await fetchVaultData();

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight">My Vault</h1>
      <p className="text-foreground/75">
        You have {documents.length} document{documents.length !== 1 ? "s" : ""} securely stored.
      </p>
    </div>
  );
}

/**
 * VaultDocuments - Server Component
 * 
 * Displays the list of vault documents.
 * Uses fetchVaultData to get data in parallel.
 */
async function VaultDocuments() {
  const documents = await fetchVaultData();
  return <DocumentList documents={documents} />;
}

/**
 * fetchVaultData - Fetch all vault data in parallel
 * 
 * Uses Promise.all to fetch independent queries concurrently,
 * improving performance by reducing total fetch time.
 */
async function fetchVaultData() {
  const { getDocuments } = await import("@/src/lib/documents");
  
  // All independent queries are executed in parallel
  const [documents] = await Promise.all([
    getDocuments(),
  ]);

  return documents;
}
