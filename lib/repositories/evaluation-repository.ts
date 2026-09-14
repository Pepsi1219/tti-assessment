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

export interface EvaluationRepository {
  getUsers(): Promise<User[]>;
  upsertUser(user: User): Promise<User>;
  deleteEvaluator(id: string): Promise<void>;
  getTrainers(): Promise<Trainer[]>;
  upsertTrainer(trainer: Trainer): Promise<Trainer>;
  deleteTrainer(id: string): Promise<void>;
  getRecipients(): Promise<EvaluationRecipient[]>;
  upsertRecipient(recipient: EvaluationRecipient): Promise<EvaluationRecipient>;
  getTopics(): Promise<EvaluationTopic[]>;
  upsertTopic(topic: EvaluationTopic): Promise<EvaluationTopic>;
  getCategories(): Promise<Category[]>;
  getQuestions(): Promise<Question[]>;
  upsertQuestion(question: Question): Promise<Question>;
  getEvaluations(): Promise<Evaluation[]>;
  getEvaluationDetails(): Promise<EvaluationDetail[]>;
  getEvaluationDetailsByEvaluationId(
    evaluationIds: string[],
  ): Promise<EvaluationDetail[]>;
  saveEvaluation(
    evaluation: Evaluation,
    details: EvaluationDetail[],
  ): Promise<void>;
  deleteEvaluation(id: string): Promise<void>;
}
