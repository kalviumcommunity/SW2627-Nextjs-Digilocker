"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * DocumentListClient - Client Component
 * 
 * This component demonstrates the Server → Client boundary in Next.js App Router.
 * 
 * Server Component (DocumentList) fetches the data and passes it here as props.
 * This Client Component handles all interactive behavior:
 * - Document selection state
 * - Toggling selected document details
 * - User interactions
 * 
 * It also receives and displays request-specific values from the server to demonstrate
 * that dynamic rendering occurred - these values are generated fresh on each request.
 * 
 * Data comes from the server as serializable props.
 * Client-side React hooks (useState) manage the interactive state.
 */
export function DocumentListClient({ documents, userId, renderedAt }) {
  const [selectedDocId, setSelectedDocId] = useState(null);

  // Find the selected document from the list
  const selectedDocument = documents.find((doc) => doc.id === selectedDocId);

  // If no documents, show empty state
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
    <div className="space-y-6">
      {/* Server Render Information - Demonstrates Dynamic Rendering */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-900/30 dark:bg-blue-950/20">
        <p className="font-medium text-blue-900 dark:text-blue-200">
          Server Rendered Request Information
        </p>
        <div className="mt-2 grid gap-2 text-xs text-blue-800 dark:text-blue-300">
          <p><span className="font-medium">User ID:</span> <span className="font-mono">{userId}</span></p>
          <p><span className="font-medium">Rendered at:</span> <span className="font-mono">{renderedAt}</span></p>
          <p className="mt-1 text-blue-700 dark:text-blue-400">
            ✓ This timestamp updates on every fresh request, proving the page uses dynamic rendering.
          </p>
        </div>
      </div>

      {/* Document List */}
      <div className="grid gap-6 lg:grid-cols-3">
      {/* Document List */}
      <div className="lg:col-span-2">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Documents ({documents.length})
          </h2>
          <p className="text-sm text-foreground/75">
            Click a document to view details
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {documents.map((document) => (
            <button
              key={document.id}
              onClick={() => setSelectedDocId(document.id)}
              className={`group rounded-lg border p-4 text-left transition-all ${
                selectedDocId === document.id
                  ? "border-foreground bg-foreground/10 dark:bg-foreground/20"
                  : "border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              }`}
            >
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium group-hover:underline">
                    {document.title}
                  </h3>
                  <p className="text-xs text-foreground/60">
                    {document.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-foreground/50">
                  <span>{document.type}</span>
                  <span>{document.size}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Document Details Panel */}
      <div className="lg:col-span-1">
        {selectedDocument ? (
          <div className="sticky top-4 rounded-lg border border-black/10 p-6 dark:border-white/15">
            <div className="mb-4 pb-4 border-b border-black/10 dark:border-white/15">
              <h3 className="text-sm font-medium text-foreground/75">
                Selected Document
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground/60">
                  Name
                </label>
                <p className="mt-1 font-medium">{selectedDocument.title}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/60">
                  Description
                </label>
                <p className="mt-1 text-sm">{selectedDocument.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground/60">
                    Type
                  </label>
                  <p className="mt-1 text-sm font-mono">
                    {selectedDocument.type}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/60">
                    Size
                  </label>
                  <p className="mt-1 text-sm font-mono">
                    {selectedDocument.size}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/60">
                  Issued On
                </label>
                <p className="mt-1 text-sm">{selectedDocument.issuedOn}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/60">
                  Document ID
                </label>
                <p className="mt-1 text-xs font-mono text-foreground/60">
                  {selectedDocument.id}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href={`/documents/${selectedDocument.id}`}
                  className="inline-flex w-full justify-center rounded-md bg-foreground text-background px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="sticky top-4 rounded-lg border border-black/10 border-dashed p-6 text-center dark:border-white/15">
            <p className="text-sm text-foreground/75">
              Select a document to view details
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
