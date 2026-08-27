import Link from "next/link";

const recentDocuments = [
  { name: "Aadhaar Card", type: "PDF", meta: "Identity · 1.2 MB", date: "Aug 24, 2026", tone: "bg-[#e2f1e9] text-[#176b52]" },
  { name: "Degree Certificate", type: "PDF", meta: "Education · 2.8 MB", date: "Aug 19, 2026", tone: "bg-[#f3e7d3] text-[#9a6b2d]" },
  { name: "ITR Acknowledgement", type: "JSON", meta: "Tax & Finance · 640 KB", date: "Aug 11, 2026", tone: "bg-[#e8edf6] text-[#48628c]" },
];

export default function Dashboard() {
  return (
    <div className="rise-in space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="eyebrow">Tuesday, August 27, 2026</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your document vault</h1><p className="mt-2 max-w-xl text-[var(--ink-muted)]">Everything important, stored securely and ready when you need it.</p></div>
        <Link className="button-primary" href="/documents">+ Add document</Link>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {[['12', 'Total documents', 'Across 4 categories'], ['4', 'Shared links', '2 expire this week'], ['10 MB', 'Upload limit', 'Per document']].map(([value, label, detail]) => <div className="panel p-5" key={label}><p className="text-2xl font-semibold">{value}</p><p className="mt-2 text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{detail}</p></div>)}
      </section>
      <div className="grid gap-6 lg:grid-cols-[1fr_310px]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4"><div><p className="eyebrow">Recently added</p><h2 className="mt-1 text-xl font-semibold">Your documents</h2></div><Link className="text-sm font-semibold text-[var(--accent)]" href="/documents">View all →</Link></div>
          <div className="divide-y divide-[var(--line)]">{recentDocuments.map((document) => <div className="flex items-center gap-4 px-5 py-4" key={document.name}><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-xs font-bold ${document.tone}`}>{document.type}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{document.name}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{document.meta}</p></div><p className="hidden text-xs text-[var(--ink-muted)] sm:block">{document.date}</p><button className="button-quiet" type="button">Open</button></div>)}</div>
        </section>
        <aside className="panel bg-[#173d32] p-6 text-white"><p className="eyebrow !text-[#a9dfc1]">Your flow</p><h2 className="mt-2 text-xl font-semibold">Ready to share?</h2><p className="mt-2 text-sm leading-6 text-[#c7ddd3]">Create a secure link that expires when you choose. You stay in control.</p><div className="mt-6 space-y-4 text-sm"><div className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2d9b6f] text-xs font-bold">1</span><span>Choose a document</span></div><div className="ml-3 h-4 border-l border-[#548f78]" /><div className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2d9b6f] text-xs font-bold">2</span><span>Set an expiry time</span></div><div className="ml-3 h-4 border-l border-[#548f78]" /><div className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2d9b6f] text-xs font-bold">3</span><span>Send the protected link</span></div></div><Link className="mt-7 inline-flex text-sm font-semibold text-[#a9dfc1]" href="/documents">Browse documents →</Link></aside>
      </div>
    </div>
  );
}
