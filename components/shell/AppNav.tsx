"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/symptoms", label: "Symptoms" },
  { href: "/calibration", label: "Calibration" },
  { href: "/pattern-glare", label: "Pattern glare" },
  { href: "/reading", label: "Reading" },
  { href: "/interventions", label: "Interventions" },
  { href: "/binocular", label: "Binocular" },
  { href: "/journal", label: "Journal" },
  { href: "/analytics", label: "Analytics" },
  { href: "/data", label: "Data" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="border-b border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-1 gap-y-1 px-4 py-2">
        <Link
          href="/"
          className="mr-3 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--ink)]"
        >
          PerceptLab
        </Link>
        {LINKS.filter((l) => l.href !== "/").map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded px-2 py-1 text-sm transition-colors ${
                active
                  ? "bg-[var(--accent-soft)] text-[var(--ink)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
