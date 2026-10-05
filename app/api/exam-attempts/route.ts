import { NextResponse } from "next/server";
import { getCurrentUser, hasSameOrigin } from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import { ExamValidationError, submitExamAttempt } from "@/lib/services/exam-service";
import { examAttemptPayloadSchema } from "@/lib/validation/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "Evaluator")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const repo = getRepository();
  const [attempts, recipients, versions] = await Promise.all([
    repo.getExamAttempts(),
    repo.getRecipients(),
    repo.getAssessmentVersions(),
  ]);
  const pending = attempts
    .filter((attempt) => attempt.status === "PendingGrading")
    .sort((left, right) => left.submittedAt.localeCompare(right.submittedAt))
    .map((attempt) => ({
      ...attempt,
      recipient: recipients.find((recipient) => recipient.id === attempt.recipientId),
      assessmentVersion: versions.find((version) => version.id === attempt.assessmentVersionId),
    }));

  return NextResponse.json(pending, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "Evaluator")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasSameOrigin(request))
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (!(await getRepository().isEvaluationOpen()))
    return NextResponse.json({ error: "Exams are not currently open." }, { status: 403 });

  const payload = examAttemptPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success)
    return NextResponse.json({ error: "Invalid exam submission" }, { status: 400 });

  try {
    const attempt = await submitExamAttempt(payload.data);
    return NextResponse.json({
      id: attempt.id,
      status: attempt.status,
      submittedAt: attempt.submittedAt,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof ExamValidationError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Unable to save exam attempt", error);
    return NextResponse.json({ error: "Unable to save exam attempt" }, { status: 500 });
  }
}