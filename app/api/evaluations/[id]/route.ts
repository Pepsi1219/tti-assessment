import { NextResponse } from "next/server";
import {
  getCurrentUser,
  isAdmin,
  isDeveloper,
  matchesEvaluatorIdentity,
} from "@/lib/auth/authorization";
import { getEvaluationResultById } from "@/lib/services/evaluation-service";
import { redactAssessmentAnswerKeys } from "@/lib/services/assessment-version";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id || id.length > 200)
    return NextResponse.json({ error: "Invalid evaluation ID" }, { status: 400 });

  const evaluation = await getEvaluationResultById(id);
  if (!evaluation)
    return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });

  const belongsToEvaluator = matchesEvaluatorIdentity(user, evaluation);
  if ((isAdmin(user) && !isDeveloper(user)) || (!isAdmin(user) && !belongsToEvaluator))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(
    isAdmin(user) || !evaluation.assessmentVersion
      ? evaluation
      : {
          ...evaluation,
          assessmentVersion: redactAssessmentAnswerKeys(evaluation.assessmentVersion),
        },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}