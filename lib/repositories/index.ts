import type { EvaluationRepository } from "@/lib/repositories/evaluation-repository";
import { FirestoreEvaluationRepository } from "@/lib/repositories/firestore-repository";
import { InMemoryEvaluationRepository } from "@/lib/repositories/in-memory-repository";

const globalForRepo = globalThis as unknown as {
  repo?: EvaluationRepository;
  storageProvider?: string;
};

export function getRepository(): EvaluationRepository {
  const storageProvider =
    process.env.STORAGE_PROVIDER === "firestore" ? "firestore" : "memory";
  const hasCurrentContract =
    globalForRepo.repo &&
    typeof globalForRepo.repo.isEvaluationOpen === "function" &&
    typeof globalForRepo.repo.setEvaluationOpen === "function" &&
    typeof globalForRepo.repo.getRecipients === "function" &&
    typeof globalForRepo.repo.getTopics === "function" &&
    typeof globalForRepo.repo.getEvaluationById === "function" &&
    typeof globalForRepo.repo.getEvaluationsByTopicId === "function" &&
    typeof globalForRepo.repo.getEvaluationsByEvaluator === "function" &&
    typeof globalForRepo.repo.getLatestEvaluationByTopicId === "function" &&
    typeof globalForRepo.repo.getLatestEvaluationRound === "function" &&
    typeof globalForRepo.repo.getEvaluationPage === "function" &&
    typeof globalForRepo.repo.getEvaluationDetailsByEvaluationId === "function" &&
    typeof globalForRepo.repo.getExamAttempts === "function" &&
    typeof globalForRepo.repo.saveExamAttempt === "function" &&
    typeof globalForRepo.repo.completeExamAttempt === "function" &&
    typeof globalForRepo.repo.upsertUser === "function" &&
    typeof globalForRepo.repo.deleteUser === "function" &&
    typeof globalForRepo.repo.getEvaluators === "function" &&
    typeof globalForRepo.repo.upsertEvaluator === "function" &&
    typeof globalForRepo.repo.deleteEvaluator === "function" &&
    typeof globalForRepo.repo.updateEvaluation === "function" &&
    typeof globalForRepo.repo.deleteEvaluation === "function";

  // Next.js Fast Refresh can retain an older repository instance after its
  // interface changes. Recreate it when the storage choice or contract changes.
  if (
    !hasCurrentContract ||
    globalForRepo.storageProvider !== storageProvider
  ) {
    globalForRepo.repo =
      storageProvider === "firestore"
        ? new FirestoreEvaluationRepository()
        : new InMemoryEvaluationRepository();
    globalForRepo.storageProvider = storageProvider;
  }
  return globalForRepo.repo!;
}
