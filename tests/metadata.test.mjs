import test from "node:test";
import assert from "node:assert/strict";
import { getDocumentById, getDocuments } from "../src/lib/documents.js";
import fs from "node:fs";
import path from "node:path";

test("Document Metadata & Revalidation Strategy (LU-2.23)", async (t) => {
  const pageContent = fs.readFileSync(
    path.resolve("src/app/(vault)/documents/[id]/page.js"),
    "utf-8"
  );

  await t.test("page.js contains revalidate export configured to 300 seconds", () => {
    assert.match(
      pageContent,
      /export\s+const\s+revalidate\s*=\s*300;/,
      "revalidate should be statically exported as 300 seconds"
    );
  });

  await t.test("page.js exports generateMetadata with non-indexable robots configuration", () => {
    assert.match(
      pageContent,
      /export\s+async\s+function\s+generateMetadata/,
      "page.js should export generateMetadata function"
    );
    assert.match(
      pageContent,
      /robots:\s*\{[\s\S]*?index:\s*false[\s\S]*?follow:\s*false[\s\S]*?\}/,
      "generateMetadata should configure private robots tags"
    );
  });

  await t.test("page.js exports generateStaticParams for build-time pre-rendering", () => {
    assert.match(
      pageContent,
      /export\s+async\s+function\s+generateStaticParams/,
      "page.js should export generateStaticParams function"
    );
  });

  await t.test("getDocumentById retrieves document by ID and returns null for unknown ID", async () => {
    const doc = await getDocumentById("pan-card");
    assert.ok(doc);
    assert.strictEqual(doc.id, "pan-card");
    assert.strictEqual(doc.title, "PAN Card");
    assert.strictEqual(doc.type, "JPG");

    const missing = await getDocumentById("unknown-id-xyz");
    assert.strictEqual(missing, null);
  });

  await t.test("getDocuments returns all available vault documents", async () => {
    const docs = await getDocuments();
    assert.ok(Array.isArray(docs));
    assert.ok(docs.length >= 5);
    assert.ok(docs.some((d) => d.id === "aadhaar-card"));
    assert.ok(docs.some((d) => d.id === "identity-proof"));
    assert.ok(docs.some((d) => d.id === "degree-certificate"));
    assert.ok(docs.some((d) => d.id === "insurance-policy"));
  });

  await t.test("getDocumentById returns consistent metadata structure for all documents", async () => {
    const docs = await getDocuments();
    for (const doc of docs) {
      const fetched = await getDocumentById(doc.id);
      assert.strictEqual(fetched.id, doc.id);
      assert.strictEqual(fetched.title, doc.title);
      assert.strictEqual(fetched.description, doc.description);
      assert.ok(typeof fetched.title === "string" && fetched.title.length > 0);
      assert.ok(typeof fetched.description === "string" && fetched.description.length > 0);
    }
  });
});

