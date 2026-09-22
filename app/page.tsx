import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getRepository } from "@/lib/repositories";

export default async function Home() {
  const session = await auth();

  if (session?.user?.role === "Admin") redirect("/admin");
  if (!(await getRepository().isEvaluationOpen())) redirect("/evaluation-closed");
  if (!session) redirect("/login");
  redirect("/evaluator");
}
