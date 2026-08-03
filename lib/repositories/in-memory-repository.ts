import { categories, evaluationDetails, evaluations, questions, trainers, users } from "@/lib/data/seed";
import type { EvaluationRepository } from "@/lib/repositories/evaluation-repository";
import type { Evaluation, EvaluationDetail, Question, Trainer } from "@/lib/types";

export class InMemoryEvaluationRepository implements EvaluationRepository {
  async getUsers() {
    return users;
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

  async saveEvaluation(evaluation: Evaluation, details: EvaluationDetail[]) {
    evaluations.push(evaluation);
    evaluationDetails.push(...details);
  }
}
