import {
  FieldPath,
  type CollectionReference,
  type DocumentData,
} from "firebase-admin/firestore";
import { getFirestoreDb } from "@/lib/firebase/admin";
import type { EvaluationRepository } from "@/lib/repositories/evaluation-repository";
import type {
  Category,
  Evaluation,
  EvaluationDetail,
  EvaluationRecipient,
  EvaluationTopic,
  Question,
  Trainer,
  User,
} from "@/lib/types";

const collectionNames = {
  users: "users",
  trainers: "trainers",
  recipients: "recipients",
  evaluationTopics: "evaluationTopics",
  categories: "categories",
  questions: "questions",
  evaluations: "evaluations",
  evaluationDetails: "evaluationDetails",
};

const MASTER_DATA_CACHE_TTL_MS = 5 * 60 * 1000;
const EVALUATION_CACHE_TTL_MS = 30 * 1000;

export class FirestoreEvaluationRepository implements EvaluationRepository {
  private readonly readCache = new Map<
    string,
    { expiresAt: number; rows: unknown[] }
  >();

  private collection<T extends DocumentData>(name: string) {
    return getFirestoreDb().collection(name) as CollectionReference<T>;
  }

  private async getAll<T extends { id: string }>(name: string): Promise<T[]> {
    const snapshot = await this.collection<T>(name).get();
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as T);
  }

  private async getCachedAll<T extends { id: string }>(
    name: string,
    ttlMs: number,
  ): Promise<T[]> {
    const cached = this.readCache.get(name);
    if (cached && cached.expiresAt > Date.now()) return cached.rows as T[];

    const rows = await this.getAll<T>(name);
    this.readCache.set(name, { expiresAt: Date.now() + ttlMs, rows });
    return rows;
  }

  private invalidateCache(...names: string[]) {
    names.forEach((name) => this.readCache.delete(name));
  }

  async getUsers(): Promise<User[]> {
    return this.getCachedAll<User>(
      collectionNames.users,
      MASTER_DATA_CACHE_TTL_MS,
    );
  }

  async upsertUser(user: User): Promise<User> {
    await this.collection<User>(collectionNames.users)
      .doc(user.id)
      .set(user, { merge: true });
    this.invalidateCache(collectionNames.users);
    return user;
  }

  async deleteEvaluator(id: string): Promise<void> {
    await this.collection<User>(collectionNames.users).doc(id).delete();
    this.invalidateCache(collectionNames.users);
  }

  async getTrainers(): Promise<Trainer[]> {
    const rows = await this.getCachedAll<Trainer>(
      collectionNames.trainers,
      MASTER_DATA_CACHE_TTL_MS,
    );
    return rows.sort((a, b) => a.employeeId.localeCompare(b.employeeId));
  }

  async upsertTrainer(trainer: Trainer): Promise<Trainer> {
    await this.collection<Trainer>(collectionNames.trainers)
      .doc(trainer.id)
      .set(trainer, { merge: true });
    this.invalidateCache(collectionNames.trainers);
    return trainer;
  }

  async deleteTrainer(id: string): Promise<void> {
    await this.collection<Trainer>(collectionNames.trainers)
      .doc(id)
      .set(
        {
          status: "Inactive",
          updatedAt: new Date().toISOString(),
        } as Partial<Trainer>,
        { merge: true },
      );
    this.invalidateCache(collectionNames.trainers);
  }

  async getRecipients(): Promise<EvaluationRecipient[]> {
    const rows = await this.getCachedAll<EvaluationRecipient>(
      collectionNames.recipients,
      MASTER_DATA_CACHE_TTL_MS,
    );
    return rows.sort((a, b) => a.recipientName.localeCompare(b.recipientName));
  }

  async upsertRecipient(
    recipient: EvaluationRecipient,
  ): Promise<EvaluationRecipient> {
    await this.collection<EvaluationRecipient>(collectionNames.recipients)
      .doc(recipient.id)
      .set(recipient, { merge: true });
    this.invalidateCache(collectionNames.recipients);
    return recipient;
  }

  async getTopics(): Promise<EvaluationTopic[]> {
    const rows = await this.getCachedAll<EvaluationTopic>(
      collectionNames.evaluationTopics,
      MASTER_DATA_CACHE_TTL_MS,
    );
    return rows.sort((a, b) => a.topicName.localeCompare(b.topicName));
  }

  async upsertTopic(topic: EvaluationTopic): Promise<EvaluationTopic> {
    await this.collection<EvaluationTopic>(collectionNames.evaluationTopics)
      .doc(topic.id)
      .set(topic, { merge: true });
    this.invalidateCache(collectionNames.evaluationTopics);
    return topic;
  }

  async getCategories(): Promise<Category[]> {
    const rows = await this.getCachedAll<Category>(
      collectionNames.categories,
      MASTER_DATA_CACHE_TTL_MS,
    );
    return rows.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getQuestions(): Promise<Question[]> {
    const rows = await this.getCachedAll<Question>(
      collectionNames.questions,
      MASTER_DATA_CACHE_TTL_MS,
    );
    return rows.sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true }),
    );
  }

  async upsertQuestion(question: Question): Promise<Question> {
    await this.collection<Question>(collectionNames.questions)
      .doc(question.id)
      .set(question, { merge: true });
    this.invalidateCache(collectionNames.questions);
    return question;
  }

  async getEvaluations(): Promise<Evaluation[]> {
    const rows = await this.getCachedAll<Evaluation>(
      collectionNames.evaluations,
      EVALUATION_CACHE_TTL_MS,
    );
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getEvaluationDetails(): Promise<EvaluationDetail[]> {
    return this.getCachedAll<EvaluationDetail>(
      collectionNames.evaluationDetails,
      EVALUATION_CACHE_TTL_MS,
    );
  }

  async saveEvaluation(
    evaluation: Evaluation,
    details: EvaluationDetail[],
  ): Promise<void> {
    const db = getFirestoreDb();
    const batch = db.batch();
    batch.set(
      this.collection<Evaluation>(collectionNames.evaluations).doc(
        evaluation.id,
      ),
      evaluation,
    );
    details.forEach((detail) => {
      batch.set(
        this.collection<EvaluationDetail>(
          collectionNames.evaluationDetails,
        ).doc(detail.id),
        detail,
      );
    });
    await batch.commit();
    this.invalidateCache(
      collectionNames.evaluations,
      collectionNames.evaluationDetails,
    );
  }

  async updateEvaluation(evaluation: Evaluation): Promise<void> {
    await this.collection<Evaluation>(collectionNames.evaluations)
      .doc(evaluation.id)
      .set(evaluation);
    this.invalidateCache(collectionNames.evaluations);
  }

  async deleteEvaluation(id: string): Promise<void> {
    const db = getFirestoreDb();
    const details = await this.collection<EvaluationDetail>(
      collectionNames.evaluationDetails,
    )
      .where("evaluationId", "==", id)
      .get();
    const batch = db.batch();
    details.docs.forEach((detail) => batch.delete(detail.ref));
    batch.delete(
      this.collection<Evaluation>(collectionNames.evaluations).doc(id),
    );
    await batch.commit();
    this.invalidateCache(
      collectionNames.evaluations,
      collectionNames.evaluationDetails,
    );
  }

  async getEvaluationDetailsByEvaluationId(
    evaluationIds: string[],
  ): Promise<EvaluationDetail[]> {
    if (!evaluationIds.length) return [];
    const chunks = chunk(evaluationIds, 30);
    const results = await Promise.all(
      chunks.map((ids) =>
        this.collection<EvaluationDetail>(collectionNames.evaluationDetails)
          .where("evaluationId", "in", ids)
          .orderBy(FieldPath.documentId())
          .get(),
      ),
    );
    return results.flatMap((snapshot) =>
      snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id }) as EvaluationDetail,
      ),
    );
  }
}

function chunk<T>(rows: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < rows.length; index += size)
    chunks.push(rows.slice(index, index + size));
  return chunks;
}
