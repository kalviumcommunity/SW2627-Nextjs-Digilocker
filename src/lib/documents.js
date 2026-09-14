import { cache } from "react";
import prisma from "./prisma";

// =============================================================================
// MOCK DATA - Used as fallback for development/testing
// =============================================================================

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

// =============================================================================
// PRISMA RELATION QUERIES - User-Document Relations with select/include
// =============================================================================

/**
 * Fetch all documents with their associated user information.
 * Uses Prisma include to fetch related user data in a single query.
 * 
 * Query Pattern: Using include to fetch relations
 * Optimized for: Admin dashboards, document listings with owner info
 * 
 * @returns {Promise<Array>} Documents with nested user objects
 */
export const getDocumentsWithUser = cache(async () => {
  try {
    return await prisma.document.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Prisma query failed, falling back to mock data", error);
    return documents;
  }
});

/**
 * Fetch documents for a specific user with all relations.
 * Uses Prisma include to fetch activities and shareLinks in a single query.
 * 
 * Query Pattern: Filtering with include for nested relations
 * Optimized for: User vault view, document detail pages
 * 
 * @param {string} userId - User ID to fetch documents for
 * @returns {Promise<Array>} User's documents with activities and shareLinks
 */
export const getDocumentsByUser = cache(async (userId) => {
  if (!userId) return [];

  try {
    return await prisma.document.findMany({
      where: { userId },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            action: true,
            description: true,
            createdAt: true,
          },
        },
        shareLinks: {
          select: {
            id: true,
            token: true,
            createdAt: true,
            expiresAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Prisma query failed, falling back to mock data", error);
    return documents;
  }
});

/**
 * Fetch a single document with all its relations and associated user.
 * Uses Prisma include to fetch user, activities, and shareLinks efficiently.
 * 
 * Query Pattern: Deep include with selective field selection
 * Optimized for: Document detail page, edit page
 * 
 * @param {string} id - Document ID
 * @returns {Promise<Object|null>} Complete document with all relations or null
 */
export const getDocumentWithRelations = cache(async (id) => {
  if (!id) return null;

  try {
    return await prisma.document.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            action: true,
            description: true,
            createdAt: true,
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        shareLinks: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            token: true,
            createdAt: true,
            expiresAt: true,
          },
        },
      },
    });
  } catch (error) {
    console.warn("Prisma query failed, falling back to mock data", error);
    return getDocumentById(id);
  }
});

/**
 * Fetch a document with only its owner user data (lightweight).
 * Uses Prisma select to fetch only necessary fields.
 * 
 * Query Pattern: Selective field fetching with include
 * Optimized for: List views, API responses with limited payload
 * 
 * @param {string} id - Document ID
 * @returns {Promise<Object|null>} Document with user info or null
 */
export const getDocumentWithUser = cache(async (id) => {
  if (!id) return null;

  try {
    return await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        size: true,
        issuedOn: true,
        mimeType: true,
        fileSizeBytes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.warn("Prisma query failed, falling back to mock data", error);
    return getDocumentById(id);
  }
});

/**
 * Fetch lightweight document summaries for a user.
 * Uses Prisma select with minimal fields for optimal performance.
 * 
 * Query Pattern: Selective field selection for performance
 * Optimized for: Quick list views, search results, mobile apps
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Lightweight document summaries
 */
export const getUserDocumentsSummary = cache(async (userId) => {
  if (!userId) return [];

  try {
    return await prisma.document.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        type: true,
        size: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit for performance
    });
  } catch (error) {
    console.warn("Prisma query failed, falling back to mock data", error);
    return documents.slice(0, 50);
  }
});

/**
 * Fetch documents with activity and share link counts.
 * Uses Prisma select with _count for aggregated relation data.
 * 
 * Query Pattern: Aggregation using _count
 * Optimized for: Dashboard views, document statistics
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Documents with relation counts
 */
export const getUserDocumentsWithStats = cache(async (userId) => {
  if (!userId) return [];

  try {
    return await prisma.document.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        _count: {
          select: {
            activities: true,
            shareLinks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Prisma query failed, falling back to mock data", error);
    return documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      createdAt: new Date(doc.issuedOn),
      _count: {
        activities: documentActivities[doc.id]?.length || 0,
        shareLinks: documentShareLinks[doc.id]?.length || 0,
      },
    }));
  }
});

/**
 * Fetch document activities (audit log) with user information.
 * Uses Prisma include to fetch activity author details.
 * 
 * Query Pattern: Including nested user relations
 * Optimized for: Activity history views, audit logs
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Array>} Document activities with user details
 */
export const getDocumentActivitiesWithUser = cache(async (documentId) => {
  if (!documentId) return [];

  try {
    return await prisma.documentActivity.findMany({
      where: { documentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Prisma query failed, falling back to mock data", error);
    return documentActivities[documentId] ?? [];
  }
});

/**
 * Fetch all share links for a document with user information.
 * Uses Prisma query to fetch sharing data with optional user filtering.
 * 
 * Query Pattern: Basic query without nested relations
 * Optimized for: Share management, expiration tracking
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Array>} Active share links for document
 */
export const getDocumentShareLinksWithDetails = cache(async (documentId) => {
  if (!documentId) return [];

  try {
    return await prisma.shareLink.findMany({
      where: { documentId },
      select: {
        id: true,
        token: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Prisma query failed, falling back to mock data", error);
    return documentShareLinks[documentId] ?? [];
  }
});

/**
 * Fetch a user with all their documents (complete profile).
 * Uses Prisma include to fetch user with all associated documents.
 * 
 * Query Pattern: Single model with included relations
 * Optimized for: User profile page, user data export
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User with all documents or null
 */
export const getUserWithDocuments = cache(async (userId) => {
  if (!userId) return null;

  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            type: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        activities: {
          select: {
            id: true,
            action: true,
            createdAt: true,
          },
          take: 10, // Recent activities
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.warn("Prisma query failed for user with documents", error);
    return null;
  }
});

/**
 * Fetch documents shared with a specific user by checking share links.
 * Joins through shareLinks to find documents available to user.
 * 
 * Query Pattern: Relation-based filtering
 * Optimized for: Finding shared documents
 * 
 * @param {string} shareToken - Share link token
 * @returns {Promise<Object|null>} Shared document or null
 */
export const getSharedDocumentByToken = cache(async (shareToken) => {
  if (!shareToken) return null;

  try {
    const shareLink = await prisma.shareLink.findUnique({
      where: { token: shareToken },
      include: {
        document: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return shareLink?.document ?? null;
  } catch (error) {
    console.warn("Prisma query failed for shared document", error);
    return null;
  }
});


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
