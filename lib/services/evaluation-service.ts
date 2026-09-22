import { getRepository } from "@/lib/repositories";
import type { CurrentUser } from "@/lib/auth/authorization";
import { calculateEvaluationMetrics } from "@/lib/services/evaluation-scoring";
import type { EvaluationInput, EvaluationResult, EvaluationSummary } from "@/lib/types";

export class EvaluationValidationError extends Error {}

export async function calculateEvaluation(input: EvaluationInput, evaluator: CurrentUser): Promise<EvaluationResult> {
  const repo = getRepository();
  const [categories, questions, recipients, topics] = await Promise.all([
    repo.getCategories(),
    repo.getQuestions(),
    repo.getRecipients(),
    repo.getTopics()
  ]);
  const activeQuestions = questions.filter((question) => question.isActive);
  const recipient = recipients.find((item) => item.id === input.recipientId);
  const topic = topics.find((item) => item.id === input.topicId);

  if (!recipient || recipient.status !== "Active") {
    throw new EvaluationValidationError("The selected recipient is not available for evaluation.");
  }

  if (!topic || topic.status !== "Active") {
    throw new EvaluationValidationError("The selected evaluation topic is not available.");
  }

  if (!activeQuestions.length || activeQuestions.some((question) => !Number.isInteger(input.scores[question.id]) || input.scores[question.id] < 1 || input.scores[question.id] > question.maxScore)) {
    throw new EvaluationValidationError("Every active question must have a valid score.");
  }

  const metrics = calculateEvaluationMetrics(categories, activeQuestions, input.scores);
  const id = `ev-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const evaluationDate = createdAt.slice(0, 10);
  const evaluationYear = evaluationDate.slice(0, 4);
  const existingEvaluations = await repo.getEvaluations();
  const duplicateSubmission = existingEvaluations.some((evaluation) =>
    evaluation.recipientId === recipient.id &&
    evaluation.topicId === topic.id &&
    evaluation.evaluationRound === input.evaluationRound &&
    evaluation.evaluationDate.slice(0, 4) === evaluationYear &&
    evaluation.evaluatorEmployeeId?.toLowerCase() === evaluator.employeeId.toLowerCase(),
  );

  if (duplicateSubmission) {
    throw new EvaluationValidationError("You have already evaluated this recipient for the selected course, round, and year.");
  }

  const details = activeQuestions.map((question) => ({
    id: `${id}-${question.id}`,
    evaluationId: id,
    questionId: question.id,
    score: input.scores[question.id] ?? 0
  }));

  return {
    id,
    recipientId: input.recipientId,
    topicId: topic.id,
    topicName: topic.topicName,
    evaluatorName: evaluator.name,
    evaluatorEmail: evaluator.email ?? "",
    evaluatorEmployeeId: evaluator.employeeId,
    bu: recipient.bu,
    buCode: recipient.buCode,
    evaluationDate,
    evaluationRound: input.evaluationRound,
    categoryActualScores: Object.fromEntries(metrics.categorySummary.map((category) => [category.categoryId, category.actualScore])),
    totalScore: metrics.overallAverage,
    percentage: metrics.percentage,
    result: metrics.result,
    comment: input.comment,
    createdAt,
    recipient,
    topic,
    categorySummary: metrics.categorySummary,
    details
  };
}

export async function submitEvaluation(input: EvaluationInput, evaluator: CurrentUser): Promise<EvaluationResult> {
  const repo = getRepository();
  const result = await calculateEvaluation(input, evaluator);
  await repo.saveEvaluation(result, result.details);
  return result;
}

export async function getEvaluationResults(): Promise<EvaluationResult[]> {
  const repo = getRepository();
  const [evaluations, questions, categories, recipients, topics] = await Promise.all([
    repo.getEvaluations(),
    repo.getQuestions(),
    repo.getCategories(),
    repo.getRecipients(),
    repo.getTopics()
  ]);
  const evaluationsMissingSummary = evaluations
    .filter((evaluation) => !evaluation.categoryActualScores && !evaluation.categorySummary?.length)
    .map((evaluation) => evaluation.id);
  const details = await repo.getEvaluationDetailsByEvaluationId(evaluationsMissingSummary);

  return evaluations.map((evaluation) => {
    const ownDetails = details.filter((detail) => detail.evaluationId === evaluation.id);
    const scores = Object.fromEntries(ownDetails.map((detail) => [detail.questionId, detail.score]));
    const storedCategoryActualScores = evaluation.categorySummary?.length
      ? Object.fromEntries(evaluation.categorySummary.map((category) => [category.categoryId, category.actualScore]))
      : undefined;
    const metrics = calculateEvaluationMetrics(
      categories,
      questions.filter((question) => question.isActive),
      scores,
      evaluation.categoryActualScores ?? storedCategoryActualScores,
    );
    return {
      ...evaluation,
      totalScore: metrics.overallAverage,
      percentage: metrics.percentage,
      result: metrics.result,
      recipient: recipients.find((recipient) => recipient.id === evaluation.recipientId),
      topic: topics.find((topic) => topic.id === evaluation.topicId),
      categorySummary: metrics.categorySummary,
      details: ownDetails
    };
  });
}

export async function getEvaluationSummaries(): Promise<EvaluationSummary[]> {
  const repo = getRepository();
  const [evaluations, categories, questions] = await Promise.all([
    getEvaluationResults(),
    repo.getCategories(),
    repo.getQuestions(),
  ]);
  const groups = new Map<string, EvaluationResult[]>();

  evaluations.forEach((evaluation) => {
    if (!Number.isInteger(evaluation.evaluationRound) || !evaluation.evaluationRound) return;
    const evaluationYear = evaluation.evaluationDate.slice(0, 4);
    const key = [evaluation.recipientId, evaluation.topicId, evaluation.evaluationRound, evaluationYear].join("::");
    const group = groups.get(key) ?? [];
    group.push(evaluation);
    groups.set(key, group);
  });

  return Array.from(groups.entries())
    .map(([id, group]) => {
      const first = group[0];
      const groupQuestions = questions.filter((question) => question.isActive);
      const averagedCategoryActualScores = Object.fromEntries(categories.map((category) => {
        const scores = group
          .map((evaluation) => evaluation.categorySummary.find((summary) => summary.categoryId === category.id)?.actualScore)
          .filter((score): score is number => typeof score === "number");
        const average = scores.reduce((sum, score) => sum + score, 0) / Math.max(scores.length, 1);
        return [category.id, average];
      }));
      const metrics = calculateEvaluationMetrics(categories, groupQuestions, {}, averagedCategoryActualScores);

      return {
        id,
        recipientId: first.recipientId,
        recipient: first.recipient,
        topicId: first.topicId,
        topicName: first.topicName,
        evaluationRound: first.evaluationRound as number,
        evaluationYear: first.evaluationDate.slice(0, 4),
        bu: first.bu,
        buCode: first.buCode,
        evaluatorCount: group.length,
        totalScore: metrics.overallAverage,
        percentage: metrics.percentage,
        result: metrics.result,
        categorySummary: metrics.categorySummary,
        evaluations: [...group].sort((left, right) => left.evaluatorName.localeCompare(right.evaluatorName)),
      };
    })
    .sort((left, right) => right.evaluationYear.localeCompare(left.evaluationYear) || left.topicName.localeCompare(right.topicName));
}
