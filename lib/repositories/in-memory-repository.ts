import {
  categories,
  evaluationDetails,
  evaluationTopics,
  evaluations,
  questions,
  recipients,
  systemSettings,
  evaluators,
  users,
} from "@/lib/data/seed";
import type { EvaluationRepository } from "@/lib/repositories/evaluation-repository";
import type {
  Evaluation,
  EvaluationDetail,
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
