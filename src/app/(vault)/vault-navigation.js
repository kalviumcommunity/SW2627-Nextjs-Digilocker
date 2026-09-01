import VaultNavigationLink from "./vault-navigation-link";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/documents", label: "Documents" },
];

export default function VaultNavigation() {
  return (
    <nav aria-label="Vault navigation">
      <ul className="flex items-center gap-1">
        {navigationItems.map(({ href, label }) => (
          <li key={href}>
            <VaultNavigationLink href={href}>{label}</VaultNavigationLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
