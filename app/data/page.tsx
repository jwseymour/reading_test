import { redirect } from "next/navigation";

export default function LegacyDataPage() {
  redirect("/insights?tab=data");
}
