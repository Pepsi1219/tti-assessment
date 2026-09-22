import type {
  Category,
  Evaluation,
  EvaluationDetail,
  EvaluationRecipient,
  EvaluationTopic,
  Question,
  Evaluator,
  User,
} from "@/lib/types";

export interface EvaluationRepository {
  isEvaluationOpen(): Promise<boolean>;
  setEvaluationOpen(isOpen: boolean): Promise<void>;
  getUsers(): Promise<User[]>;
  upsertUser(user: User): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getEvaluators(): Promise<Evaluator[]>;
  upsertEvaluator(evaluator: Evaluator): Promise<Evaluator>;
  deleteEvaluator(id: string): Promise<void>;
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
  updateEvaluation(evaluation: Evaluation): Promise<void>;
  deleteEvaluation(id: string): Promise<void>;
}
