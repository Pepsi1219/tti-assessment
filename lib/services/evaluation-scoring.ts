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
};

export type ScoringCategorySummary = {
  categoryId: string;
  categoryName: string;
  actualScore: number;
  fullScore: number;
  average: number;
  isCritical: boolean;
};

export function calculateEvaluationMetrics(
  categories: ScoringCategory[],
  questions: ScoringQuestion[],
  scores: Record<string, number>,
  categoryActualScores?: Record<string, number>,
) {
  const categorySummary: ScoringCategorySummary[] = categories.map((category) => {
    const categoryQuestions = questions.filter((question) => question.categoryId === category.id);
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
      isCritical: Boolean(category.isCritical) || CRITICAL_CATEGORY_IDS.has(category.id),
    };
  });

  const overallAverage = Number(
    (categorySummary.reduce((sum, category) => sum + category.average, 0) / Math.max(categorySummary.length, 1)).toFixed(2),
  );
  const percentage = Number(((overallAverage / 5) * 100).toFixed(2));
  const passesCriticalCategories = categorySummary
    .filter((category) => category.isCritical)
    .every((category) => category.average >= CRITICAL_CATEGORY_PASS_THRESHOLD);
  const passesOverallAverage = overallAverage >= OVERALL_PASS_THRESHOLD;

  return {
    categorySummary,
    overallAverage,
    percentage,
    passesOverallAverage,
    passesCriticalCategories,
    result: passesOverallAverage && passesCriticalCategories ? "Pass" as const : "Fail" as const,
  };
}
