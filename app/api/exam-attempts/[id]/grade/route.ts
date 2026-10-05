import { NextResponse } from "next/server";
import { getCurrentUser, hasSameOrigin } from "@/lib/auth/authorization";
import { ExamValidationError, gradeExamAttempt } from "@/lib/services/exam-service";
import { examGradePayloadSchema } from "@/lib/validation/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "Evaluator")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasSameOrigin(request))
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });

  const payload = examGradePayloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success)
    return NextResponse.json({ error: "Invalid exam scores" }, { status: 400 });

  try {
    const { id } = await params;
    return NextResponse.json(await gradeExamAttempt(id, payload.data.scores, user));
  } catch (error) {
    if (error instanceof ExamValidationError) {
      const status = /already been graded|another reviewer/i.test(error.message) ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("Unable to grade exam", error);
    return NextResponse.json({ error: "Unable to grade exam" }, { status: 500 });
  }
}