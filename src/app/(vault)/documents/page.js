import Link from "next/link";
import { getDocuments } from "@/src/lib/documents";

/**
 * DocumentsPage - Server Component
 * 
 * This page demonstrates server-side data fetching for the DigiLocker Vault.
 * Document data is fetched on the server and passed to client components
 * only when interactivity is required.
 * 
 * No "use client" directive - this is a Server Component.
 */
export default async function DocumentsPage() {
  // Fetch all documents on the server
  const documents = await getDocuments();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">My Vault</h1>
        <p className="text-foreground/75">
          You have {documents.length} document{documents.length !== 1 ? "s" : ""} securely stored.
        </p>
      </div>

      {documents.length > 0 ? (
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
      ) : (
        <div className="rounded-lg border border-black/10 p-8 text-center dark:border-white/15">
          <p className="text-foreground/75">
            No documents yet. Upload your first document to get started.
          </p>
        </div>
      )}
    </section>
  );
}
