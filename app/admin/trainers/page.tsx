import { redirect } from "next/navigation";

/** Legacy route retained for bookmarks after evaluators moved to `trainers`. */
export default function LegacyTrainerManagementPage() {
  redirect("/admin/evaluators");
}
