const documents = [
  {
    id: "identity-proof",
    title: "Identity proof",
    description: "A verified copy of your identity document.",
    issuedOn: "January 15, 2026",
  },
];

export function getDocumentById(id) {
  return documents.find((document) => document.id === id) ?? null;
}
