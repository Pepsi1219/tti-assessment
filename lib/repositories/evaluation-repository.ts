import type {
  Category,
  AssessmentVersion,
  Evaluation,
  EvaluationDetail,
  ExamAttempt,
  ResultStatus,
  EvaluationRecipient,
  EvaluationTopic,
  Question,
  Evaluator,
  User,
} from "@/lib/types";

export type EvaluationPageCursor = {
  evaluationDate: string;
  createdAt: string;
  id: string;
};

export type EvaluationPageQuery = {
  topicId: string;
  pageSize: number;
  cursor?: EvaluationPageCursor;
  evaluatorEmployeeId?: string;
  evaluatorEmail?: string;
  evaluatorName?: string;
  buCode?: string;
  department?: string;
  year?: string;
  result?: ResultStatus;
  recipientIds?: string[];
};

export type EvaluationPage = {
  items: Evaluation[];
  nextCursor?: EvaluationPageCursor;
};

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
  getEvaluationsByEvaluator(
    employeeId: string,
    email?: string | null,
  ): Promise<Evaluation[]>;
  getEvaluationById(id: string): Promise<Evaluation | undefined>;
  getEvaluationsByTopicId(topicId: string): Promise<Evaluation[]>;
  getLatestEvaluationByTopicId(topicId: string): Promise<Evaluation | undefined>;
  getLatestEvaluationRound(
    topicId: string,
    businessUnit: { buCode?: string; bu?: string },
  ): Promise<number | undefined>;
  getEvaluationPage(query: EvaluationPageQuery): Promise<EvaluationPage>;
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
