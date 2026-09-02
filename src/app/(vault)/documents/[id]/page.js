import Link from "next/link";
import { getDocumentById, getDocuments } from "@/src/lib/documents";

/**
 * generateStaticParams - Pre-generate static pages for all known documents
 * 
 * This function tells Next.js which document IDs should be pre-rendered as static pages
 * at build time. This improves performance by serving pre-built HTML instead of 
 * rendering on-demand.
 * 
 * Returns an array of objects with the route parameters.
 */
export async function generateStaticParams() {
  const documents = await getDocuments();
  
  return documents.map((document) => ({
    id: document.id,
  }));
}

/**
 * DocumentPage - Server Component for individual document display
 * 
 * This dynamic route fetches document data server-side based on the route parameter.
 * No "use client" directive - this is a Server Component.
 * 
 * For Next.js 16+, params is accessed via await params.
 * 
 * Optimized to fetch all independent data in parallel using Promise.all
 * for better performance.
 */
export default async function DocumentPage({ params }) {
  // Extract and await params for Next.js 16+ compatibility
  const { id } = await params;

  // Fetch the specific document and related data in parallel
  const document = await fetchDocumentData(id);

  // Handle missing document gracefully
  if (!document) {
    return (
      <div className="space-y-6">
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/75 hover:text-foreground transition-colors"
        >
          ← Back to Documents
        </Link>
        <div className="rounded-lg border border-black/10 p-8 text-center dark:border-white/15">
          <h1 className="text-2xl font-semibold mb-2">Document Not Found</h1>
          <p className="text-foreground/75">
            The document you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/documents"
            className="mt-4 inline-block rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Return to Vault
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/documents"
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground/75 hover:text-foreground transition-colors"
      >
        ← Back to Documents
      </Link>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {document.title}
          </h1>
          <p className="text-foreground/75">{document.description}</p>
        </div>

        <div className="rounded-lg border border-black/10 p-6 dark:border-white/15">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-foreground/75">Type</h3>
              <p className="mt-1 text-lg font-semibold">{document.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground/75">Size</h3>
              <p className="mt-1 text-lg font-semibold">{document.size}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground/75">
                Issued On
              </h3>
              <p className="mt-1 text-lg font-semibold">{document.issuedOn}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground/75">
                Document ID
              </h3>
              <p className="mt-1 text-sm font-mono">{document.id}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="rounded-md bg-foreground text-background px-4 py-2 font-medium hover:opacity-90 transition-opacity">
            Download
          </button>
          <button className="rounded-md border border-black/10 px-4 py-2 font-medium hover:bg-black/5 transition-colors dark:border-white/15 dark:hover:bg-white/10">
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * fetchDocumentData - Fetch document data in parallel
 * 
 * Uses Promise.all to fetch independent queries concurrently.
 * Ready for future extensions with additional document-related queries.
 */
async function fetchDocumentData(id) {
  // All independent queries are executed in parallel
  const [document] = await Promise.all([
    getDocumentById(id),
  ]);

  return document;
}
