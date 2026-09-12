import type { CategorySummary } from "@/lib/types";
import {
  CRITICAL_CATEGORY_PASS_THRESHOLD,
  OVERALL_PASS_THRESHOLD,
} from "@/lib/services/evaluation-scoring";

export const REPORT_CATEGORY_NAMES: Record<string, string> = {
  discipline: "Discipline",
  presentation: "Training Delivery Skills",
  communication: "Communication Skills",
  knowledge: "Knowledge Competency",
  methods: "Training Methods & Techniques",
  feedback: "Evaluation & Feedback Skills",
  professionalism: "Professionalism & Trainer Attitude",
};

export function getReportCategoryName(category: Pick<CategorySummary, "categoryId" | "categoryName" | "isCritical">) {
  const name = REPORT_CATEGORY_NAMES[category.categoryId] ?? category.categoryName;
  return category.isCritical ? `${name}*` : name;
}

export function getPassingCriteria(overallAverage: number, categories: CategorySummary[]) {
  return [
    {
      id: "overall",
      label: `Overall average must be at least ${OVERALL_PASS_THRESHOLD.toFixed(1)} out of 5`,
      actual: overallAverage,
      passed: overallAverage >= OVERALL_PASS_THRESHOLD,
    },
    ...categories.filter((category) => category.isCritical).map((category) => ({
      id: category.categoryId,
      label: `${REPORT_CATEGORY_NAMES[category.categoryId] ?? category.categoryName} must not be below ${CRITICAL_CATEGORY_PASS_THRESHOLD.toFixed(1)}`,
      actual: category.average,
      passed: category.average >= CRITICAL_CATEGORY_PASS_THRESHOLD,
    })),
  ];
}
