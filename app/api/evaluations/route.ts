import { NextResponse } from "next/server";
import { getCurrentUser, hasSameOrigin, isAdmin } from "@/lib/auth/authorization";
import { EvaluationValidationError, getEvaluationResults, submitEvaluation } from "@/lib/services/evaluation-service";
import { evaluationPayloadSchema } from "@/lib/validation/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results = await getEvaluationResults();
  const visibleResults = isAdmin(user)
    ? results
    : results.filter((result) =>
        result.evaluatorEmployeeId?.toLowerCase() === user.employeeId.toLowerCase() ||
        (!result.evaluatorEmployeeId && Boolean(user.email) && result.evaluatorEmail.toLowerCase() === user.email?.toLowerCase())
      );

  return NextResponse.json(visibleResults, {
    headers: { "Cache-Control": "private, no-store" }
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });

  const payload = evaluationPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Invalid evaluation data" }, { status: 400 });

  try {
    return NextResponse.json(await submitEvaluation(payload.data, user));
  } catch (error) {
    if (error instanceof EvaluationValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to save evaluation" }, { status: 500 });
  }
}
