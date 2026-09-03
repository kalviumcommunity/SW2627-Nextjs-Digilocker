import Link from "next/link";
import {
  getDocumentById,
  getDocuments,
  getDocumentActivity,
  getDocumentShareLinks,
} from "@/src/lib/documents";

// Document records change through infrequent vault operations. Refresh this
// individual document route within five minutes without making the vault
// layout or other document routes dynamic.
export const revalidate = 300;

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
 * generateMetadata - Builds document-specific, non-indexable head metadata.
 *
 * The document ID is part of the dynamic route and therefore selects the
 * corresponding statically generated ISR entry; no metadata is shared between
 * document routes.
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  const document = await getDocumentById(id);

  if (!document) {
    return {
      title: "Document Not Found | DigiLocker",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${document.title} | DigiLocker`,
    description: document.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

/**
 * DocumentPage - Server Component for individual document display
 * 
 * Data Fetching Strategy (LU-2.25):
 * 1. Sequential: Primary document lookup requires the resolved route param `id`.
 * 2. Prerequisite boundary: If the document is missing, return not-found UI immediately
 *    without executing dependent queries with invalid/undefined IDs.
 * 3. Parallel Dependent: Once `document.id` is verified, dependent queries
 *    (audit activity logs, share links) are fetched concurrently using `Promise.all`
 *    to eliminate accidental waterfalls.
 */
export default async function DocumentPage({ params }) {
  // Extract and await params for Next.js 16+ compatibility
  const { id } = await params;

  // 1. Primary sequential fetch: verify document existence
  const document = await getDocumentById(id);

  // 2. Handle missing document gracefully before attempting dependent queries
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

  // 3. Dependent queries: execute concurrently in parallel once parent document is verified
  const [activity, shareLinks] = await Promise.all([
    getDocumentActivity(document.id),
    getDocumentShareLinks(document.id),
  ]);

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

        {/* Audit Activity & Sharing Information */}
        {activity.length > 0 && (
          <div className="rounded-lg border border-black/10 p-6 dark:border-white/15">
            <h3 className="text-sm font-semibold mb-3">Activity & Verification</h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              {activity.map((item) => (
                <li key={item.id} className="flex justify-between items-center text-xs">
                  <span>{item.action}</span>
                  <span className="text-foreground/50">{item.timestamp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button className="rounded-md bg-foreground text-background px-4 py-2 font-medium hover:opacity-90 transition-opacity">
            Download
          </button>
          <button className="rounded-md border border-black/10 px-4 py-2 font-medium hover:bg-black/5 transition-colors dark:border-white/15 dark:hover:bg-white/10">
            Share {shareLinks.length > 0 ? `(${shareLinks.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

