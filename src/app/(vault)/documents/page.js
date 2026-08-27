import Link from "next/link";
import { getDocumentById } from "@/src/lib/documents";

export default function Documents() {
  const identityProof = getDocumentById("identity-proof");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
        <p className="text-foreground/75">Your securely stored documents.</p>
      </div>
      {identityProof && (
        <Link
          className="block rounded-lg border border-black/10 p-5 transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:border-white/15 dark:hover:bg-white/10"
          href={`/documents/${identityProof.id}`}
        >
          <span className="block font-medium">{identityProof.title}</span>
          <span className="mt-1 block text-sm text-foreground/75">
            {identityProof.description}
          </span>
        </Link>
      )}
    </section>
  );
}
