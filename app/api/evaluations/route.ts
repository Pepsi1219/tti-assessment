import { NextResponse } from "next/server";
import {
  getCurrentUser,
  hasSameOrigin,
  isAdmin,
} from "@/lib/auth/authorization";
import {
  EvaluationValidationError,
  getEvaluationResults,
  submitEvaluation,
} from "@/lib/services/evaluation-service";
import { evaluationPayloadSchema } from "@/lib/validation/api";
import { getRepository } from "@/lib/repositories";

function isFirestoreQuotaError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const details = error as { code?: unknown; message?: unknown };
  return (
    details.code === 8 ||
    /resource_exhausted|quota exceeded|daily quota/i.test(
      String(details.message ?? ""),
    )
  );
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results = await getEvaluationResults();
  const visibleResults = isAdmin(user)
    ? results
    : results.filter(
        (result) =>
          result.evaluatorEmployeeId?.toLowerCase() ===
            user.employeeId.toLowerCase() ||
          (!result.evaluatorEmployeeId &&
            Boolean(user.email) &&
            result.evaluatorEmail.toLowerCase() === user.email?.toLowerCase()),
      );

  return NextResponse.json(visibleResults, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasSameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );

  const payload = evaluationPayloadSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!payload.success)
    return NextResponse.json(
      { error: "Invalid evaluation data" },
      { status: 400 },
    );

  try {
    return NextResponse.json(await submitEvaluation(payload.data, user));
  } catch (error) {
    if (error instanceof EvaluationValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (isFirestoreQuotaError(error)) {
      return NextResponse.json(
        {
          error:
            "The evaluation service is temporarily unavailable because its database quota has been reached. Please try again after the quota resets.",
        },
        { status: 503 },
      );
    }
    console.error("Unable to save evaluation", error);
    return NextResponse.json(
      { error: "Unable to save evaluation" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasSameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id || id.length > 200)
    return NextResponse.json(
      { error: "A valid evaluation ID is required" },
      { status: 400 },
    );

  try {
    await getRepository().deleteEvaluation(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      return NextResponse.json(
        {
          error:
            "The database quota has been reached. Please try again after it resets.",
        },
        { status: 503 },
      );
    }
    console.error("Unable to delete evaluation", error);
    return NextResponse.json(
      { error: "Unable to delete evaluation" },
      { status: 500 },
    );
  }
}
