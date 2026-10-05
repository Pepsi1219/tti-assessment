export const OVERALL_PASS_THRESHOLD = 3.5;
export const CRITICAL_CATEGORY_PASS_THRESHOLD = 3;
const CRITICAL_CATEGORY_IDS = new Set(["presentation", "communication", "knowledge"]);

export type ScoringCategory = {
  id: string;
  categoryName: string;
  isCritical?: boolean;
};

export type ScoringQuestion = {
  id: string;
  categoryId: string;
  weight: number;
  maxScore: number;
  answerType?: "choice" | "text" | "rating" | "date" | "ranking" | "likert" | "nps";
  isScored?: boolean;
  allowMultiple?: boolean;
  options?: string[];
};

export function isQuestionScored(question: ScoringQuestion) {
  if (question.isScored !== undefined) return question.isScored;
  return question.answerType === undefined ||
    question.answerType === "rating" ||
    question.answerType === "likert" ||
    question.answerType === "nps";
}

export function getQuestionScore(
  question: ScoringQuestion,
  answer: unknown,
): number | undefined {
  if (!isQuestionScored(question)) return undefined;
  if (question.answerType === "likert") {
    if (!answer || typeof answer !== "object" || Array.isArray(answer)) return undefined;
    const values = Object.values(answer as Record<string, unknown>);
    const numericValues = values.filter(
      (value): value is number => typeof value === "number",
    );
    if (!numericValues.length || numericValues.length !== values.length)
      return undefined;
    return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
  }
  if (question.answerType === "choice") {
    if (question.allowMultiple || typeof answer !== "string") return undefined;
    const choiceIndex = question.options?.indexOf(answer) ?? -1;
    return choiceIndex >= 0 ? choiceIndex + 1 : undefined;
  }
  return typeof answer === "number" ? answer : undefined;
}

export type ScoringCategorySummary = {
  categoryId: string;
  categoryName: string;
  actualScore: number;
  fullScore: number;
  average: number;
  isCritical: boolean;
};

export type ScoringPolicy = {
  overallPassThreshold?: number;
  overallPassThresholdType?: "average" | "percentage";
  criticalCategoryPassThreshold?: number;
};

export function getOverallPassThresholdAverage(policy: ScoringPolicy = {}) {
  const threshold = policy.overallPassThreshold ?? OVERALL_PASS_THRESHOLD;
  return policy.overallPassThresholdType === "percentage" ? threshold / 20 : threshold;
}

export function calculateEvaluationMetrics(
  categories: ScoringCategory[],
  questions: ScoringQuestion[],
  scores: Record<string, number>,
  categoryActualScores?: Record<string, number>,
  policy: ScoringPolicy = {},
) {
  const overallPassThreshold = policy.overallPassThreshold ?? OVERALL_PASS_THRESHOLD;
  const criticalCategoryPassThreshold =
    policy.criticalCategoryPassThreshold ?? CRITICAL_CATEGORY_PASS_THRESHOLD;
  const categorySummary: ScoringCategorySummary[] = categories.map((category) => {
    const categoryQuestions = questions.filter(
      (question) => question.categoryId === category.id && isQuestionScored(question),
    );
    const fullScore = categoryQuestions.reduce(
      (sum, question) => sum + question.maxScore * question.weight,
      0,
    );

    const calculatedActualScore = categoryQuestions.reduce(
      (sum, question) => sum + (scores[question.id] ?? 0) * question.weight,
      0,
    );
    const override = categoryActualScores?.[category.id];
    const actualScore = typeof override === "number" && Number.isFinite(override) ? override : calculatedActualScore;

    return {
      categoryId: category.id,
      categoryName: category.categoryName,
      actualScore: Number(actualScore.toFixed(2)),
      fullScore,
      average: fullScore ? Number(((actualScore / fullScore) * 5).toFixed(2)) : 0,
      isCritical:
        category.isCritical ?? CRITICAL_CATEGORY_IDS.has(category.id),
    };
  });

  const scoredCategories = categorySummary.filter((category) => category.fullScore > 0);
  const overallAverage = Number(
    (scoredCategories.reduce((sum, category) => sum + category.average, 0) / Math.max(scoredCategories.length, 1)).toFixed(2),
  );
  const percentage = Number(((overallAverage / 5) * 100).toFixed(2));
  const passesCriticalCategories = scoredCategories
    .filter((category) => category.isCritical)
    .every((category) => category.average >= criticalCategoryPassThreshold);
  const passesOverallAverage = policy.overallPassThresholdType === "percentage"
    ? percentage >= overallPassThreshold
    : overallAverage >= overallPassThreshold;

  return {
    categorySummary,
    overallAverage,
    percentage,
    passesOverallAverage,
    passesCriticalCategories,
    result: passesOverallAverage && passesCriticalCategories ? "Pass" as const : "Fail" as const,
  };
}
