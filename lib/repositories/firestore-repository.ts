import {
  FieldPath,
  type CollectionReference,
  type DocumentData,
} from "firebase-admin/firestore";
import { getFirestoreDb } from "@/lib/firebase/admin";
import type {
  EvaluationPage,
  EvaluationPageCursor,
  EvaluationPageQuery,
  EvaluationRepository,
} from "@/lib/repositories/evaluation-repository";
import type {
  Category,
  AssessmentVersion,
  Evaluation,
  EvaluationDetail,
  ExamAttempt,
  EvaluationRecipient,
  EvaluationTopic,
  Question,
  Evaluator,
  User,
} from "@/lib/types";

const collectionNames = {
  users: "users",
  trainers: "trainers",
  recipients: "recipients",
  evaluationTopics: "evaluationTopics",
  assessmentVersions: "assessmentVersions",
  examAttempts: "examAttempts",
  categories: "categories",
  questions: "questions",
  evaluations: "evaluations",
  evaluationDetails: "evaluationDetails",
  systemSettings: "systemSettings",
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
    names.forEach((name) => {
      for (const key of this.readCache.keys()) {
        if (key === name || key.startsWith(`${name}:`))
          this.readCache.delete(key);
      }
    });
  }

  async isEvaluationOpen(): Promise<boolean> {
    const document = await this.collection<{ isOpen?: boolean }>(
      collectionNames.systemSettings,
    )
      .doc("evaluation")
      .get();
    return document.data()?.isOpen !== false;
  }

  async setEvaluationOpen(isOpen: boolean): Promise<void> {
    await this.collection(collectionNames.systemSettings).doc("evaluation").set(
      { isOpen, updatedAt: new Date().toISOString() },
      { merge: true },
    );
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

  async deleteUser(id: string): Promise<void> {
    await this.collection<User>(collectionNames.users).doc(id).delete();
    this.invalidateCache(collectionNames.users);
  }

  async getEvaluators(): Promise<Evaluator[]> {
    const rows = await this.getCachedAll<Evaluator>(
      collectionNames.trainers,
      MASTER_DATA_CACHE_TTL_MS,
    );
    return rows
      .filter((evaluator) => evaluator.role === "Evaluator")
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async upsertEvaluator(evaluator: Evaluator): Promise<Evaluator> {
    await this.collection<Evaluator>(collectionNames.trainers)
      .doc(evaluator.id)
      .set(evaluator, { merge: true });
    this.invalidateCache(collectionNames.trainers);
    return evaluator;
  }

  async deleteEvaluator(id: string): Promise<void> {
    await this.collection<Evaluator>(collectionNames.trainers).doc(id).delete();
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

  async getAssessmentVersions(): Promise<AssessmentVersion[]> {
    const rows = await this.getCachedAll<AssessmentVersion>(
      collectionNames.assessmentVersions,
      MASTER_DATA_CACHE_TTL_MS,
    );
    return rows.sort(
      (left, right) =>
        left.name.localeCompare(right.name) || left.version - right.version,
    );
  }

  async upsertAssessmentVersion(
    version: AssessmentVersion,
  ): Promise<AssessmentVersion> {
    await this.collection<AssessmentVersion>(collectionNames.assessmentVersions)
      .doc(version.id)
      .set(version);
    this.invalidateCache(collectionNames.assessmentVersions);
    return version;
  }

  async deleteAssessmentVersion(
    id: string,
  ): Promise<"deleted" | "in-use" | "not-found"> {
    const versionRef = this.collection<AssessmentVersion>(
      collectionNames.assessmentVersions,
    ).doc(id);
    const version = await versionRef.get();
    if (!version.exists) return "not-found";

    const references = await Promise.all([
      this.collection<EvaluationTopic>(collectionNames.evaluationTopics)
        .where("activeAssessmentVersionId", "==", id)
        .limit(1)
        .get(),
      this.collection<Evaluation>(collectionNames.evaluations)
        .where("assessmentVersionId", "==", id)
        .limit(1)
        .get(),
      this.collection<ExamAttempt>(collectionNames.examAttempts)
        .where("assessmentVersionId", "==", id)
        .limit(1)
        .get(),
    ]);
    if (references.some((reference) => !reference.empty)) return "in-use";

    await versionRef.delete();
    this.invalidateCache(collectionNames.assessmentVersions);
    return "deleted";
  }

  async getExamAttempts(): Promise<ExamAttempt[]> {
    return this.getCachedAll<ExamAttempt>(
      collectionNames.examAttempts,
      EVALUATION_CACHE_TTL_MS,
    );
  }

  async saveExamAttempt(attempt: ExamAttempt): Promise<void> {
    await this.collection<ExamAttempt>(collectionNames.examAttempts)
      .doc(attempt.id)
      .create(attempt);
    this.invalidateCache(collectionNames.examAttempts);
  }

  async completeExamAttempt(
    attempt: ExamAttempt,
    evaluation: Evaluation,
    details: EvaluationDetail[],
  ): Promise<boolean> {
    const db = getFirestoreDb();
    const attemptRef = this.collection<ExamAttempt>(collectionNames.examAttempts).doc(attempt.id);
    const completed = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(attemptRef);
      if (snapshot.data()?.status !== "PendingGrading") return false;

      transaction.set(attemptRef, attempt);
      transaction.create(
        this.collection<Evaluation>(collectionNames.evaluations).doc(evaluation.id),
        evaluation,
      );
      details.forEach((detail) => {
        transaction.create(
          this.collection<EvaluationDetail>(collectionNames.evaluationDetails).doc(detail.id),
          detail,
        );
      });
      return true;
    });
    if (completed) {
      this.invalidateCache(
        collectionNames.examAttempts,
        collectionNames.evaluations,
        collectionNames.evaluationDetails,
      );
    }
    return completed;
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

  async getEvaluationsByEvaluator(
    employeeId: string,
    email?: string | null,
  ): Promise<Evaluation[]> {
    const normalizedEmployeeId = employeeId.trim().toLowerCase();
    const normalizedEmail = email?.trim().toLowerCase();
    const cacheKey = `${collectionNames.evaluations}:evaluator:${normalizedEmployeeId}:${normalizedEmail ?? ""}`;
    const cached = this.readCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now())
      return cached.rows as Evaluation[];

    const snapshots = await Promise.all([
      normalizedEmployeeId
        ? this.collection<Evaluation>(collectionNames.evaluations)
            .where("evaluatorEmployeeId", "==", employeeId.trim())
            .get()
        : Promise.resolve(null),
      normalizedEmail
        ? this.collection<Evaluation>(collectionNames.evaluations)
            .where("evaluatorEmail", "==", normalizedEmail)
            .get()
        : Promise.resolve(null),
    ]);
    const rowsById = new Map<string, Evaluation>();
    for (const snapshot of snapshots) {
      snapshot?.docs.forEach((doc) =>
        rowsById.set(doc.id, { ...doc.data(), id: doc.id } as Evaluation),
      );
    }
    const rows = [...rowsById.values()].sort(
      (a, b) =>
        b.evaluationDate.localeCompare(a.evaluationDate) ||
        b.createdAt.localeCompare(a.createdAt) ||
        b.id.localeCompare(a.id),
    );
    this.readCache.set(cacheKey, {
      expiresAt: Date.now() + EVALUATION_CACHE_TTL_MS,
      rows,
    });
    return rows;
  }

  async getEvaluationById(id: string): Promise<Evaluation | undefined> {
    const snapshot = await this.collection<Evaluation>(collectionNames.evaluations)
      .doc(id)
      .get();
    return snapshot.exists ? ({ ...snapshot.data(), id: snapshot.id } as Evaluation) : undefined;
  }

  async getEvaluationsByTopicId(topicId: string): Promise<Evaluation[]> {
    const cacheKey = `${collectionNames.evaluations}:topic:${topicId}`;
    const cached = this.readCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now())
      return cached.rows as Evaluation[];

    const snapshot = await this.collection<Evaluation>(collectionNames.evaluations)
      .where("topicId", "==", topicId)
      .get();
    const rows = snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id }) as Evaluation,
    );
    this.readCache.set(cacheKey, {
      expiresAt: Date.now() + EVALUATION_CACHE_TTL_MS,
      rows,
    });
    return rows;
  }

  async getLatestEvaluationByTopicId(
    topicId: string,
  ): Promise<Evaluation | undefined> {
    const cacheKey = `${collectionNames.evaluations}:latest-topic:${topicId}`;
    const cached = this.readCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now())
      return cached.rows[0] as Evaluation | undefined;

    const snapshot = await this.collection<Evaluation>(collectionNames.evaluations)
      .where("topicId", "==", topicId)
      .orderBy("evaluationDate", "desc")
      .orderBy("createdAt", "desc")
      .orderBy(FieldPath.documentId(), "desc")
      .limit(1)
      .get();
    const latest = snapshot.docs[0];
    const rows = latest
      ? [{ ...latest.data(), id: latest.id } as Evaluation]
      : [];
    this.readCache.set(cacheKey, {
      expiresAt: Date.now() + EVALUATION_CACHE_TTL_MS,
      rows,
    });
    return rows[0];
  }

  async getLatestEvaluationRound(
    topicId: string,
    businessUnit: { buCode?: string; bu?: string },
  ): Promise<number | undefined> {
    const matches = [
      businessUnit.buCode
        ? { field: "buCode", value: businessUnit.buCode }
        : undefined,
      businessUnit.bu ? { field: "bu", value: businessUnit.bu } : undefined,
    ].filter((item): item is { field: "buCode" | "bu"; value: string } => Boolean(item));
    if (!matches.length) return undefined;

    const cacheKey = `${collectionNames.evaluations}:round:${topicId}:${businessUnit.buCode ?? ""}:${businessUnit.bu ?? ""}`;
    const cached = this.readCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now())
      return cached.rows[0] as number | undefined;

    const snapshots = await Promise.all(matches.map(({ field, value }) =>
      this.collection<Evaluation>(collectionNames.evaluations)
        .where("topicId", "==", topicId)
        .where(field, "==", value)
        .orderBy("evaluationRound", "desc")
        .limit(1)
        .get(),
    ));
    const rounds = snapshots.flatMap((snapshot) => {
      const round = snapshot.docs[0]?.get("evaluationRound");
      return Number.isInteger(round) && round > 0 ? [round as number] : [];
    });
    const round = rounds.length ? Math.max(...rounds) : undefined;
    this.readCache.set(cacheKey, {
      expiresAt: Date.now() + EVALUATION_CACHE_TTL_MS,
      rows: round === undefined ? [] : [round],
    });
    return round;
  }

  async getEvaluationPage(query: EvaluationPageQuery): Promise<EvaluationPage> {
    if (query.recipientIds?.length === 0) return { items: [] };

    const batchSize = query.pageSize + 1;
    const matches = (evaluation: Evaluation) =>
      (!query.evaluatorName || evaluation.evaluatorName === query.evaluatorName) &&
      (!query.buCode || evaluation.buCode === query.buCode) &&
      (!query.department || evaluation.bu === query.department) &&
      (!query.year || evaluation.evaluationDate.startsWith(query.year)) &&
      (!query.result || evaluation.result === query.result) &&
      (!query.recipientIds || query.recipientIds.includes(evaluation.recipientId));

    let cursor = query.cursor;
    const pageRows: Evaluation[] = [];
    const needsScan = Boolean(
      query.evaluatorName || query.buCode || query.department || query.year ||
      query.result || query.recipientIds,
    );
    const scanBatchSize = needsScan ? Math.max(100, batchSize) : batchSize;

    if (query.evaluatorEmployeeId || query.evaluatorEmail) {
      const evaluatorRows = await this.getEvaluationsByEvaluator(
        query.evaluatorEmployeeId ?? "",
        query.evaluatorEmail,
      );
      const matchingRows = evaluatorRows
        .filter(
          (evaluation) =>
            evaluation.topicId === query.topicId && matches(evaluation),
        )
        .sort(
          (a, b) =>
            b.evaluationDate.localeCompare(a.evaluationDate) ||
            b.createdAt.localeCompare(a.createdAt) ||
            b.id.localeCompare(a.id),
        );
      const cursorIndex = query.cursor
        ? matchingRows.findIndex((evaluation) => evaluation.id === query.cursor?.id)
        : -1;
      const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
      const pageRows = matchingRows.slice(startIndex, startIndex + batchSize);
      const hasMore = pageRows.length > query.pageSize;
      const items = pageRows.slice(0, query.pageSize);
      const lastItem = items.at(-1);
      return {
        items,
        nextCursor: hasMore && lastItem
          ? {
              evaluationDate: lastItem.evaluationDate,
              createdAt: lastItem.createdAt,
              id: lastItem.id,
            }
          : undefined,
      };
    }

    while (pageRows.length < batchSize) {
      let request = this.collection<Evaluation>(collectionNames.evaluations)
        .where("topicId", "==", query.topicId)
        .orderBy("evaluationDate", "desc")
        .orderBy("createdAt", "desc")
        .orderBy(FieldPath.documentId(), "desc");
      if (cursor)
        request = request.startAfter(
          cursor.evaluationDate,
          cursor.createdAt,
          cursor.id,
        );
      const snapshot = await request.limit(scanBatchSize).get();
      if (snapshot.empty) break;

      let reachedEnd = snapshot.size < scanBatchSize;
      for (const doc of snapshot.docs) {
        const evaluation = { ...doc.data(), id: doc.id } as Evaluation;
        cursor = {
          evaluationDate: evaluation.evaluationDate,
          createdAt: evaluation.createdAt,
          id: evaluation.id,
        };
        if (matches(evaluation)) pageRows.push(evaluation);
        if (pageRows.length >= batchSize) {
          reachedEnd = false;
          break;
        }
      }
      if (reachedEnd) break;
    }

    const hasMore = pageRows.length > query.pageSize;
    const items = pageRows.slice(0, query.pageSize);
    const lastItem = items.at(-1);
    return {
      items,
      nextCursor: hasMore && lastItem
        ? {
            evaluationDate: lastItem.evaluationDate,
            createdAt: lastItem.createdAt,
            id: lastItem.id,
          }
        : undefined,
    };
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
