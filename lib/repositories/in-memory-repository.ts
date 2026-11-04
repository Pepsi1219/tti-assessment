import {
  categories,
  assessmentVersions,
  evaluationDetails,
  examAttempts,
  evaluationTopics,
  evaluations,
  questions,
  recipients,
  systemSettings,
  evaluators,
  users,
} from "@/lib/data/seed";
import type {
  EvaluationPage,
  EvaluationPageQuery,
  EvaluationRepository,
} from "@/lib/repositories/evaluation-repository";
import type {
  Evaluation,
  AssessmentVersion,
  EvaluationDetail,
  ExamAttempt,
  EvaluationRecipient,
  EvaluationTopic,
  Question,
  Evaluator,
  User,
} from "@/lib/types";

export class InMemoryEvaluationRepository implements EvaluationRepository {
  async isEvaluationOpen() {
    return systemSettings.evaluationOpen;
  }

  async setEvaluationOpen(isOpen: boolean) {
    systemSettings.evaluationOpen = isOpen;
  }

  async getUsers() {
    return users;
  }

  async upsertUser(user: User) {
    const index = users.findIndex((item) => item.id === user.id);
    if (index >= 0) users[index] = user;
    else users.push(user);
    return user;
  }

  async deleteUser(id: string) {
    const index = users.findIndex((item) => item.id === id);
    if (index >= 0) users.splice(index, 1);
  }

  async getEvaluators() {
    return evaluators;
  }

  async upsertEvaluator(evaluator: Evaluator) {
    const index = evaluators.findIndex((item) => item.id === evaluator.id);
    if (index >= 0) evaluators[index] = evaluator;
    else evaluators.push(evaluator);
    return evaluator;
  }

  async deleteEvaluator(id: string) {
    const index = evaluators.findIndex((item) => item.id === id);
    if (index >= 0) evaluators.splice(index, 1);
  }

  async getRecipients() {
    return [...recipients].sort((a, b) =>
      a.recipientName.localeCompare(b.recipientName),
    );
  }

  async upsertRecipient(recipient: EvaluationRecipient) {
    const index = recipients.findIndex((item) => item.id === recipient.id);
    if (index >= 0) recipients[index] = recipient;
    else recipients.push(recipient);
    return recipient;
  }

  async getTopics() {
    return [...evaluationTopics].sort((a, b) =>
      a.topicName.localeCompare(b.topicName),
    );
  }

  async upsertTopic(topic: EvaluationTopic) {
    const index = evaluationTopics.findIndex((item) => item.id === topic.id);
    if (index >= 0) evaluationTopics[index] = topic;
    else evaluationTopics.push(topic);
    return topic;
  }

  async getAssessmentVersions() {
    return [...assessmentVersions].sort(
      (left, right) =>
        left.name.localeCompare(right.name) || left.version - right.version,
    );
  }

  async upsertAssessmentVersion(version: AssessmentVersion) {
    const index = assessmentVersions.findIndex((item) => item.id === version.id);
    if (index >= 0) assessmentVersions[index] = version;
    else assessmentVersions.push(version);
    return version;
  }

  async deleteAssessmentVersion(
    id: string,
  ): Promise<"deleted" | "in-use" | "not-found"> {
    const index = assessmentVersions.findIndex((item) => item.id === id);
    if (index < 0) return "not-found";
    if (
      evaluationTopics.some((topic) => topic.activeAssessmentVersionId === id) ||
      evaluations.some((evaluation) => evaluation.assessmentVersionId === id) ||
      examAttempts.some((attempt) => attempt.assessmentVersionId === id)
    )
      return "in-use";

    assessmentVersions.splice(index, 1);
    return "deleted";
  }

  async getExamAttempts() {
    return examAttempts;
  }

  async saveExamAttempt(attempt: ExamAttempt) {
    if (examAttempts.some((item) => item.id === attempt.id))
      throw new Error("Exam attempt already exists");
    examAttempts.push(attempt);
  }

  async completeExamAttempt(
    attempt: ExamAttempt,
    evaluation: Evaluation,
    details: EvaluationDetail[],
  ) {
    const index = examAttempts.findIndex((item) => item.id === attempt.id);
    if (index < 0 || examAttempts[index].status !== "PendingGrading") return false;
    examAttempts[index] = attempt;
    evaluations.push(evaluation);
    evaluationDetails.push(...details);
    return true;
  }

  async getCategories() {
    return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getQuestions() {
    return questions;
  }

  async upsertQuestion(question: Question) {
    const index = questions.findIndex((item) => item.id === question.id);
    if (index >= 0) questions[index] = question;
    else questions.push(question);
    return question;
  }

  async getEvaluations() {
    return evaluations;
  }

  async getEvaluationsByEvaluator(employeeId: string, email?: string | null) {
    const normalizedEmployeeId = employeeId.trim().toLowerCase();
    const normalizedEmail = email?.trim().toLowerCase();
    return evaluations
      .filter(
        (evaluation) =>
          evaluation.evaluatorEmployeeId?.toLowerCase() === normalizedEmployeeId ||
          (Boolean(normalizedEmail) &&
            evaluation.evaluatorEmail.toLowerCase() === normalizedEmail),
      )
      .sort(compareEvaluations);
  }

  async getEvaluationById(id: string) {
    return evaluations.find((evaluation) => evaluation.id === id);
  }

  async getEvaluationsByTopicId(topicId: string) {
    return evaluations.filter((evaluation) => evaluation.topicId === topicId);
  }

  async getLatestEvaluationByTopicId(topicId: string) {
    return evaluations
      .filter((evaluation) => evaluation.topicId === topicId)
      .sort(compareEvaluations)[0];
  }

  async getLatestEvaluationRound(
    topicId: string,
    businessUnit: { buCode?: string; bu?: string },
  ) {
    return evaluations
      .filter((evaluation) =>
        evaluation.topicId === topicId &&
        ((Boolean(businessUnit.buCode) && evaluation.buCode === businessUnit.buCode) ||
          (Boolean(businessUnit.bu) && evaluation.bu === businessUnit.bu)),
      )
      .reduce<number | undefined>((latest, evaluation) =>
        Number.isInteger(evaluation.evaluationRound) && evaluation.evaluationRound! > (latest ?? 0)
          ? evaluation.evaluationRound
          : latest,
      undefined);
  }

  async getEvaluationPage(query: EvaluationPageQuery): Promise<EvaluationPage> {
    if (query.recipientIds?.length === 0) return { items: [] };
    const recipientIds = query.recipientIds
      ? new Set(query.recipientIds)
      : undefined;
    const matching = evaluations
      .filter((evaluation) =>
        evaluation.topicId === query.topicId &&
        ((!query.evaluatorEmployeeId && !query.evaluatorEmail) ||
          evaluation.evaluatorEmployeeId?.toLowerCase() === query.evaluatorEmployeeId?.toLowerCase() ||
          (Boolean(query.evaluatorEmail) &&
            evaluation.evaluatorEmail.toLowerCase() === query.evaluatorEmail?.toLowerCase())) &&
        (!query.evaluatorName || evaluation.evaluatorName === query.evaluatorName) &&
        (!query.buCode || evaluation.buCode === query.buCode) &&
        (!query.department || evaluation.bu === query.department) &&
        (!query.year || evaluation.evaluationDate.startsWith(query.year)) &&
        (!query.result || evaluation.result === query.result) &&
        (!recipientIds || recipientIds.has(evaluation.recipientId)),
      )
      .sort(compareEvaluations);
    const cursorIndex = query.cursor
      ? matching.findIndex((evaluation) => evaluation.id === query.cursor?.id)
      : -1;
    const startIndex = cursorIndex >= 0
      ? cursorIndex + 1
      : query.cursor
        ? matching.findIndex((evaluation) => compareEvaluationToCursor(evaluation, query.cursor!) > 0)
        : 0;
    const pageRows = matching.slice(Math.max(startIndex, 0), Math.max(startIndex, 0) + query.pageSize + 1);
    const hasMore = pageRows.length > query.pageSize;
    const items = pageRows.slice(0, query.pageSize);
    const lastItem = items[items.length - 1];
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

  async getEvaluationDetails() {
    return evaluationDetails;
  }

  async getEvaluationDetailsByEvaluationId(evaluationIds: string[]) {
    const ids = new Set(evaluationIds);
    return evaluationDetails.filter((detail) => ids.has(detail.evaluationId));
  }

  async saveEvaluation(evaluation: Evaluation, details: EvaluationDetail[]) {
    evaluations.push(evaluation);
    evaluationDetails.push(...details);
  }

  async updateEvaluation(evaluation: Evaluation) {
    const index = evaluations.findIndex((item) => item.id === evaluation.id);
    if (index < 0) throw new Error("Evaluation not found");
    evaluations[index] = evaluation;
  }

  async deleteEvaluation(id: string) {
    const evaluationIndex = evaluations.findIndex(
      (evaluation) => evaluation.id === id,
    );
    if (evaluationIndex >= 0) evaluations.splice(evaluationIndex, 1);

    for (let index = evaluationDetails.length - 1; index >= 0; index -= 1) {
      if (evaluationDetails[index].evaluationId === id)
        evaluationDetails.splice(index, 1);
    }
  }
}

function compareEvaluations(
  left: Evaluation,
  right: Evaluation,
) {
  return right.evaluationDate.localeCompare(left.evaluationDate) ||
    right.createdAt.localeCompare(left.createdAt) ||
    right.id.localeCompare(left.id);
}

function compareEvaluationToCursor(
  evaluation: Evaluation,
  cursor: NonNullable<EvaluationPageQuery["cursor"]>,
) {
  return cursor.evaluationDate.localeCompare(evaluation.evaluationDate) ||
    cursor.createdAt.localeCompare(evaluation.createdAt) ||
    cursor.id.localeCompare(evaluation.id);
}
