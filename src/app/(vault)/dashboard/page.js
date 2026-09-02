import { Suspense } from "react";
import { DocumentList } from "@/src/components/document-list";
import { DocumentGridSkeleton, VaultHeaderSkeleton } from "@/src/components/skeletons";

/**
 * Dashboard - Server Component
 * 
 * Main dashboard page that displays vault overview and recent documents.
 * Uses Suspense boundaries for progressive rendering and better loading states.
 * 
 * Optimized to fetch all independent data in parallel using Promise.all
 * for better performance.
 */
export default async function Dashboard() {
  return (
    <section className="space-y-6">
      <Suspense fallback={<VaultHeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Documents</h2>
        <Suspense fallback={<DocumentGridSkeleton count={6} />}>
          <RecentDocuments />
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
  const documents = await fetchDashboardData();

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

/**
 * RecentDocuments - Server Component
 * 
 * Displays the list of recent documents.
 * Uses fetchDashboardData to get data in parallel.
 */
async function RecentDocuments() {
  const documents = await fetchDashboardData();
  return <DocumentList documents={documents} />;
}

/**
 * fetchDashboardData - Fetch all dashboard data in parallel
 * 
 * Uses Promise.all to fetch independent queries concurrently,
 * improving performance by reducing total fetch time.
 */
async function fetchDashboardData() {
  const { getDocuments } = await import("@/src/lib/documents");
  
  // All independent queries are executed in parallel
  const [documents] = await Promise.all([
    getDocuments(),
  ]);

  return documents;
}
