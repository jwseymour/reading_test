import { Dashboard } from "@/components/analytics/Dashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Module G · Analytics
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Trends, condition comparisons with effect sizes, and an exportable
          summary. Under-sampled conditions (n&lt;5) stay greyed out.
        </p>
      </header>
      <Dashboard />
    </div>
  );
}
