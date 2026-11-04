import assert from "node:assert/strict";
import test from "node:test";
import { redactAssessmentAnswerKeys, redactQuestionAnswerKeys } from "../lib/services/assessment-version";
import { calculateEvaluationMetrics, getQuestionScore } from "../lib/services/evaluation-scoring";
import {
  evaluationImportPayloadSchema,
  evaluationUpdatePayloadSchema,
  publishAssessmentVersionPayloadSchema,
} from "../lib/validation/api";
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

test("a multiple-choice answer scores the highest selected option", () => {
  const scoredQuestion = {
    ...question,
    allowMultiple: true,
    options: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
    maxScore: 5,
  };

  assert.equal(getQuestionScore(scoredQuestion, ["Option 2", "Option 4"]), 4);
  assert.equal(getQuestionScore(scoredQuestion, ["Option 4", "Option 2"]), 4);
  assert.equal(getQuestionScore(scoredQuestion, ["Option 2", "Option 5"]), 5);

  const metrics = calculateEvaluationMetrics(
    [{ id: "c1", categoryName: "Category" }],
    [scoredQuestion],
    { q1: 5 },
  );
  assert.equal(metrics.categorySummary[0].actualScore, 5);
  assert.equal(metrics.categorySummary[0].fullScore, 5);
});

test("publishing permits scored multiple-choice assessment questions", () => {
  const result = publishAssessmentVersionPayloadSchema.safeParse({
    name: "Assessment",
    kind: "assessment",
    dashboardProfile: "category-score",
    overallPassThreshold: 3.5,
    overallPassThresholdType: "average",
    criticalCategoryPassThreshold: 3,
    categories: [{ id: "c1", categoryName: "Category", sortOrder: 0 }],
    questions: [{
      id: "q1",
      categoryId: "c1",
      questionText: "Select all that apply",
      answerType: "choice",
      isRequired: true,
      isScored: true,
      allowMultiple: true,
      options: ["1", "2", "3", "4", "5"],
      weight: 1,
      maxScore: 5,
      isActive: true,
    }],
  });

  assert.equal(result.success, true);
});
