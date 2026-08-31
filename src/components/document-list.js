import { getDocuments } from "@/src/lib/documents";
import { DocumentGridSkeleton } from "@/src/components/skeletons";
import Link from "next/link";

/**
 * DocumentList - Server Component
 * 
 * Fetches and displays documents in a grid layout.
 * This component is wrapped with Suspense in the parent to provide loading states.
 */
export async function DocumentList() {
  // Fetch all documents on the server
  const documents = await getDocuments();

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-black/10 bg-black/5 p-8 text-center dark:border-white/15 dark:bg-white/5">
        <h3 className="text-lg font-medium">No documents yet</h3>
        <p className="mt-2 text-sm text-foreground/75">
          Upload your first document to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <Link
          key={document.id}
          href={`/documents/${document.id}`}
          className="group rounded-lg border border-black/10 p-5 transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:border-white/15 dark:hover:bg-white/10"
        >
          <div className="space-y-3">
            <div>
              <h2 className="font-medium group-hover:underline">
                {document.title}
              </h2>
              <p className="mt-1 text-sm text-foreground/75">
                {document.description}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-foreground/60">
              <span>{document.type}</span>
              <span>{document.size}</span>
            </div>
            <div className="text-xs text-foreground/50">
              Issued: {document.issuedOn}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/**
 * DocumentListSuspense - Wrapper with Suspense boundary
 * 
 * Provides a loading fallback UI while the DocumentList is fetching.
 */
export function DocumentListSuspense() {
  return (
    <Suspense fallback={<DocumentGridSkeleton count={6} />}>
      <DocumentList />
    </Suspense>
  );
}

// Import Suspense from React
import { Suspense } from "react";
