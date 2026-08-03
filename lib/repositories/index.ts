import type { EvaluationRepository } from "@/lib/repositories/evaluation-repository";
import { FirestoreEvaluationRepository } from "@/lib/repositories/firestore-repository";
import { InMemoryEvaluationRepository } from "@/lib/repositories/in-memory-repository";

const globalForRepo = globalThis as unknown as { repo?: EvaluationRepository };

export function getRepository(): EvaluationRepository {
  if (!globalForRepo.repo) {
    if (process.env.STORAGE_PROVIDER === "firestore") {
      globalForRepo.repo = new FirestoreEvaluationRepository();
    } else {
      globalForRepo.repo = new InMemoryEvaluationRepository();
    }
  }
  return globalForRepo.repo;
}
