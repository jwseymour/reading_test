"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/assess", label: "Assess" },
  { href: "/find", label: "Find what helps" },
  { href: "/playground", label: "Playground" },
  { href: "/insights", label: "Insights" },
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
        {LINKS.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded px-2.5 py-1 text-sm transition-colors ${
                active
                  ? "bg-[var(--accent-soft)] text-[var(--ink)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/disclaimer"
          className="ml-auto text-xs text-[var(--muted)] underline"
        >
          Limits
        </Link>
      </div>
    </nav>
  );
}
