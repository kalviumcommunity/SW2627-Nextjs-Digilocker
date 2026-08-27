"use client";

import { useMemo, useRef, useState } from "react";

const documents = [
  { name: "Aadhaar Card", issuer: "UIDAI", category: "Identity", type: "PDF", size: "1.2 MB", date: "Aug 24, 2026", tone: "bg-[#e2f1e9] text-[#176b52]" },
  { name: "Degree Certificate", issuer: "Delhi University", category: "Education", type: "PDF", size: "2.8 MB", date: "Aug 19, 2026", tone: "bg-[#f3e7d3] text-[#9a6b2d]" },
  { name: "ITR Acknowledgement", issuer: "Income Tax Department", category: "Tax & Finance", type: "JSON", size: "640 KB", date: "Aug 11, 2026", tone: "bg-[#e8edf6] text-[#48628c]" },
  { name: "Vaccination Record", issuer: "CoWIN", category: "Medical", type: "JPG", size: "890 KB", date: "Jul 28, 2026", tone: "bg-[#f5e4e4] text-[#a24c4c]" },
];
const categories = ["All", "Identity", "Education", "Tax & Finance", "Medical"];
const acceptedTypes = ["pdf", "jpg", "jpeg", "png", "webp", "docx", "xml", "json"];

export default function Documents() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [uploadMessage, setUploadMessage] = useState("");
  const [shareDocument, setShareDocument] = useState(null);
  const fileInput = useRef(null);

  const filteredDocuments = useMemo(() => documents.filter((document) => {
    const searchable = `${document.name} ${document.issuer} ${document.category}`.toLowerCase();
    return (category === "All" || document.category === category) && searchable.includes(query.toLowerCase());
  }), [category, query]);

  function validateFile(file) {
    if (!file) return;
    const extension = file.name.split(".").pop().toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      setUploadMessage("File type not supported. Choose PDF, JPG, PNG, WEBP, DOCX, XML, or JSON.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadMessage("This file is larger than 10 MB. Choose a smaller document.");
      return;
    }
    setUploadMessage(`${file.name} is ready to upload. Validation passed.`);
  }

  return (
    <div className="rise-in space-y-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Document library</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">All documents</h1><p className="mt-2 text-[var(--ink-muted)]">12 documents securely stored in your vault.</p></div><button className="button-primary" onClick={() => fileInput.current?.click()} type="button">+ Upload document</button><input accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xml,.json" className="hidden" onChange={(event) => validateFile(event.target.files?.[0])} ref={fileInput} type="file" /></section>

      {uploadMessage && <div aria-live="polite" className={`rounded-md border px-4 py-3 text-sm ${uploadMessage.includes("passed") ? "border-[#a8c7b7] bg-[#e2f1e9] text-[#176b52]" : "border-[#e5b5b5] bg-[#fff1f1] text-[#9c3c3c]"}`}>{uploadMessage}</div>}

      <section className="panel border-dashed bg-[#fbfcf9] p-6 text-center sm:p-8"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xl text-[var(--accent)]">↑</div><h2 className="mt-3 font-semibold">Drop a document here</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">or <button className="font-semibold text-[var(--accent)] underline" onClick={() => fileInput.current?.click()} type="button">browse your files</button></p><p className="mt-4 text-xs text-[var(--ink-muted)]">PDF, JPG, PNG, WEBP, DOCX, XML, JSON · Maximum 10 MB</p></section>

      <section className="space-y-4"><div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><span className="sr-only">Search documents</span><span className="pointer-events-none absolute left-3 top-2.5 text-[var(--ink-muted)]">⌕</span><input className="w-full rounded-md border border-[var(--line)] bg-white px-9 py-2.5 text-sm outline-none focus:border-[var(--accent)]" onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, issuer, or tag" value={query} /></label><div className="flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${category === item ? "bg-[#173d32] text-white" : "border border-[var(--line)] bg-white text-[var(--ink-muted)]"}`} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}</div></div>
        <div className="panel divide-y divide-[var(--line)] overflow-hidden">{filteredDocuments.map((document) => <article className="document-row flex flex-col gap-4 p-5 sm:flex-row sm:items-center" key={document.name}><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-xs font-bold ${document.tone}`}>{document.type}</div><div className="min-w-0 flex-1"><h2 className="truncate font-semibold">{document.name}</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">{document.issuer} · {document.category}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{document.size} · Added {document.date}</p></div><div className="flex gap-2"><button className="button-quiet" type="button">Open</button><button className="button-primary" onClick={() => setShareDocument(document)} type="button">Share</button></div></article>)}{filteredDocuments.length === 0 && <div className="p-10 text-center text-sm text-[var(--ink-muted)]">No documents match your search.</div>}</div>
      </section>

      {shareDocument && <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#18221e]/40 p-4" role="presentation"><section aria-labelledby="share-title" aria-modal="true" className="panel w-full max-w-md p-6" role="dialog"><div className="flex items-start justify-between"><div><p className="eyebrow">Secure sharing</p><h2 className="mt-1 text-xl font-semibold" id="share-title">Share {shareDocument.name}</h2></div><button aria-label="Close share dialog" className="button-quiet" onClick={() => setShareDocument(null)} type="button">×</button></div><p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">Anyone with this link can view the document until it expires.</p><label className="mt-5 block text-sm font-semibold" htmlFor="expiry">Link expires</label><select className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 text-sm" defaultValue="7" id="expiry"><option value="1">In 24 hours</option><option value="7">In 7 days</option><option value="30">In 30 days</option></select><div className="mt-6 flex justify-end gap-2"><button className="button-quiet" onClick={() => setShareDocument(null)} type="button">Cancel</button><button className="button-primary" onClick={() => setShareDocument(null)} type="button">Create secure link</button></div></section></div>}
    </div>
  );
}
