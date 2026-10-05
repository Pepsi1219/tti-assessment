import { redirect } from "next/navigation";

export default function QuestionsRedirectPage() {
  redirect("/admin/assessment-versions");
}