import Link from "next/link";
import {
  getDocumentById,
  getDocuments,
  getDocumentActivity,
  getDocumentShareLinks,
} from "@/src/lib/documents";
import {
  updateDocument,
  deleteDocument,
  createShareLink,
  revokeShareLink,
} from "../actions";

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
 * 4. Progressive Server Actions: Form-tied mutations (update, delete, share) are
 *    bound directly to Server Actions on the server.
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
      <div className="flex items-center justify-between">
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/75 hover:text-foreground transition-colors"
        >
          ← Back to Documents
        </Link>

        {/* Delete Document Form with Server Action */}
        <form action={deleteDocument}>
          <input type="hidden" name="documentId" value={document.id} />
          <button
            type="submit"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
          >
            Delete Document
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {document.title}
          </h1>
          <p className="text-foreground/75">{document.description}</p>
        </div>

        {/* Document Details Grid */}
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

        {/* Edit Metadata Form (Server Action) */}
        <div className="rounded-lg border border-black/10 p-6 dark:border-white/15">
          <h3 className="text-sm font-semibold mb-3">Update Document Metadata</h3>
          <form action={updateDocument} className="space-y-4">
            <input type="hidden" name="documentId" value={document.id} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="edit-title" className="text-xs font-medium text-foreground/75">
                  Document Title *
                </label>
                <input
                  id="edit-title"
                  name="title"
                  type="text"
                  required
                  maxLength={120}
                  defaultValue={document.title}
                  className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/20"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="edit-type" className="text-xs font-medium text-foreground/75">
                  Type / Format
                </label>
                <select
                  id="edit-type"
                  name="type"
                  defaultValue={document.type}
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
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-description" className="text-xs font-medium text-foreground/75">
                Description
              </label>
              <input
                id="edit-description"
                name="description"
                type="text"
                defaultValue={document.description}
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/20"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-foreground text-background px-4 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Expiring Share Links Section (Server Action) */}
        <div className="rounded-lg border border-black/10 p-6 dark:border-white/15 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Secure Expiring Share Links</h3>
              <p className="text-xs text-foreground/70">
                Create time-limited access tokens for external verification.
              </p>
            </div>
            <form action={createShareLink} className="flex items-center gap-2">
              <input type="hidden" name="documentId" value={document.id} />
              <select
                name="expiresInMinutes"
                defaultValue="60"
                className="rounded-md border border-black/15 bg-transparent px-2.5 py-1.5 text-xs focus:outline-none dark:border-white/20"
              >
                <option value="10" className="dark:bg-neutral-900">10 Minutes</option>
                <option value="60" className="dark:bg-neutral-900">1 Hour</option>
                <option value="1440" className="dark:bg-neutral-900">24 Hours</option>
              </select>
              <button
                type="submit"
                className="rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Create Link
              </button>
            </form>
          </div>

          {shareLinks.length > 0 ? (
            <ul className="divide-y divide-black/10 dark:divide-white/10 text-xs">
              {shareLinks.map((link) => (
                <li key={link.id} className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-mono font-medium">{link.token}</p>
                    <p className="text-foreground/60">Expires: {link.expiresAt}</p>
                  </div>
                  <form action={revokeShareLink}>
                    <input type="hidden" name="documentId" value={document.id} />
                    <input type="hidden" name="linkId" value={link.id} />
                    <button
                      type="submit"
                      className="text-red-600 hover:underline dark:text-red-400"
                    >
                      Revoke
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-foreground/50">No active share links.</p>
          )}
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
        </div>
      </div>
    </div>
  );
}

