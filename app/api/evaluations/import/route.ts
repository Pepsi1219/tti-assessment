import { NextResponse } from "next/server";
import {
  getCurrentUser,
  hasSameOrigin,
  isAdmin,
} from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import { calculateEvaluationMetrics } from "@/lib/services/evaluation-scoring";
import { resolveTopicAssessment } from "@/lib/services/assessment-version";
import type { Evaluation } from "@/lib/types";
import { evaluationImportPayloadSchema } from "@/lib/validation/api";

export async function POST(request: Request) {
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
  const payload = evaluationImportPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success)
    return NextResponse.json(
      {
        error:
          "Recipient, course, evaluator, date, and round are required.",
      },
      { status: 400 },
    );
  const { recipientId, topicId, evaluatorEmployeeId, evaluationDate, evaluationRound, categoryScores } = payload.data;
  const repo = getRepository();
  const [recipients, topics, evaluators, existing] =
    await Promise.all([
      repo.getRecipients(),
      repo.getTopics(),
      repo.getEvaluators(),
      repo.getEvaluations(),
    ]);
  const recipient = recipients.find(
    (item) => item.id === recipientId && item.status === "Active",
  );
  const topic = topics.find(
    (item) => item.id === topicId && item.status === "Active",
  );
  if (!recipient || !topic)
    return NextResponse.json(
      { error: "The selected recipient or course is not available." },
      { status: 400 },
    );
  let assessment;
  try {
    assessment = await resolveTopicAssessment(repo, topic);
  } catch {
    return NextResponse.json(
      { error: "The course assessment is not configured." },
      { status: 409 },
    );
  }
  if (assessment.kind === "exam")
    return NextResponse.json(
      { error: "Exams must use the exam grading workflow." },
      { status: 400 },
    );
  const categories = assessment.categories;
  const questions = assessment.questions;
  if (categoryScores.length !== categories.length)
    return NextResponse.json(
      { error: `Exactly ${categories.length} category scores are required.` },
      { status: 400 },
    );
  const evaluator = evaluators.find(
    (item) =>
      item.status !== "Inactive" &&
      item.employeeId.toLowerCase() === evaluatorEmployeeId.toLowerCase(),
  );
  if (!evaluator)
    return NextResponse.json(
      { error: "The selected evaluator is not available." },
      { status: 400 },
    );
  const orderedCategories = categories
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const categoryActualScores: Record<string, number> = {};
  for (let index = 0; index < orderedCategories.length; index += 1) {
    const score = categoryScores[index];
    if (!Number.isFinite(score) || score < 0)
      return NextResponse.json(
        { error: `Invalid score for category ${index + 1}.` },
        { status: 400 },
      );
    categoryActualScores[orderedCategories[index].id] = score;
  }
  if (
    existing.some(
      (evaluation) =>
        evaluation.recipientId === recipient.id &&
        evaluation.topicId === topic.id &&
        evaluation.evaluationRound === evaluationRound &&
        evaluation.evaluationDate.slice(0, 4) === evaluationDate.slice(0, 4) &&
        (evaluation.evaluatorEmployeeId?.toLowerCase() ===
          evaluator.employeeId.toLowerCase() ||
          (!evaluation.evaluatorEmployeeId &&
            evaluation.evaluatorName.toLowerCase() ===
              evaluator.name.toLowerCase())),
    )
  )
    return NextResponse.json(
      { error: `An evaluation for ${evaluator.name} already exists.` },
      { status: 409 },
    );
  const metrics = calculateEvaluationMetrics(
    categories,
    questions.filter((question) => question.isActive),
    {},
    categoryActualScores,
    assessment,
  );
  const exceedsMaximum = metrics.categorySummary.findIndex(
    (category) => categoryActualScores[category.categoryId] > category.fullScore,
  );
  if (exceedsMaximum >= 0)
    return NextResponse.json(
      {
        error: `Score for ${metrics.categorySummary[exceedsMaximum].categoryName} exceeds its full score.`,
      },
      { status: 400 },
    );
  const now = new Date().toISOString();
  const evaluation: Evaluation = {
    id: `ev-import-${crypto.randomUUID()}`,
    recipientId: recipient.id,
    topicId: topic.id,
    topicName: topic.topicName,
    assessmentVersionId: topic.activeAssessmentVersionId ?? undefined,
    evaluatorName: evaluator.name,
    evaluatorEmail: evaluator.email,
    evaluatorEmployeeId: evaluator.employeeId,
    bu: recipient.bu,
    buCode: recipient.buCode,
    evaluationDate,
    evaluationRound,
    categoryActualScores,
    categorySummary: metrics.categorySummary,
    totalScore: metrics.overallAverage,
    percentage: metrics.percentage,
    result: metrics.result,
    comment: "",
    createdAt: now,
    source: "Microsoft Forms",
    importedAt: now,
  };
  await repo.saveEvaluation(evaluation, []);
  return NextResponse.json({ imported: 1, evaluation });
}
