import { Suspense } from "react";
import { DocumentList } from "@/src/components/document-list";
import { DocumentGridSkeleton, VaultHeaderSkeleton } from "@/src/components/skeletons";

/**
 * Dashboard - Server Component
 * 
 * Main dashboard page that displays vault overview and recent documents.
 * Uses Suspense boundaries for progressive rendering and better loading states.
 */
export default function Dashboard() {
  return (
    <section className="space-y-6">
      <Suspense fallback={<VaultHeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Documents</h2>
        <Suspense fallback={<DocumentGridSkeleton count={6} />}>
          <DocumentList />
        </Suspense>
      </div>
    </section>
  );
}

/**
 * DashboardHeader - Server Component
 * 
 * Displays the dashboard header with welcome message and stats.
 * Wrapped with Suspense for independent loading state.
 */
async function DashboardHeader() {
  const { getDocuments } = await import("@/src/lib/documents");
  const documents = await getDocuments();

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome to Your Vault
      </h1>
      <p className="text-foreground/75">
        You have {documents.length} document{documents.length !== 1 ? "s" : ""} securely stored.
      </p>
    </div>
  );
}
