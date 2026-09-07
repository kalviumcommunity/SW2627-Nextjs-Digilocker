import { Suspense } from "react";
import { cookies } from "next/headers";
import { getDocuments } from "@/src/lib/documents";
import { DocumentList } from "@/src/components/document-list";
import { DocumentGridSkeleton, VaultHeaderSkeleton } from "@/src/components/skeletons";
import { createDocument } from "./actions";

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

      {/* Upload Document Form with Server Action (Progressive Enhancement) */}
      <div className="rounded-lg border border-black/10 p-6 dark:border-white/15">
        <h2 className="text-lg font-semibold mb-1">Upload Document to Vault</h2>
        <p className="text-sm text-foreground/75 mb-4">
          Add a new verified document to your secure vault via direct Server Action mutation.
        </p>
        <form action={createDocument} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label htmlFor="title" className="text-xs font-medium text-foreground/75">
                Document Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={120}
                placeholder="e.g. Passport, Tax Certificate"
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/20"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="type" className="text-xs font-medium text-foreground/75">
                Format / Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue="PDF"
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/20"
              >
                <option value="PDF" className="dark:bg-neutral-900">PDF</option>
                <option value="DOCX" className="dark:bg-neutral-900">DOCX</option>
                <option value="JPG" className="dark:bg-neutral-900">JPG</option>
                <option value="PNG" className="dark:bg-neutral-900">PNG</option>
                <option value="WEBP" className="dark:bg-neutral-900">WEBP</option>
                <option value="XML" className="dark:bg-neutral-900">XML</option>
                <option value="JSON" className="dark:bg-neutral-900">JSON</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="size" className="text-xs font-medium text-foreground/75">
                File Size
              </label>
              <input
                id="size"
                name="size"
                type="text"
                defaultValue="1.5 MB"
                placeholder="e.g. 2.1 MB"
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/20"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="description" className="text-xs font-medium text-foreground/75">
              Description
            </label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="Brief description of the document"
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/20"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Upload to Vault
            </button>
          </div>
        </form>
      </div>

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
 * Uses Promise.all to fetch independent operations concurrently:
 * - cookies(): Read incoming request headers/cookies
 * - getDocuments(): Retrieve vault documents
 * 
 * Concurrently captures request-specific values that prove dynamic rendering.
 */
async function fetchVaultData() {
  // Start independent queries and request data concurrently in parallel
  const [cookieStore, documents] = await Promise.all([
    cookies(),
    getDocuments(),
  ]);
  
  const userId = cookieStore.get("demo-user")?.value || "demo-user";
  const renderedAt = new Date().toISOString();

  return { documents, userId, renderedAt };
}

