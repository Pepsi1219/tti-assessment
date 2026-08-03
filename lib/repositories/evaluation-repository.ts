import type { Category, Evaluation, EvaluationDetail, Question, Trainer, User } from "@/lib/types";

export interface EvaluationRepository {
  getUsers(): Promise<User[]>;
  getTrainers(): Promise<Trainer[]>;
  upsertTrainer(trainer: Trainer): Promise<Trainer>;
  deleteTrainer(id: string): Promise<void>;
  getCategories(): Promise<Category[]>;
  getQuestions(): Promise<Question[]>;
  upsertQuestion(question: Question): Promise<Question>;
  getEvaluations(): Promise<Evaluation[]>;
  getEvaluationDetails(): Promise<EvaluationDetail[]>;
  saveEvaluation(evaluation: Evaluation, details: EvaluationDetail[]): Promise<void>;
}
