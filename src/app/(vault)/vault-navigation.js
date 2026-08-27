"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/documents", label: "Documents" },
];

export default function VaultNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Vault navigation">
      <ul className="flex items-center gap-1">
        {navigationItems.map(({ href, label }) => {
          const isActive = pathname === href;

          return (
            <li key={href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
                href={href}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
