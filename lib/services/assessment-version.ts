import type { EvaluationRepository } from "@/lib/repositories/evaluation-repository";
import type { AssessmentVersion, EvaluationTopic } from "@/lib/types";

export async function resolveTopicAssessment(
  repo: EvaluationRepository,
  topic: EvaluationTopic,
) {
  if (topic.activeAssessmentVersionId) {
    const version = (await repo.getAssessmentVersions()).find(
      (item) =>
        item.id === topic.activeAssessmentVersionId &&
        item.status === "Published",
    );
    if (!version) throw new Error("The active assessment version is unavailable.");
    return version;
  }

  return getLegacyAssessment(repo);
}

export async function getLegacyAssessment(repo: EvaluationRepository): Promise<AssessmentVersion> {
  const [categories, questions] = await Promise.all([
    repo.getCategories(),
    repo.getQuestions(),
  ]);
  return {
    id: "legacy-shared-assessment",
    name: "Legacy shared assessment",
    version: 1,
    status: "Published",
    dashboardProfile: "category-score",
    overallPassThreshold: 3.5,
    criticalCategoryPassThreshold: 3,
    categories,
    questions,
    createdAt: "",
    updatedAt: "",
    publishedAt: "",
  } satisfies AssessmentVersion;
}