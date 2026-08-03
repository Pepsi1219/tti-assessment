import { getRepository } from "@/lib/repositories";
import type { CategorySummary, EvaluationInput, EvaluationResult } from "@/lib/types";

export async function calculateEvaluation(input: EvaluationInput): Promise<EvaluationResult> {
  const repo = getRepository();
  const [categories, questions, trainers] = await Promise.all([
    repo.getCategories(),
    repo.getQuestions(),
    repo.getTrainers()
  ]);
  const activeQuestions = questions.filter((question) => question.isActive);
  const summaries: CategorySummary[] = categories.map((category) => {
    const categoryQuestions = activeQuestions.filter((question) => question.categoryId === category.id);
    const actualScore = categoryQuestions.reduce((sum, question) => sum + (input.scores[question.id] ?? 0) * question.weight, 0);
    const fullScore = categoryQuestions.reduce((sum, question) => sum + question.maxScore * question.weight, 0);
    return {
      categoryId: category.id,
      categoryName: category.categoryName,
      actualScore,
      fullScore,
      average: fullScore ? Number(((actualScore / fullScore) * 5).toFixed(2)) : 0,
      isCritical: Boolean(category.isCritical)
    };
  });
  const overallAvg = Number((summaries.reduce((sum, item) => sum + item.average, 0) / Math.max(summaries.length, 1)).toFixed(2));
  const percentage = Number(((overallAvg / 5) * 100).toFixed(2));
  const criticalPass = summaries.filter((item) => item.isCritical).every((item) => item.average >= 3);
  const result = overallAvg >= 3.5 && criticalPass ? "Pass" : "Fail";
  const id = `ev-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const details = activeQuestions.map((question) => ({
    id: `${id}-${question.id}`,
    evaluationId: id,
    questionId: question.id,
    score: input.scores[question.id] ?? 0
  }));

  return {
    id,
    trainerId: input.trainerId,
    evaluatorName: input.evaluatorName,
    evaluatorEmail: input.evaluatorEmail,
    bu: input.bu,
    evaluationDate: createdAt.slice(0, 10),
    totalScore: overallAvg,
    percentage,
    result,
    comment: input.comment,
    createdAt,
    trainer: trainers.find((trainer) => trainer.id === input.trainerId),
    categorySummary: summaries,
    details
  };
}

export async function submitEvaluation(input: EvaluationInput): Promise<EvaluationResult> {
  const repo = getRepository();
  const result = await calculateEvaluation(input);
  await repo.saveEvaluation(result, result.details);
  return result;
}

export async function getEvaluationResults(): Promise<EvaluationResult[]> {
  const repo = getRepository();
  const [evaluations, details, questions, categories, trainers] = await Promise.all([
    repo.getEvaluations(),
    repo.getEvaluationDetails(),
    repo.getQuestions(),
    repo.getCategories(),
    repo.getTrainers()
  ]);

  return evaluations.map((evaluation) => {
    const ownDetails = details.filter((detail) => detail.evaluationId === evaluation.id);
    const scores = Object.fromEntries(ownDetails.map((detail) => [detail.questionId, detail.score]));
    const categorySummary = categories.map((category) => {
      const categoryQuestions = questions.filter((question) => question.categoryId === category.id);
      const actualScore = categoryQuestions.reduce((sum, question) => sum + (scores[question.id] ?? 0) * question.weight, 0);
      const fullScore = categoryQuestions.reduce((sum, question) => sum + question.maxScore * question.weight, 0);
      return {
        categoryId: category.id,
        categoryName: category.categoryName,
        actualScore,
        fullScore,
        average: fullScore ? Number(((actualScore / fullScore) * 5).toFixed(2)) : 0,
        isCritical: Boolean(category.isCritical)
      };
    });
    return {
      ...evaluation,
      trainer: trainers.find((trainer) => trainer.id === evaluation.trainerId),
      categorySummary,
      details: ownDetails
    };
  });
}
