import { z } from "zod";

const questionAnswerTypes = [
  "choice",
  "text",
  "rating",
  "date",
  "ranking",
  "likert",
  "nps",
] as const;
const questionAnswerPayloadSchema = z.union([
  z.string().max(5_000),
  z.number().finite().min(0).max(10),
  z.array(z.string().max(1_000)).max(50),
  z.record(z.number().finite().min(0).max(10)),
]);

const identifier = z.string().trim().min(1).max(128);
const businessUnitCode = z.enum(["G1", "G2", "G3", "G4", "EA", "TRM"]);
const categoryPayloadSchema = z.object({
  id: identifier,
  categoryName: z.string().trim().max(200),
  sortOrder: z.number().int().min(0).max(1000),
  isCritical: z.boolean().optional(),
});
const assessmentQuestionPayloadSchema = z.object({
  id: identifier,
  categoryId: z.string().trim().max(128),
  questionText: z.string().trim().max(2_000),
  answerType: z.enum(questionAnswerTypes).default("rating"),
  isRequired: z.boolean().default(true),
  isScored: z.boolean().optional(),
  allowMultiple: z.boolean().default(false),
  statements: z.array(z.string().trim().min(1).max(500)).max(30).default([]),
  options: z.array(z.string().trim().min(1).max(1_000)).max(50).default([]),
  correctAnswer: z.union([
    z.string().max(1_000),
    z.array(z.string().max(1_000)).max(50),
  ]).optional(),
  weight: z.number().finite().min(0.01).max(100),
  maxScore: z.number().int().min(1).max(10),
  isActive: z.boolean(),
});

export const trainerPayloadSchema = z.object({
  id: identifier.optional(),
  employeeId: z.string().trim().min(1).max(64),
  trainerName: z.string().trim().min(1).max(200),
  bu: z.string().trim().min(1).max(128),
  status: z.enum(["Active", "Inactive"]).optional(),
  createdAt: z.string().datetime().optional(),
});

export const questionPayloadSchema = z.object({
  id: identifier.optional(),
  categoryId: identifier,
  questionText: z.string().trim().min(1).max(2_000),
  options: z.array(z.string().trim().min(1).max(1_000)).max(10).default([]),
  weight: z.number().finite().min(0.01).max(100),
  maxScore: z.number().int().min(1).max(5),
  isActive: z.boolean().default(true),
});

export const evaluationPayloadSchema = z.object({
  recipientId: identifier,
  topicId: identifier,
  assessmentVersionId: identifier.optional(),
  evaluationRound: z.number().int().min(1).max(99),
  comment: z.string().trim().max(5_000).default(""),
  scores: z
    .record(
      z
        .union([
          z.number().finite().min(0).max(10),
          z.array(z.number().int().min(0).max(10)).min(1).max(30),
        ])
        .transform((value) =>
          Array.isArray(value) ? Math.max(...value) : value,
        ),
    )
    .refine((scores) => Object.keys(scores).length <= 200, "Too many scores")
    .default({}),
  answers: z.record(questionAnswerPayloadSchema).default({})
    .refine((answers) => Object.keys(answers).length <= 200, "Too many answers"),
});

export const evaluationUpdatePayloadSchema = z.object({
  id: identifier,
  recipientId: identifier,
  topicId: identifier,
  evaluatorEmployeeId: z.string().trim().min(1).max(64),
  evaluationDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
  evaluationRound: z.number().int().min(1).max(99),
  comment: z.string().trim().max(5_000).default(""),
  categoryScores: z
    .record(z.number().finite().min(0).max(10_000))
    .refine((scores) => Object.keys(scores).length <= 20, "Too many scores"),
});

export const recipientPayloadSchema = z.object({
  id: identifier.optional(),
  employeeId: z.string().trim().min(1).max(64),
  recipientName: z.string().trim().min(1).max(200),
  bu: z.string().trim().min(1).max(128),
  buCode: businessUnitCode,
  status: z.enum(["Active", "Inactive"]).optional(),
});

export const topicPayloadSchema = z.object({
  id: identifier.optional(),
  topicName: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2_000).default(""),
  status: z.enum(["Active", "Inactive"]).optional(),
  activeAssessmentVersionId: identifier.optional().nullable(),
});

const assessmentVersionBaseSchema = z.object({
  id: identifier.optional(),
  name: z.string().trim().min(1).max(200),
  kind: z.enum(["assessment", "exam"]).default("assessment"),
  dashboardProfile: z.enum(["category-score", "overall-score", "pass-fail"]),
  overallPassThreshold: z.number().finite().min(0).max(100),
  overallPassThresholdType: z.enum(["average", "percentage"]).default("average"),
  criticalCategoryPassThreshold: z.number().finite().min(0).max(5),
  categories: z.array(categoryPayloadSchema).max(50),
  questions: z.array(assessmentQuestionPayloadSchema).max(200),
}).superRefine((version, context) => {
  if (version.overallPassThresholdType === "average" && version.overallPassThreshold > 5)
    context.addIssue({ code: "custom", path: ["overallPassThreshold"], message: "Average threshold cannot exceed 5" });
});

export const assessmentVersionPayloadSchema = assessmentVersionBaseSchema;

export const publishAssessmentVersionPayloadSchema = assessmentVersionBaseSchema
  .superRefine((version, context) => {
  if (new Set(version.categories.map((category) => category.id)).size !== version.categories.length)
    context.addIssue({ code: "custom", message: "Category IDs must be unique" });
  if (new Set(version.questions.map((question) => question.id)).size !== version.questions.length)
    context.addIssue({ code: "custom", message: "Question IDs must be unique" });
  if (!version.categories.length)
    context.addIssue({ code: "custom", message: "At least one section is required" });
  if (version.categories.some((category) => !category.categoryName))
    context.addIssue({ code: "custom", message: "Every section needs a name" });
  if (!version.questions.length)
    context.addIssue({ code: "custom", message: "At least one question is required" });
  if (version.questions.some((question) => question.isActive && !question.questionText))
    context.addIssue({ code: "custom", message: "Every active question needs text" });
  if (!version.questions.some((question) => question.isActive))
    context.addIssue({ code: "custom", message: "At least one active question is required" });
  if (!version.questions.some((question) =>
    question.isActive &&
    (question.isScored ?? ["rating", "likert", "nps"].includes(question.answerType)),
  ))
    context.addIssue({ code: "custom", message: "At least one active scored question is required" });
  if (version.questions.some((question) =>
    question.isActive &&
    ((question.answerType === "choice" || question.answerType === "ranking") && question.options.length < 2 ||
      question.answerType === "likert" && question.statements.length < 1 ||
      question.isScored === true && !["rating", "likert", "nps"].includes(question.answerType) &&
        !(version.kind === "exam" && ["text", "choice"].includes(question.answerType)) &&
        !(question.answerType === "choice" && !question.allowMultiple &&
          question.options.length >= 2 && question.options.length <= 10 &&
          question.maxScore === question.options.length)),
  ))
    context.addIssue({ code: "custom", message: "Question configuration is incomplete or cannot be scored" });
  if (version.questions.some((question) =>
    !question.categoryId || !version.categories.some((category) => category.id === question.categoryId),
  ))
    context.addIssue({ code: "custom", message: "Every question must belong to a category" });
  if (version.questions.some((question) => {
    if (question.correctAnswer === undefined) return false;
    if (version.kind !== "exam" || question.answerType !== "choice") return true;
    const answers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [question.correctAnswer];
    return !answers.length ||
      answers.some((answer) => !question.options.includes(answer)) ||
      new Set(answers).size !== answers.length ||
      (question.allowMultiple ? !Array.isArray(question.correctAnswer) : Array.isArray(question.correctAnswer));
  }))
    context.addIssue({ code: "custom", message: "Exam answer keys must be valid choices for exam questions" });
});

export const examAttemptPayloadSchema = z.object({
  recipientId: identifier,
  topicId: identifier,
  assessmentVersionId: identifier,
  evaluationRound: z.number().int().min(1).max(99),
  answers: z.record(questionAnswerPayloadSchema)
    .refine((answers) => Object.keys(answers).length <= 200, "Too many answers"),
});

export const examGradePayloadSchema = z.object({
  scores: z.record(z.number().finite().min(0).max(10))
    .refine((scores) => Object.keys(scores).length <= 200, "Too many scores"),
});

export const evaluatorPayloadSchema = z.object({
  id: identifier.optional(),
  employeeId: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  status: z.enum(["Active", "Inactive"]).optional(),
});

export const adminPayloadSchema = z.object({
  id: identifier.optional(),
  employeeId: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  status: z.enum(["Active", "Inactive"]).optional(),
});
