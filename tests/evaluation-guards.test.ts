import assert from "node:assert/strict";
import test from "node:test";
import { redactAssessmentAnswerKeys, redactQuestionAnswerKeys } from "../lib/services/assessment-version";
import { calculateEvaluationMetrics } from "../lib/services/evaluation-scoring";
import { evaluationImportPayloadSchema, evaluationUpdatePayloadSchema } from "../lib/validation/api";
import type { AssessmentVersion, Question } from "../lib/types";

const question: Question = {
  id: "q1",
  categoryId: "c1",
  questionText: "Choose one",
  answerType: "choice",
  isRequired: true,
  isScored: true,
  allowMultiple: false,
  options: ["A", "B"],
  correctAnswer: "A",
  weight: 1,
  maxScore: 2,
  isActive: true,
};

test("answer-key redaction does not mutate the published version", () => {
  const version = {
    id: "v1",
    questions: [question],
  } as AssessmentVersion;

  assert.equal(redactQuestionAnswerKeys([question])[0].correctAnswer, undefined);
  assert.equal(redactAssessmentAnswerKeys(version).questions[0].correctAnswer, undefined);
  assert.equal(version.questions[0].correctAnswer, "A");
});

test("import and edit reject impossible calendar dates", () => {
  assert.equal(evaluationImportPayloadSchema.safeParse({
    recipientId: "r1", topicId: "t1", evaluatorEmployeeId: "e1",
    evaluationDate: "2026-02-30", evaluationRound: 1, categoryScores: [1],
  }).success, false);
  assert.equal(evaluationUpdatePayloadSchema.safeParse({
    id: "ev1", recipientId: "r1", topicId: "t1", evaluatorEmployeeId: "e1",
    evaluationDate: "2026-02-30", evaluationRound: 1, comment: "",
    categoryScores: { c1: 1 },
  }).success, false);
});

test("an unanswered scored question remains in the full score", () => {
  const metrics = calculateEvaluationMetrics(
    [{ id: "c1", categoryName: "Category" }],
    [
      { id: "q1", categoryId: "c1", weight: 1, maxScore: 5, isScored: true },
      { id: "q2", categoryId: "c1", weight: 1, maxScore: 5, isScored: true },
    ],
    { q1: 5 },
  );
  assert.equal(metrics.categorySummary[0].fullScore, 10);
  assert.equal(metrics.categorySummary[0].average, 2.5);
});
