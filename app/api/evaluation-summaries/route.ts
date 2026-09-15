import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth/authorization";
import { getEvaluationSummaries } from "@/lib/services/evaluation-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const summaries = await getEvaluationSummaries();
  if (isAdmin(user)) {
    return NextResponse.json(summaries, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const employeeId = user.employeeId.toLowerCase();
  const evaluatorSummaries = summaries.filter((summary) =>
    summary.evaluations.some(
      (evaluation) =>
        evaluation.evaluatorEmployeeId?.toLowerCase() === employeeId ||
        (!evaluation.evaluatorEmployeeId &&
          Boolean(user.email) &&
          evaluation.evaluatorEmail.toLowerCase() === user.email?.toLowerCase()),
    ),
  );
  return NextResponse.json(evaluatorSummaries, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
