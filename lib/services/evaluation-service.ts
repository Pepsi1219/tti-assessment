import { getRepository } from "@/lib/repositories";
import type { CurrentUser } from "@/lib/auth/authorization";
import {
  calculateEvaluationMetrics,
  getQuestionScore,
  isQuestionScored,
} from "@/lib/services/evaluation-scoring";
import { resolveTopicAssessment } from "@/lib/services/assessment-version";
import type { EvaluationInput, EvaluationResult, EvaluationSummary, Question } from "@/lib/types";

export class EvaluationValidationError extends Error {}

export function hasValidAnswer(question: Question, answer: unknown) {
  if (answer === undefined || answer === null) return false;
  const answerType = question.answerType ?? "rating";
  if (answerType === "text")
    return typeof answer === "string" && answer.trim().length > 0 && answer.length <= 5_000;
  if (answerType === "date") {
    if (typeof answer !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(answer))
      return false;
    const date = new Date(`${answer}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === answer;
  }
  if (answerType === "choice") {
    const selections = question.allowMultiple
      ? Array.isArray(answer) ? answer : null
      : typeof answer === "string" ? [answer] : null;
    return Boolean(
      selections?.length &&
      selections.every((value) => typeof value === "string" && question.options.includes(value)) &&
      new Set(selections).size === selections.length,
    );
  }
  if (answerType === "ranking") {
    return Array.isArray(answer) &&
      answer.length === question.options.length &&
      new Set(answer).size === question.options.length &&
      answer.every((value) => typeof value === "string" && question.options.includes(value));
  }
  if (answerType === "likert") {
    if (!answer || typeof answer !== "object" || Array.isArray(answer)) return false;
    const responses = answer as Record<string, unknown>;
    const statements = question.statements ?? [];
    return statements.length === Object.keys(responses).length &&
      statements.every((_, index) =>
        Number.isInteger(responses[String(index)]) &&
        Number(responses[String(index)]) >= 1 &&
        Number(responses[String(index)]) <= question.maxScore,
      );
  }
  if (answerType === "nps")
    return Number.isInteger(answer) && Number(answer) >= 0 && Number(answer) <= 10;
  return Number.isInteger(answer) && Number(answer) >= 1 && Number(answer) <= question.maxScore;
}

export async function calculateEvaluation(input: EvaluationInput, evaluator: CurrentUser): Promise<EvaluationResult> {
  const repo = getRepository();
  const [recipients, topics] = await Promise.all([
    repo.getRecipients(),
    repo.getTopics(),
  ]);
  const recipient = recipients.find((item) => item.id === input.recipientId);
  const topic = topics.find((item) => item.id === input.topicId);

  if (!recipient || recipient.status !== "Active") {
    throw new EvaluationValidationError("The selected recipient is not available for evaluation.");
  }

  if (!topic || topic.status !== "Active") {
    throw new EvaluationValidationError("The selected evaluation topic is not available.");
  }

  let assessment;
  try {
    assessment = await resolveTopicAssessment(repo, topic);
  } catch {
    throw new EvaluationValidationError(
      "The selected course does not have a published assessment version.",
    );
  }
  if (assessment.kind === "exam")
    throw new EvaluationValidationError(
      "Exams must be submitted through the exam workflow for grading.",
    );
  if (
    input.assessmentVersionId &&
    input.assessmentVersionId !== assessment.id
  )
    throw new EvaluationValidationError(
      "The course assessment changed while the form was open. Reload the course before submitting.",
    );
  const categories = assessment.categories;
  const activeQuestions = assessment.questions.filter((question) => question.isActive);
  const answers = { ...(input.answers ?? {}) };
  for (const question of activeQuestions) {
    if (
      answers[question.id] === undefined &&
      (question.answerType ?? "rating") === "rating" &&
      Number.isFinite(input.scores[question.id])
    ) {
      answers[question.id] = input.scores[question.id];
    }
  }
  if (!activeQuestions.length || activeQuestions.some((question) => {
    const answer = answers[question.id];
    const hasAnswer = hasValidAnswer(question, answer);
    const hasSubmittedAnswer = answer !== undefined && answer !== null && answer !== "";
    if (question.isRequired !== false && !hasAnswer) return true;
    if (hasSubmittedAnswer && !hasAnswer) return true;
    if (hasAnswer && isQuestionScored(question) && getQuestionScore(question, answer) === undefined)
      return true;
    return false;
  })) {
    throw new EvaluationValidationError("Every required question must have a valid answer.");
  }

  const scores = Object.fromEntries(activeQuestions.flatMap((question) => {
    if (!isQuestionScored(question)) return [];
    const answerScore = getQuestionScore(question, answers[question.id]);
    return answerScore === undefined ? [] : [[question.id, answerScore]];
  }));
  const scoringQuestions = activeQuestions.filter(isQuestionScored);
  const metrics = calculateEvaluationMetrics(categories, scoringQuestions, scores, undefined, assessment);
  const id = `ev-${crypto.randomUUID()}`;
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
    score: scores[question.id] ?? 0,
    answer: answers[question.id],
  }));

  return {
    id,
    recipientId: input.recipientId,
    topicId: topic.id,
    topicName: topic.topicName,
    assessmentVersionId:
      topic.activeAssessmentVersionId ?? undefined,
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
    assessmentVersion:
      topic.activeAssessmentVersionId ? assessment : undefined,
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

export async function getEvaluationResults(
  options: { includeDetails?: boolean } = {},
): Promise<EvaluationResult[]> {
  const repo = getRepository();
  const [evaluations, globalQuestions, globalCategories, recipients, topics, versions] = await Promise.all([
    repo.getEvaluations(),
    repo.getQuestions(),
    repo.getCategories(),
    repo.getRecipients(),
    repo.getTopics(),
    repo.getAssessmentVersions(),
  ]);
  const detailEvaluationIds = options.includeDetails === false
    ? evaluations
      .filter((evaluation) => !evaluation.categoryActualScores && !evaluation.categorySummary?.length)
      .map((evaluation) => evaluation.id)
    : evaluations.map((evaluation) => evaluation.id);
  const details = await repo.getEvaluationDetailsByEvaluationId(detailEvaluationIds);

  return evaluations.map((evaluation) => {
    const assessment = evaluation.assessmentVersionId
      ? versions.find((version) => version.id === evaluation.assessmentVersionId)
      : undefined;
    const questions = assessment?.questions ?? globalQuestions;
    const categories = assessment?.categories ?? globalCategories;
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
      assessment,
    );
    return {
      ...evaluation,
      totalScore: metrics.overallAverage,
      percentage: metrics.percentage,
      result: metrics.result,
      recipient: recipients.find((recipient) => recipient.id === evaluation.recipientId),
      topic: topics.find((topic) => topic.id === evaluation.topicId),
      assessmentVersion: assessment,
      categorySummary: metrics.categorySummary,
      details: options.includeDetails === false ? [] : ownDetails,
    };
  });
}

export async function getEvaluationSummaries(): Promise<EvaluationSummary[]> {
  const repo = getRepository();
  const [evaluations, assessmentVersions, globalCategories, globalQuestions] = await Promise.all([
    getEvaluationResults({ includeDetails: false }),
    repo.getAssessmentVersions(),
    repo.getCategories(),
    repo.getQuestions(),
  ]);
  const groups = new Map<string, EvaluationResult[]>();

  evaluations.forEach((evaluation) => {
    if (!Number.isInteger(evaluation.evaluationRound) || !evaluation.evaluationRound) return;
    const evaluationYear = evaluation.evaluationDate.slice(0, 4);
    const key = [evaluation.recipientId, evaluation.topicId, evaluation.assessmentVersionId ?? "legacy", evaluation.evaluationRound, evaluationYear].join("::");
    const group = groups.get(key) ?? [];
    group.push(evaluation);
    groups.set(key, group);
  });

  return Array.from(groups.entries())
    .map(([id, group]) => {
      const first = group[0];
      const assessment = assessmentVersions.find(
        (version) => version.id === first.assessmentVersionId,
      );
      const categories = assessment?.categories ?? globalCategories;
      const groupQuestions = (assessment?.questions ?? globalQuestions).filter(
        (question) => question.isActive,
      );
      const averagedCategoryActualScores = Object.fromEntries(categories.map((category) => {
        const scores = group
          .map((evaluation) => evaluation.categorySummary.find((summary) => summary.categoryId === category.id)?.actualScore)
          .filter((score): score is number => typeof score === "number");
        const average = scores.reduce((sum, score) => sum + score, 0) / Math.max(scores.length, 1);
        return [category.id, average];
      }));
      const metrics = calculateEvaluationMetrics(categories, groupQuestions, {}, averagedCategoryActualScores, assessment);

      return {
        id,
        recipientId: first.recipientId,
        recipient: first.recipient,
        topicId: first.topicId,
        topicName: first.topicName,
        assessmentVersionId: first.assessmentVersionId,
        assessmentVersionName: assessment?.name,
        assessmentVersionNumber: assessment?.version,
        overallPassThreshold: assessment?.overallPassThreshold,
        overallPassThresholdType: assessment?.overallPassThresholdType ?? "average",
        criticalCategoryPassThreshold:
          assessment?.criticalCategoryPassThreshold,
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
