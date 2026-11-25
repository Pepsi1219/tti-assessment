export type AdministratorRole = "Admin" | "Developer";
export type AdminPageKey =
  | "dashboard"
  | "admins"
  | "evaluators"
  | "recipients"
  | "topics"
  | "assessmentVersions"
  | "evaluations"
  | "evaluationSummaries"
  | "system";
export type Role = AdministratorRole | "Evaluator";
export type TrainerStatus = "Active" | "Inactive";
export type RecordStatus = "Active" | "Inactive";
export type BusinessUnitCode = "G1" | "G2" | "G3" | "G4" | "EA" | "TRM";
export type ResultStatus = "Pass" | "Fail";
export type EvaluationSource = "Application" | "Microsoft Forms";
export type Locale = "th" | "en" | "lo" | "vi";

export type User = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  /** The Firestore `users` collection is reserved for administrator accounts. */
  role: AdministratorRole;
  status?: RecordStatus;
  createdAt: string;
  updatedAt?: string;
};

/** An account that conducts evaluations and is stored in Firestore `trainers`. */
export type Evaluator = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: "Evaluator";
  status?: RecordStatus;
  createdAt: string;
  updatedAt?: string;
};

export type EvaluationRecipient = {
  id: string;
  employeeId: string;
  recipientName: string;
  bu: string;
  buCode?: BusinessUnitCode;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
};

export type EvaluationTopic = {
  id: string;
  topicName: string;
  description: string;
  status: RecordStatus;
  activeAssessmentVersionId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  categoryName: string;
  sortOrder: number;
  isCritical?: boolean;
};

export type QuestionAnswerType =
  | "choice"
  | "text"
  | "rating"
  | "date"
  | "ranking"
  | "likert"
  | "nps";

export type QuestionScaleIcon = "star" | "heart" | "thumbs-up";

export type QuestionAnswer =
  | string
  | string[]
  | number
  | Record<string, number>;

export type Question = {
  id: string;
  categoryId: string;
  questionText: string;
  answerType?: QuestionAnswerType;
  isRequired?: boolean;
  isScored?: boolean;
  allowMultiple?: boolean;
  statements?: string[];
  minScore?: number;
  minScoreLabel?: string;
  maxScoreLabel?: string;
  likertIcon?: QuestionScaleIcon;
  options: string[];
  correctAnswer?: QuestionAnswer;
  weight: number;
  maxScore: number;
  isActive: boolean;
};

export type DashboardProfile = "category-score" | "overall-score" | "pass-fail";
export type AssessmentKind = "assessment" | "exam";
export type OverallPassThresholdType = "average" | "percentage";

export type AssessmentVersion = {
  id: string;
  name: string;
  version: number;
  status: "Draft" | "Published";
  kind?: AssessmentKind;
  overallPassThresholdType?: OverallPassThresholdType;
  dashboardProfile: DashboardProfile;
  overallPassThreshold: number;
  criticalCategoryPassThreshold: number;
  categories: Category[];
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

export type ExamAttempt = {
  id: string;
  recipientId: string;
  topicId: string;
  topicName: string;
  assessmentVersionId: string;
  evaluationRound: number;
  answers: Record<string, QuestionAnswer>;
  automaticScores: Record<string, number>;
  status: "PendingGrading" | "Graded";
  submittedAt: string;
  gradedAt?: string;
  gradedByName?: string;
  gradedByEmail?: string;
  gradedByEmployeeId?: string;
  evaluationId?: string;
};

export type Evaluation = {
  id: string;
  recipientId: string;
  topicId: string;
  topicName: string;
  assessmentVersionId?: string;
  evaluatorName: string;
  evaluatorEmail: string;
  evaluatorEmployeeId?: string;
  bu: string;
  buCode?: BusinessUnitCode;
  evaluationDate: string;
  evaluationRound?: number;
  /** Authoritative raw category totals for imported records or an administrator's explicit correction. */
  categoryActualScores?: Record<string, number>;
  /** Stored at submission time so lists and summaries do not need to read every question detail. */
  categorySummary?: CategorySummary[];
  totalScore: number;
  percentage: number;
  result: ResultStatus;
  comment: string;
  createdAt: string;
  source?: EvaluationSource;
  legacySourceId?: string;
  legacyStartTime?: string;
  importSourceFile?: string;
  importFileSha256?: string;
  importedAt?: string;
};

export type EvaluationDetail = {
  id: string;
  evaluationId: string;
  questionId: string;
  score: number;
  answer?: QuestionAnswer;
};

export type CategorySummary = {
  categoryId: string;
  categoryName: string;
  actualScore: number;
  fullScore: number;
  average: number;
  isCritical: boolean;
};

export type EvaluationResult = Evaluation & {
  recipient?: EvaluationRecipient;
  topic?: EvaluationTopic;
  categorySummary: CategorySummary[];
  details: EvaluationDetail[];
  assessmentVersion?: AssessmentVersion;
};

export type EvaluationInput = {
  recipientId: string;
  topicId: string;
  assessmentVersionId?: string;
  evaluationRound: number;
  comment: string;
  scores: Record<string, number>;
  answers?: Record<string, QuestionAnswer>;
};

export type EvaluationSummary = {
  id: string;
  recipientId: string;
  recipient?: EvaluationRecipient;
  topicId: string;
  topicName: string;
  assessmentVersionId?: string;
  assessmentVersionName?: string;
  assessmentVersionNumber?: number;
  overallPassThreshold?: number;
  overallPassThresholdType?: OverallPassThresholdType;
  criticalCategoryPassThreshold?: number;
  evaluationRound: number;
  evaluationYear: string;
  bu: string;
  buCode?: BusinessUnitCode;
  evaluatorCount: number;
  totalScore: number;
  percentage: number;
  result: ResultStatus;
  categorySummary: CategorySummary[];
  evaluations: EvaluationResult[];
};

export type AuditLog = {
  id: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
};
