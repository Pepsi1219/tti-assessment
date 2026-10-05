import type { CurrentUser } from "@/lib/auth/authorization";
import { getRepository } from "@/lib/repositories";
import { resolveTopicAssessment } from "@/lib/services/assessment-version";
import { calculateEvaluationMetrics, isQuestionScored } from "@/lib/services/evaluation-scoring";
import { hasValidAnswer } from "@/lib/services/evaluation-service";
import type {
  Evaluation,
  EvaluationDetail,
  ExamAttempt,
  Question,
  QuestionAnswer,
} from "@/lib/types";

export class ExamValidationError extends Error {}

function isAutoScored(question: Question) {
  return question.isScored !== false &&
    question.answerType === "choice" &&
    question.correctAnswer !== undefined;
}

function matchesCorrectAnswer(question: Question, answer: unknown) {
  if (Array.isArray(question.correctAnswer)) {
    return Array.isArray(answer) &&
      answer.length === question.correctAnswer.length &&
      question.correctAnswer.every((value) => answer.includes(value));
  }
  return typeof answer === "string" && answer === question.correctAnswer;
}

export async function submitExamAttempt(input: {
  recipientId: string;
  topicId: string;
  assessmentVersionId: string;
  evaluationRound: number;
  answers: Record<string, QuestionAnswer>;
}) {
  const repo = getRepository();
  const [recipients, topics] = await Promise.all([
    repo.getRecipients(),
    repo.getTopics(),
  ]);
  const recipient = recipients.find((item) => item.id === input.recipientId && item.status === "Active");
  const topic = topics.find((item) => item.id === input.topicId && item.status === "Active");
  if (!recipient || !topic)
    throw new ExamValidationError("The selected recipient or course is unavailable.");

  let assessment;
  try {
    assessment = await resolveTopicAssessment(repo, topic);
  } catch {
    throw new ExamValidationError("The course exam is not available.");
  }
  if (assessment.kind !== "exam" || assessment.id !== input.assessmentVersionId)
    throw new ExamValidationError("The selected course exam changed. Reload and try again.");

  const activeQuestions = assessment.questions.filter((question) => question.isActive);
  const questionIds = new Set(activeQuestions.map((question) => question.id));
  if (!activeQuestions.length || Object.keys(input.answers).some((id) => !questionIds.has(id)))
    throw new ExamValidationError("The exam answers are invalid.");

  for (const question of activeQuestions) {
    const answer = input.answers[question.id];
    const valid = answer !== undefined && hasValidAnswer(question, answer);
    if (question.isRequired !== false && !valid)
      throw new ExamValidationError("Every required exam question must be answered.");
    if (answer !== undefined && !valid)
      throw new ExamValidationError("An exam answer is invalid.");
  }

  const automaticScores = Object.fromEntries(activeQuestions.flatMap((question) => {
    if (!isAutoScored(question)) return [];
    return [[question.id, matchesCorrectAnswer(question, input.answers[question.id]) ? question.maxScore : 0]];
  }));
  const attempt: ExamAttempt = {
    id: `exam-${crypto.randomUUID()}`,
    recipientId: recipient.id,
    topicId: topic.id,
    topicName: topic.topicName,
    assessmentVersionId: assessment.id,
    evaluationRound: input.evaluationRound,
    answers: input.answers,
    automaticScores,
    status: "PendingGrading",
    submittedAt: new Date().toISOString(),
  };
  await repo.saveExamAttempt(attempt);
  return attempt;
}

export async function gradeExamAttempt(
  attemptId: string,
  manualScores: Record<string, number>,
  grader: CurrentUser,
) {
  const repo = getRepository();
  const attempt = (await repo.getExamAttempts()).find((item) => item.id === attemptId);
  if (!attempt) throw new ExamValidationError("Exam attempt not found.");
  if (attempt.status !== "PendingGrading")
    throw new ExamValidationError("This exam has already been graded.");

  const [versions, recipients, topics] = await Promise.all([
    repo.getAssessmentVersions(),
    repo.getRecipients(),
    repo.getTopics(),
  ]);
  const assessment = versions.find((item) => item.id === attempt.assessmentVersionId && item.status === "Published");
  const recipient = recipients.find((item) => item.id === attempt.recipientId);
  const topic = topics.find((item) => item.id === attempt.topicId);
  if (!assessment || assessment.kind !== "exam" || !recipient || !topic)
    throw new ExamValidationError("The exam data for this attempt is unavailable.");

  const activeQuestions = assessment.questions.filter((question) => question.isActive);
  const manualQuestions = activeQuestions.filter((question) =>
    isQuestionScored(question) && !isAutoScored(question),
  );
  const expectedIds = new Set(manualQuestions.map((question) => question.id));
  if (Object.keys(manualScores).length !== expectedIds.size ||
      Object.keys(manualScores).some((id) => !expectedIds.has(id)))
    throw new ExamValidationError("A valid score is required for every manual-grading question.");

  for (const question of manualQuestions) {
    const score = manualScores[question.id];
    if (!Number.isFinite(score) || score < 0 || score > question.maxScore)
      throw new ExamValidationError(`The score for ${question.questionText} is out of range.`);
  }

  const scores = { ...attempt.automaticScores, ...manualScores };
  const scoredQuestions = activeQuestions.filter(isQuestionScored);
  const metrics = calculateEvaluationMetrics(
    assessment.categories,
    scoredQuestions,
    scores,
    undefined,
    assessment,
  );
  const gradedAt = new Date().toISOString();
  const evaluationId = `ev-${crypto.randomUUID()}`;
  const evaluation: Evaluation = {
    id: evaluationId,
    recipientId: recipient.id,
    topicId: topic.id,
    topicName: topic.topicName,
    assessmentVersionId: assessment.id,
    evaluatorName: grader.name,
    evaluatorEmail: grader.email ?? "",
    evaluatorEmployeeId: grader.employeeId,
    bu: recipient.bu,
    buCode: recipient.buCode,
    evaluationDate: attempt.submittedAt.slice(0, 10),
    evaluationRound: attempt.evaluationRound,
    categoryActualScores: Object.fromEntries(
      metrics.categorySummary.map((category) => [category.categoryId, category.actualScore]),
    ),
    totalScore: metrics.overallAverage,
    percentage: metrics.percentage,
    result: metrics.result,
    comment: "",
    createdAt: gradedAt,
    source: "Application",
  };
  const details: EvaluationDetail[] = activeQuestions.map((question) => ({
    id: `${evaluationId}-${question.id}`,
    evaluationId,
    questionId: question.id,
    score: scores[question.id] ?? 0,
    answer: attempt.answers[question.id],
  }));
  const completedAttempt: ExamAttempt = {
    ...attempt,
    status: "Graded",
    gradedAt,
    gradedByName: grader.name,
    gradedByEmail: grader.email ?? "",
    gradedByEmployeeId: grader.employeeId,
    evaluationId,
  };

  if (!(await repo.completeExamAttempt(completedAttempt, evaluation, details)))
    throw new ExamValidationError("This exam was graded by another reviewer. Refresh the queue.");

  return { attempt: completedAttempt, evaluation };
}