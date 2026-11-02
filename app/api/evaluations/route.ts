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
import {
  evaluationPayloadSchema,
  evaluationUpdatePayloadSchema,
} from "@/lib/validation/api";
import { getRepository } from "@/lib/repositories";
import { calculateEvaluationMetrics } from "@/lib/services/evaluation-scoring";
import {
  getLegacyAssessment,
  redactAssessmentAnswerKeys,
} from "@/lib/services/assessment-version";

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

  const responseResults = isAdmin(user)
    ? visibleResults
    : visibleResults.map((result) => result.assessmentVersion
      ? { ...result, assessmentVersion: redactAssessmentAnswerKeys(result.assessmentVersion) }
      : result);

  return NextResponse.json(responseResults, {
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
  if (!isAdmin(user) && !(await getRepository().isEvaluationOpen()))
    return NextResponse.json(
      { error: "Evaluation is not currently open." },
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
    const result = await submitEvaluation(payload.data, user);
    return NextResponse.json(isAdmin(user) || !result.assessmentVersion
      ? result
      : { ...result, assessmentVersion: redactAssessmentAnswerKeys(result.assessmentVersion) });
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

export async function PATCH(request: Request) {
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

  const payload = evaluationUpdatePayloadSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!payload.success)
    return NextResponse.json(
      { error: "Invalid evaluation data" },
      { status: 400 },
    );

  try {
    const repo = getRepository();
    const [evaluations, recipients, topics, evaluators, versions] =
      await Promise.all([
        repo.getEvaluations(),
        repo.getRecipients(),
        repo.getTopics(),
        repo.getEvaluators(),
        repo.getAssessmentVersions(),
      ]);
    const existing = evaluations.find(
      (evaluation) => evaluation.id === payload.data.id,
    );
    if (!existing)
      return NextResponse.json(
        { error: "Evaluation not found" },
        { status: 404 },
      );

    const recipient = recipients.find(
      (item) => item.id === payload.data.recipientId,
    );
    const topic = topics.find((item) => item.id === payload.data.topicId);
    const evaluator = evaluators.find(
      (item) =>
        item.employeeId.toLowerCase() ===
          payload.data.evaluatorEmployeeId.toLowerCase(),
    );
    if (!recipient || !topic || !evaluator)
      return NextResponse.json(
        { error: "Recipient, course, or evaluator was not found" },
        { status: 400 },
      );

    if (topic.id !== existing.topicId)
      return NextResponse.json(
        { error: "An evaluation cannot be moved to a different course." },
        { status: 400 },
      );
    const assessment = existing.assessmentVersionId
      ? versions.find((version) => version.id === existing.assessmentVersionId)
      : await getLegacyAssessment(repo);
    if (!assessment)
      return NextResponse.json(
        { error: "The assessment version for this result was not found." },
        { status: 409 },
      );
    const categories = assessment.categories;
    const categoryIds = new Set(categories.map((category) => category.id));
    const scoreIds = Object.keys(payload.data.categoryScores);
    if (
      scoreIds.length !== categories.length ||
      scoreIds.some((categoryId) => !categoryIds.has(categoryId))
    )
      return NextResponse.json(
        { error: "A score is required for every evaluation category" },
        { status: 400 },
      );

    const metrics = calculateEvaluationMetrics(
      categories,
      assessment.questions.filter((question) => question.isActive),
      {},
      payload.data.categoryScores,
      assessment,
    );
    const invalidCategory = metrics.categorySummary.find(
      (category) => category.actualScore > category.fullScore,
    );
    if (invalidCategory)
      return NextResponse.json(
        {
          error: `${invalidCategory.categoryName} exceeds its full score of ${invalidCategory.fullScore}`,
        },
        { status: 400 },
      );

    const evaluationYear = payload.data.evaluationDate.slice(0, 4);
    const duplicate = evaluations.some(
      (evaluation) =>
        evaluation.id !== existing.id &&
        evaluation.recipientId === recipient.id &&
        evaluation.topicId === topic.id &&
        evaluation.evaluationRound === payload.data.evaluationRound &&
        evaluation.evaluationDate.slice(0, 4) === evaluationYear &&
        (evaluation.evaluatorEmployeeId?.toLowerCase() ===
          evaluator.employeeId.toLowerCase() ||
          (!evaluation.evaluatorEmployeeId &&
            evaluation.evaluatorName.toLowerCase() ===
              evaluator.name.toLowerCase())),
    );
    if (duplicate)
      return NextResponse.json(
        {
          error:
            "This evaluator already has a result for the selected recipient, course, round, and year",
        },
        { status: 409 },
      );

    const updated = {
      ...existing,
      recipientId: recipient.id,
      topicId: topic.id,
      topicName: topic.topicName,
      evaluatorName: evaluator.name,
      evaluatorEmail: evaluator.email,
      evaluatorEmployeeId: evaluator.employeeId,
      bu: recipient.bu,
      buCode: recipient.buCode,
      evaluationDate: payload.data.evaluationDate,
      evaluationRound: payload.data.evaluationRound,
      categoryActualScores: Object.fromEntries(
        metrics.categorySummary.map((category) => [
          category.categoryId,
          category.actualScore,
        ]),
      ),
      categorySummary: metrics.categorySummary,
      totalScore: metrics.overallAverage,
      percentage: metrics.percentage,
      result: metrics.result,
      comment: payload.data.comment,
    };
    await repo.updateEvaluation(updated);
    return NextResponse.json({ evaluation: updated });
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
    console.error("Unable to update evaluation", error);
    return NextResponse.json(
      { error: "Unable to update evaluation" },
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
