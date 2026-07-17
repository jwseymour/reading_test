import { redirect } from "next/navigation";

/** Server redirect helper for legacy module URLs */
export function LegacyRedirect({ to }: { to: string }) {
  redirect(to);
}
