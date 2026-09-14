import { NextResponse } from "next/server";
import {
  getCurrentUser,
  hasSameOrigin,
  isAdmin,
} from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import { calculateEvaluationMetrics } from "@/lib/services/evaluation-scoring";
import type { Evaluation } from "@/lib/types";

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
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const recipientId =
    typeof body?.recipientId === "string" ? body.recipientId.trim() : "";
  const topicId = typeof body?.topicId === "string" ? body.topicId.trim() : "";
  const evaluatorName =
    typeof body?.evaluatorName === "string" ? body.evaluatorName.trim() : "";
  const evaluationDate =
    typeof body?.evaluationDate === "string" ? body.evaluationDate.trim() : "";
  const evaluationRound = body?.evaluationRound;
  const categoryScores = Array.isArray(body?.categoryScores)
    ? body.categoryScores
    : [];
  if (
    !recipientId ||
    !topicId ||
    !evaluatorName ||
    !/^\d{4}-\d{2}-\d{2}$/.test(evaluationDate) ||
    !Number.isInteger(evaluationRound) ||
    Number(evaluationRound) < 1 ||
    Number(evaluationRound) > 99 ||
    categoryScores.length !== 7
  )
    return NextResponse.json(
      {
        error:
          "Recipient, course, evaluator, date, round, and 7 category scores are required.",
      },
      { status: 400 },
    );
  const repo = getRepository();
  const [recipients, topics, categories, questions, existing] =
    await Promise.all([
      repo.getRecipients(),
      repo.getTopics(),
      repo.getCategories(),
      repo.getQuestions(),
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
  const orderedCategories = categories
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .slice(0, 7);
  if (orderedCategories.length !== 7)
    return NextResponse.json(
      { error: "The system must have exactly 7 categories before importing." },
      { status: 400 },
    );
  const categoryActualScores: Record<string, number> = {};
  for (let index = 0; index < 7; index += 1) {
    const score = Number(categoryScores[index]);
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
        evaluation.evaluationRound === Number(evaluationRound) &&
        evaluation.evaluationDate === evaluationDate &&
        evaluation.evaluatorName.toLowerCase() === evaluatorName.toLowerCase(),
    )
  )
    return NextResponse.json(
      { error: `An evaluation for ${evaluatorName} already exists.` },
      { status: 409 },
    );
  const metrics = calculateEvaluationMetrics(
    categories,
    questions.filter((question) => question.isActive),
    {},
    categoryActualScores,
  );
  const exceedsMaximum = metrics.categorySummary.findIndex(
    (category, index) => Number(categoryScores[index]) > category.fullScore,
  );
  if (exceedsMaximum >= 0)
    return NextResponse.json(
      {
        error: `Score for category ${exceedsMaximum + 1} exceeds its full score.`,
      },
      { status: 400 },
    );
  const now = new Date().toISOString();
  const evaluation: Evaluation = {
    id: `ev-import-${Date.now()}`,
    recipientId: recipient.id,
    topicId: topic.id,
    topicName: topic.topicName,
    evaluatorName,
    evaluatorEmail: "",
    bu: recipient.bu,
    buCode: recipient.buCode,
    evaluationDate,
    evaluationRound: Number(evaluationRound),
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
