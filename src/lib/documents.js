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
 * This function is designed to be called from Server Components.
 * In the future, this will query the database via Prisma.
 */
export async function getDocuments() {
  return documents;
}

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
 * This function is designed to be called from Server Components.
 * In the future, this will query the database via Prisma.
 */
export async function getDocumentById(id) {
  // Simulate async database call
  // In production: return prisma.document.findUnique({ where: { id } })
  return documents.find((document) => document.id === id) ?? null;
}
