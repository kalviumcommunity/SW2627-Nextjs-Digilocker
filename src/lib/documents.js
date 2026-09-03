import { cache } from "react";

const documents = [
  {
    id: "identity-proof",
    title: "Identity proof",
    description: "A verified copy of your identity document.",
    issuedOn: "January 15, 2026",
    type: "PDF",
    size: "2.1 MB",
  },
  {
    id: "aadhaar-card",
    title: "Aadhaar Card",
    description: "Official government-issued identity document.",
    issuedOn: "December 10, 2025",
    type: "PDF",
    size: "1.8 MB",
  },
  {
    id: "degree-certificate",
    title: "Degree Certificate",
    description: "Educational qualification certificate.",
    issuedOn: "May 20, 2024",
    type: "DOCX",
    size: "1.4 MB",
  },
  {
    id: "pan-card",
    title: "PAN Card",
    description: "Tax identification document.",
    issuedOn: "March 5, 2023",
    type: "JPG",
    size: "820 KB",
  },
  {
    id: "insurance-policy",
    title: "Insurance Policy",
    description: "Health insurance policy document.",
    issuedOn: "January 1, 2026",
    type: "PDF",
    size: "3.2 MB",
  },
];

/**
 * Fetch all documents from the server.
 * Wrapped in React cache() to deduplicate queries within a single render cycle.
 * In the future, this will query the database via Prisma.
 */
export async function getDocuments() {
  return documents;
});

/**
 * Create a document using the current document repository.
 * This remains in-memory until the project's database layer is added.
 */
export async function createDocument(documentData) {
  const document = {
    id: crypto.randomUUID(),
    ...documentData,
  };

  documents.push(document);
  return document;
}

/**
 * Fetch a single document by ID from the server.
 * Wrapped in React cache() so generateMetadata and DocumentPage share a single
 * data fetch per request during rendering/regeneration without duplicate queries.
 * In the future, this will query the database via Prisma.
 */
export const getDocumentById = cache(async (id) => {
  // Simulate async database call
  // In production: return prisma.document.findUnique({ where: { id } })
  return documents.find((document) => document.id === id) ?? null;
});

const documentActivities = {
  "identity-proof": [
    { id: "act-1", action: "Uploaded to vault", timestamp: "January 15, 2026, 10:30 AM" },
    { id: "act-2", action: "Integrity verified (SHA-256)", timestamp: "January 15, 2026, 10:31 AM" },
  ],
  "aadhaar-card": [
    { id: "act-3", action: "Uploaded to vault", timestamp: "December 10, 2025, 02:15 PM" },
    { id: "act-4", action: "Shared via expiring link", timestamp: "December 12, 2025, 09:00 AM" },
  ],
  "degree-certificate": [
    { id: "act-5", action: "Uploaded to vault", timestamp: "May 20, 2024, 11:45 AM" },
  ],
  "pan-card": [
    { id: "act-6", action: "Uploaded to vault", timestamp: "March 5, 2023, 04:20 PM" },
  ],
  "insurance-policy": [
    { id: "act-7", action: "Uploaded to vault", timestamp: "January 1, 2026, 08:00 AM" },
  ],
};

const documentShareLinks = {
  "identity-proof": [],
  "aadhaar-card": [
    { id: "link-1", token: "adh-share-99", expiresAt: "December 13, 2025, 09:00 AM", active: false },
  ],
  "degree-certificate": [],
  "pan-card": [],
  "insurance-policy": [],
};

/**
 * Fetch audit activity logs for a document.
 * This is a dependent query requiring a verified document ID.
 * In production: return prisma.documentActivity.findMany({ where: { documentId } })
 */
export const getDocumentActivity = cache(async (documentId) => {
  if (!documentId) return [];
  return documentActivities[documentId] ?? [];
});

/**
 * Fetch active share links for a document.
 * This is a dependent query requiring a verified document ID.
 * In production: return prisma.shareLink.findMany({ where: { documentId } })
 */
export const getDocumentShareLinks = cache(async (documentId) => {
  if (!documentId) return [];
  return documentShareLinks[documentId] ?? [];
});

/**
 * Fetch aggregated vault statistics.
 * Independent query that can run concurrently with document fetches.
 * In production: aggregated DB queries
 */
export const getVaultStats = cache(async () => {
  const totalDocs = documents.length;
  const categories = new Set(documents.map((d) => d.type)).size;
  return {
    totalDocuments: totalDocs,
    totalCategories: categories,
    storageQuotaMB: 100,
  };
});


