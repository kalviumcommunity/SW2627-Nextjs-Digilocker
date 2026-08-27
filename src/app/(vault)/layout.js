import Link from "next/link";
import VaultNavigation from "./vault-navigation";

export default function VaultLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-black/10 bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link className="flex items-center gap-3" href="/dashboard">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#176b52] text-sm font-bold text-white">DL</span>
            <span><span className="block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#176b52]">Secure vault</span><span className="text-lg font-semibold">DigiLocker</span></span>
          </Link>
          <VaultNavigation />
          <div className="hidden items-center gap-3 text-sm sm:flex"><span className="h-2 w-2 rounded-full bg-[#2d9b6f]" /> Vault protected <span className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f3e7d3] font-semibold">AS</span></div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
