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
  getAssessmentVersions(): Promise<AssessmentVersion[]>;
  upsertAssessmentVersion(version: AssessmentVersion): Promise<AssessmentVersion>;
  deleteAssessmentVersion(
    id: string,
  ): Promise<"deleted" | "in-use" | "not-found">;
  getExamAttempts(): Promise<ExamAttempt[]>;
  saveExamAttempt(attempt: ExamAttempt): Promise<void>;
  completeExamAttempt(
    attempt: ExamAttempt,
    evaluation: Evaluation,
    details: EvaluationDetail[],
  ): Promise<boolean>;
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
