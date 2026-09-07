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

/**
 * Add an audit activity log entry for a document.
 */
export async function addDocumentActivity(documentId, action) {
  if (!documentActivities[documentId]) {
    documentActivities[documentId] = [];
  }
  const timestamp = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const newActivity = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    timestamp,
  };
  documentActivities[documentId].unshift(newActivity);
  return newActivity;
}

/**
 * Create a new document in the vault.
 * Supports both API route payloads and Server Action submissions.
 * In production: return prisma.document.create({ data: ... })
 */
export async function createDocument(documentData) {
  const title = documentData?.title || "Untitled Document";
  let uniqueId = documentData?.id;

  if (!uniqueId) {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `doc-${Date.now()}`;

    uniqueId = slug;
    let counter = 1;
    while (documents.some((d) => d.id === uniqueId)) {
      uniqueId = `${slug}-${counter}`;
      counter++;
    }
  }

  const issuedOn = documentData?.issuedOn || new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const newDoc = {
    id: uniqueId,
    title: title.trim(),
    description: documentData?.description ? documentData.description.trim() : "Uploaded vault document.",
    issuedOn,
    type: (documentData?.type || "PDF").toUpperCase(),
    size: documentData?.size || "1.2 MB",
    ...documentData,
    // Preserve calculated fields
    id: uniqueId,
    title: title.trim(),
    issuedOn,
  };

  documents.unshift(newDoc);
  documentActivities[newDoc.id] = [];
  documentShareLinks[newDoc.id] = [];

  await addDocumentActivity(newDoc.id, "Uploaded to vault");

  return newDoc;
}

/**
 * Update an existing document's metadata in the vault.
 * In production: return prisma.document.update({ where: { id }, data: ... })
 */
export async function updateDocument(id, updates) {
  const index = documents.findIndex((d) => d.id === id);
  if (index === -1) {
    return null;
  }

  const existing = documents[index];
  const updatedDoc = {
    ...existing,
    ...(updates.title !== undefined && { title: updates.title.trim() }),
    ...(updates.description !== undefined && { description: updates.description.trim() }),
    ...(updates.type !== undefined && { type: updates.type.toUpperCase() }),
  };

  documents[index] = updatedDoc;
  await addDocumentActivity(id, "Metadata updated");

  return updatedDoc;
}

/**
 * Delete a document from the vault.
 * In production: return prisma.document.delete({ where: { id } })
 */
export async function deleteDocument(id) {
  const index = documents.findIndex((d) => d.id === id);
  if (index === -1) {
    return false;
  }

  documents.splice(index, 1);
  delete documentActivities[id];
  delete documentShareLinks[id];

  return true;
}

/**
 * Create an expiring share link for a document.
 * In production: return prisma.shareLink.create({ data: ... })
 */
export async function createShareLink(documentId, { expiresInMinutes = 60 } = {}) {
  const document = documents.find((d) => d.id === documentId);
  if (!document) {
    return null;
  }

  if (!documentShareLinks[documentId]) {
    documentShareLinks[documentId] = [];
  }

  const expiresDate = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  const expiresAt = expiresDate.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const token = `share-${Math.random().toString(36).substring(2, 8)}`;
  const newLink = {
    id: `link-${Date.now()}`,
    token,
    expiresAt,
    active: true,
  };

  documentShareLinks[documentId].unshift(newLink);
  await addDocumentActivity(documentId, `Shared via expiring link (${expiresInMinutes}m)`);

  return newLink;
}

/**
 * Delete a share link for a document.
 */
export async function deleteShareLink(documentId, linkId) {
  if (!documentShareLinks[documentId]) {
    return false;
  }

  const index = documentShareLinks[documentId].findIndex((l) => l.id === linkId);
  if (index === -1) {
    return false;
  }

  documentShareLinks[documentId].splice(index, 1);
  await addDocumentActivity(documentId, "Revoked share link");

  return true;
}
