import Link from "next/link";
import { NOT_DIAGNOSTIC } from "@/lib/content/disclaimers";

export function DisclaimerBanner({
  message = NOT_DIAGNOSTIC,
  compact = false,
}: {
  message?: string;
  compact?: boolean;
}) {
  return (
    <aside
      className={`border-b border-[var(--warn-border)] bg-[var(--warn-bg)] text-[var(--warn-ink)] ${
        compact ? "px-4 py-2 text-xs" : "px-4 py-3 text-sm"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-3 gap-y-1">
        <p>{message}</p>
        <Link href="/disclaimer" className="shrink-0 font-medium underline">
          Limits of self-testing
        </Link>
      </div>
    </aside>
  );
}
