import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  createDocument,
  updateDocument,
  deleteDocument,
  createShareLink,
  revokeShareLink,
} from "../src/app/(vault)/documents/actions.js";
import {
  getDocumentById,
  getDocuments,
  getDocumentActivity,
  getDocumentShareLinks,
} from "../src/lib/documents.js";

test("Server Actions with 'use server' (LU — Basic Server Action)", async (t) => {
  const actionsFilePath = path.resolve("src/app/(vault)/documents/actions.js");
  const actionsContent = fs.readFileSync(actionsFilePath, "utf-8");

  const docPagePath = path.resolve("src/app/(vault)/documents/page.js");
  const docPageContent = fs.readFileSync(docPagePath, "utf-8");

  const docIdPagePath = path.resolve("src/app/(vault)/documents/[id]/page.js");
  const docIdPageContent = fs.readFileSync(docIdPagePath, "utf-8");

  await t.test("actions.js contains 'use server' directive at module boundary", () => {
    assert.match(
      actionsContent,
      /^["']use server["'];?/m,
      "actions.js must start with 'use server' directive"
    );
  });

  await t.test("documents/page.js wires progressive form to createDocument Server Action", () => {
    assert.match(
      docPageContent,
      /import\s*\{\s*createDocument\s*\}\s*from\s*["']\.\/actions["']/,
      "page.js should import createDocument action"
    );
    assert.match(
      docPageContent,
      /<form[^>]*action=\{createDocument\}/,
      "page.js must render <form action={createDocument}>"
    );
  });

  await t.test("documents/[id]/page.js wires progressive forms to Server Actions", () => {
    assert.match(
      docIdPageContent,
      /import\s*\{[\s\S]*updateDocument[\s\S]*\}\s*from\s*["']\.\.\/actions["']/,
      "document detail page should import updateDocument action"
    );
    assert.match(
      docIdPageContent,
      /<form[^>]*action=\{updateDocument\}/,
      "document detail page must render <form action={updateDocument}>"
    );
    assert.match(
      docIdPageContent,
      /<form[^>]*action=\{deleteDocument\}/,
      "document detail page must render <form action={deleteDocument}>"
    );
    assert.match(
      docIdPageContent,
      /<form[^>]*action=\{createShareLink\}/,
      "document detail page must render <form action={createShareLink}>"
    );
  });

  await t.test("createDocument Server Action creates a new document with valid FormData", async () => {
    const formData = new FormData();
    formData.append("title", "Birth Certificate");
    formData.append("type", "PDF");
    formData.append("description", "Official birth certificate copy");
    formData.append("size", "1.9 MB");

    try {
      await createDocument(formData);
    } catch (err) {
      // Next.js redirect throws a NEXT_REDIRECT error in Next environment
      if (!err.message.includes("NEXT_REDIRECT")) {
        throw err;
      }
    }

    const doc = await getDocumentById("birth-certificate");
    assert.ok(doc, "Created document should exist in vault");
    assert.strictEqual(doc.title, "Birth Certificate");
    assert.strictEqual(doc.type, "PDF");
    assert.strictEqual(doc.description, "Official birth certificate copy");
  });

  await t.test("createDocument validates required title and rejects empty input", async () => {
    const formData = new FormData();
    formData.append("title", "   ");
    formData.append("type", "PDF");

    await assert.rejects(
      async () => {
        await createDocument(formData);
      },
      /Validation failed: Document title is required/,
      "createDocument must reject empty title"
    );
  });

  await t.test("createDocument validates unsupported document formats", async () => {
    const formData = new FormData();
    formData.append("title", "Executable File");
    formData.append("type", "EXE");

    await assert.rejects(
      async () => {
        await createDocument(formData);
      },
      /Validation failed: Unsupported document format/,
      "createDocument must reject invalid file format"
    );
  });

  await t.test("updateDocument Server Action updates existing document metadata", async () => {
    const formData = new FormData();
    formData.append("documentId", "pan-card");
    formData.append("title", "Permanent Account Number (PAN)");
    formData.append("description", "Updated tax identification certificate");
    formData.append("type", "JPG");

    const result = await updateDocument(formData);
    assert.ok(result.success);
    assert.strictEqual(result.document.title, "Permanent Account Number (PAN)");

    const updated = await getDocumentById("pan-card");
    assert.strictEqual(updated.title, "Permanent Account Number (PAN)");
    assert.strictEqual(updated.description, "Updated tax identification certificate");
  });

  await t.test("updateDocument rejects non-existent document ID", async () => {
    const formData = new FormData();
    formData.append("documentId", "non-existent-doc-999");
    formData.append("title", "New Title");

    await assert.rejects(
      async () => {
        await updateDocument(formData);
      },
      /Not Found/,
      "updateDocument must reject non-existent document"
    );
  });

  await t.test("createShareLink and revokeShareLink Server Actions manage expiring links", async () => {
    const shareFormData = new FormData();
    shareFormData.append("documentId", "identity-proof");
    shareFormData.append("expiresInMinutes", "60");

    const shareResult = await createShareLink(shareFormData);
    assert.ok(shareResult.success);
    assert.ok(shareResult.link.token.startsWith("share-"));

    const links = await getDocumentShareLinks("identity-proof");
    assert.ok(links.some((l) => l.id === shareResult.link.id));

    // Revoke link
    const revokeFormData = new FormData();
    revokeFormData.append("documentId", "identity-proof");
    revokeFormData.append("linkId", shareResult.link.id);

    const revokeResult = await revokeShareLink(revokeFormData);
    assert.ok(revokeResult.success);

    const remainingLinks = await getDocumentShareLinks("identity-proof");
    assert.ok(!remainingLinks.some((l) => l.id === shareResult.link.id));
  });

  await t.test("deleteDocument Server Action removes document from vault", async () => {
    const formData = new FormData();
    formData.append("documentId", "degree-certificate");

    try {
      await deleteDocument(formData);
    } catch (err) {
      if (!err.message.includes("NEXT_REDIRECT")) {
        throw err;
      }
    }

    const doc = await getDocumentById("degree-certificate");
    assert.strictEqual(doc, null, "Deleted document should no longer exist");
  });
});
