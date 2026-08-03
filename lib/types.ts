export type Role = "Admin" | "Evaluator";
export type TrainerStatus = "Active" | "Inactive";
export type ResultStatus = "Pass" | "Fail";
export type Locale = "th" | "en" | "lo" | "vi";

export type User = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type Trainer = {
  id: string;
  employeeId: string;
  trainerName: string;
  bu: string;
  status: TrainerStatus;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  categoryName: string;
  sortOrder: number;
  isCritical?: boolean;
};

export type Question = {
  id: string;
  categoryId: string;
  questionText: string;
  options: string[];
  weight: number;
  maxScore: number;
  isActive: boolean;
};

export type Evaluation = {
  id: string;
  trainerId: string;
  evaluatorName: string;
  evaluatorEmail: string;
  bu: string;
  evaluationDate: string;
  totalScore: number;
  percentage: number;
  result: ResultStatus;
  comment: string;
  createdAt: string;
};

export type EvaluationDetail = {
  id: string;
  evaluationId: string;
  questionId: string;
  score: number;
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
  trainer?: Trainer;
  categorySummary: CategorySummary[];
  details: EvaluationDetail[];
};

export type EvaluationInput = {
  trainerId: string;
  evaluatorName: string;
  evaluatorEmail: string;
  bu: string;
  comment: string;
  scores: Record<string, number>;
};

export type AuditLog = {
  id: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
};
