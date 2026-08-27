import { notFound } from "next/navigation";
import { getDocumentById } from "@/src/lib/documents";

function isValidDocumentId(documentId) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(documentId);
}

export default async function DocumentPage({ params }) {
  const { documentId } = await params;

  if (!isValidDocumentId(documentId)) {
    notFound();
  }

  const document = getDocumentById(documentId);

  if (!document) {
    notFound();
  }

  return (
    <article className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground/70">Document</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {document.title}
        </h1>
        <p className="text-base leading-7 text-foreground/75">
          {document.description}
        </p>
      </div>
      <dl className="rounded-lg border border-black/10 p-5 dark:border-white/15">
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
          <dt className="font-medium">Issued</dt>
          <dd className="text-foreground/75">{document.issuedOn}</dd>
        </div>
      </dl>
    </article>
  );
}
