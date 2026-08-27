import Link from "next/link";

export default function DocumentNotFound() {
  return (
    <section className="mx-auto max-w-2xl py-8 sm:py-16" aria-labelledby="document-not-found-title">
      <p className="text-sm font-medium text-foreground/70">Document unavailable</p>
      <h1
        className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
        id="document-not-found-title"
      >
        Document not found
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-foreground/75">
        This document may have been removed, or the link may be incorrect.
      </p>
      <Link
        className="mt-7 inline-flex rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        href="/documents"
      >
        Back to documents
      </Link>
    </section>
  );
}
