"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function VaultNavigationLink({ href, children }) {
  const isActive = usePathname() === href;

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-foreground text-background"
          : "hover:bg-black/5 dark:hover:bg-white/10"
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}
