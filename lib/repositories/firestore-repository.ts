import { FieldPath, type CollectionReference, type DocumentData } from "firebase-admin/firestore";
import { categories as seedCategories, questions as seedQuestions, trainers as seedTrainers, users as seedUsers } from "@/lib/data/seed";
import { getFirestoreDb } from "@/lib/firebase/admin";
import type { EvaluationRepository } from "@/lib/repositories/evaluation-repository";
import type { Category, Evaluation, EvaluationDetail, Question, Trainer, User } from "@/lib/types";

const collectionNames = {
  users: "users",
  trainers: "trainers",
  categories: "categories",
  questions: "questions",
  evaluations: "evaluations",
  evaluationDetails: "evaluationDetails"
};

export class FirestoreEvaluationRepository implements EvaluationRepository {
  private collection<T extends DocumentData>(name: string) {
    return getFirestoreDb().collection(name) as CollectionReference<T>;
  }

  private async getAll<T extends { id: string }>(name: string): Promise<T[]> {
    const snapshot = await this.collection<T>(name).get();
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as T);
  }

  private async seedIfEmpty<T extends { id: string }>(name: string, rows: T[]) {
    const collection = this.collection<T>(name);
    const snapshot = await collection.limit(1).get();
    if (!snapshot.empty) return;

    const batch = getFirestoreDb().batch();
    rows.forEach((row) => batch.set(collection.doc(row.id), row));
    await batch.commit();
  }

  async ensureSeedData() {
    await Promise.all([
      this.seedIfEmpty(collectionNames.users, seedUsers),
      this.seedIfEmpty(collectionNames.trainers, seedTrainers),
      this.seedIfEmpty(collectionNames.categories, seedCategories),
      this.seedIfEmpty(collectionNames.questions, seedQuestions)
    ]);
  }

  async getUsers(): Promise<User[]> {
    await this.ensureSeedData();
    return this.getAll<User>(collectionNames.users);
  }

  async getTrainers(): Promise<Trainer[]> {
    await this.ensureSeedData();
    const rows = await this.getAll<Trainer>(collectionNames.trainers);
    return rows.sort((a, b) => a.employeeId.localeCompare(b.employeeId));
  }

  async upsertTrainer(trainer: Trainer): Promise<Trainer> {
    await this.collection<Trainer>(collectionNames.trainers).doc(trainer.id).set(trainer, { merge: true });
    return trainer;
  }

  async deleteTrainer(id: string): Promise<void> {
    await this.collection<Trainer>(collectionNames.trainers).doc(id).set({ status: "Inactive", updatedAt: new Date().toISOString() } as Partial<Trainer>, { merge: true });
  }

  async getCategories(): Promise<Category[]> {
    await this.ensureSeedData();
    const rows = await this.getAll<Category>(collectionNames.categories);
    return rows.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getQuestions(): Promise<Question[]> {
    await this.ensureSeedData();
    const rows = await this.getAll<Question>(collectionNames.questions);
    return rows.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }

  async upsertQuestion(question: Question): Promise<Question> {
    await this.collection<Question>(collectionNames.questions).doc(question.id).set(question, { merge: true });
    return question;
  }

  async getEvaluations(): Promise<Evaluation[]> {
    const rows = await this.getAll<Evaluation>(collectionNames.evaluations);
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getEvaluationDetails(): Promise<EvaluationDetail[]> {
    return this.getAll<EvaluationDetail>(collectionNames.evaluationDetails);
  }

  async saveEvaluation(evaluation: Evaluation, details: EvaluationDetail[]): Promise<void> {
    const db = getFirestoreDb();
    const batch = db.batch();
    batch.set(this.collection<Evaluation>(collectionNames.evaluations).doc(evaluation.id), evaluation);
    details.forEach((detail) => {
      batch.set(this.collection<EvaluationDetail>(collectionNames.evaluationDetails).doc(detail.id), detail);
    });
    await batch.commit();
  }

  async getEvaluationDetailsByEvaluationId(evaluationIds: string[]): Promise<EvaluationDetail[]> {
    if (!evaluationIds.length) return [];
    const chunks = chunk(evaluationIds, 30);
    const results = await Promise.all(
      chunks.map((ids) =>
        this.collection<EvaluationDetail>(collectionNames.evaluationDetails)
          .where("evaluationId", "in", ids)
          .orderBy(FieldPath.documentId())
          .get()
      )
    );
    return results.flatMap((snapshot) => snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as EvaluationDetail));
  }
}

function chunk<T>(rows: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < rows.length; index += size) chunks.push(rows.slice(index, index + size));
  return chunks;
}
