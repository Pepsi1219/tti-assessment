import {
  categories,
  evaluationDetails,
  evaluationTopics,
  evaluations,
  questions,
  recipients,
  trainers,
  users,
} from "@/lib/data/seed";
import type { EvaluationRepository } from "@/lib/repositories/evaluation-repository";
import type {
  Evaluation,
  EvaluationDetail,
  EvaluationRecipient,
  EvaluationTopic,
  Question,
  Trainer,
  User,
} from "@/lib/types";

export class InMemoryEvaluationRepository implements EvaluationRepository {
  async getUsers() {
    return users;
  }

  async upsertUser(user: User) {
    const index = users.findIndex((item) => item.id === user.id);
    if (index >= 0) users[index] = user;
    else users.push(user);
    return user;
  }

  async deleteEvaluator(id: string) {
    const index = users.findIndex(
      (item) => item.id === id && item.role === "Evaluator",
    );
    if (index >= 0) users.splice(index, 1);
  }

  async getTrainers() {
    return trainers;
  }

  async upsertTrainer(trainer: Trainer) {
    const index = trainers.findIndex((item) => item.id === trainer.id);
    if (index >= 0) trainers[index] = trainer;
    else trainers.push(trainer);
    return trainer;
  }

  async deleteTrainer(id: string) {
    const trainer = trainers.find((item) => item.id === id);
    if (trainer) trainer.status = "Inactive";
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
