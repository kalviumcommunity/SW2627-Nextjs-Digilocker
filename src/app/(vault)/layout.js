import Link from "next/link";
import VaultNavigation from "./vault-navigation";

export default function VaultLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-black/10 dark:border-white/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link className="text-lg font-semibold" href="/dashboard">
            DigiLocker Vault
          </Link>
          <VaultNavigation />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
