"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, FileCheck2 } from "lucide-react";
import { CriterionQuestion } from "@/components/criterion-question";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import { getLocalizedCategoryName, getLocalizedQuestion } from "@/lib/i18n/question-content";
import { isQuestionScored } from "@/lib/services/evaluation-scoring";
import type {
  AssessmentVersion,
  Category,
  EvaluationRecipient,
  EvaluationTopic,
  ExamAttempt,
  Question,
  QuestionAnswer,
} from "@/lib/types";

type ExamTopic = EvaluationTopic & { kind?: "assessment" | "exam" };
type ExamAttemptView = ExamAttempt & {
  recipient?: EvaluationRecipient;
  assessmentVersion?: AssessmentVersion;
};
type ExamSection = Category & { questions: Question[] };
type ExamMode = "dashboard" | "taking" | "grading" | "submitted";

function hasAnswer(question: Question, answer: QuestionAnswer | undefined) {
  if (answer === undefined || answer === null) return false;
  switch (question.answerType ?? "rating") {
    case "text":
    case "date":
      return typeof answer === "string" && answer.trim().length > 0;
    case "choice":
      return question.allowMultiple
        ? Array.isArray(answer) && answer.length > 0
        : typeof answer === "string" && answer.length > 0;
    case "ranking":
      return Array.isArray(answer) && answer.length === question.options.length && answer.every(Boolean);
    case "likert":
      return typeof answer === "object" && !Array.isArray(answer) &&
        Object.keys(answer).length === (question.statements?.length ?? 0);
    case "nps":
      return typeof answer === "number" && Number.isInteger(answer) && answer >= 0 && answer <= 10;
    default:
      return typeof answer === "number" && Number.isInteger(answer) && answer >= 1 && answer <= question.maxScore;
  }
}

function isComplete(question: Question, answer: QuestionAnswer | undefined) {
  return question.isRequired === false && !hasAnswer(question, answer) || hasAnswer(question, answer);
}

function isAutoScored(question: Question) {
  return question.isScored !== false &&
    question.answerType === "choice" &&
    question.correctAnswer !== undefined;
}

function answerLabel(question: Question, answer: QuestionAnswer | undefined) {
  if (answer === undefined || answer === null) return "-";
  if (Array.isArray(answer)) return answer.join(", ");
  if (typeof answer === "object") {
    return Object.entries(answer)
      .map(([key, value]) => `${question.statements?.[Number(key)] ?? key}: ${question.options[value - 1] ?? value}`)
      .join("; ");
  }
  if (typeof answer === "number" && question.answerType !== "nps")
    return question.options[answer - 1] ?? String(answer);
  return String(answer);
}

function answerMatchesKey(question: Question, answer: QuestionAnswer | undefined) {
  if (Array.isArray(question.correctAnswer)) {
    return Array.isArray(answer) && answer.length === question.correctAnswer.length &&
      question.correctAnswer.every((value) => answer.includes(value));
  }
  return typeof answer === "string" && answer === question.correctAnswer;
}

export default function EvaluatorExamsPage() {
  const { t, locale } = useI18n();
  const [topics, setTopics] = useState<ExamTopic[]>([]);
  const [recipients, setRecipients] = useState<EvaluationRecipient[]>([]);
  const [questionSet, setQuestionSet] = useState<{
    categories: Category[];
    questions: Question[];
    assessmentVersion: AssessmentVersion;
  } | null>(null);
  const [queue, setQueue] = useState<ExamAttemptView[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [round, setRound] = useState("1");
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [mode, setMode] = useState<ExamMode>("dashboard");
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttemptView | null>(null);
  const [manualScores, setManualScores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [gradeResult, setGradeResult] = useState<{ totalScore: number; result: string } | null>(null);

  async function loadTopic(topicId: string) {
    setQuestionSet(null);
    setSelectedTopicId(topicId);
    if (!topicId) return;
    const response = await fetch(`/api/questions?topicId=${encodeURIComponent(topicId)}`);
    const data = await response.json();
    if (!response.ok || data.assessmentVersion?.kind !== "exam")
      throw new Error(data.error ?? t.examMode);
    setQuestionSet(data);
  }

  async function refreshQueue() {
    const response = await fetch("/api/exam-attempts");
    if (!response.ok) throw new Error(t.unableToLoad);
    setQueue(await response.json());
  }

  useEffect(() => {
    let mounted = true;
    async function initialize() {
      try {
        const [topicResponse, recipientResponse, queueResponse] = await Promise.all([
          fetch("/api/public/topics"),
          fetch("/api/recipients"),
          fetch("/api/exam-attempts"),
        ]);
        if (!topicResponse.ok || !recipientResponse.ok || !queueResponse.ok)
          throw new Error(t.unableToLoad);
        const [topicData, recipientData, queueData] = await Promise.all([
          topicResponse.json(),
          recipientResponse.json(),
          queueResponse.json(),
        ]);
        if (!mounted) return;
        const examTopics: ExamTopic[] = topicData.filter((topic: ExamTopic) => topic.kind === "exam");
        setTopics(examTopics);
        setRecipients(recipientData.filter((recipient: EvaluationRecipient) => recipient.status === "Active"));
        setQueue(queueData);
        const requestedTopicId = new URLSearchParams(window.location.search).get("topicId") ?? "";
        const initialTopicId = examTopics.some((topic) => topic.id === requestedTopicId)
          ? requestedTopicId
          : examTopics[0]?.id ?? "";
        setSelectedTopicId(initialTopicId);
        if (initialTopicId) {
          const response = await fetch(`/api/questions?topicId=${encodeURIComponent(initialTopicId)}`);
          const data = await response.json();
          if (!response.ok || data.assessmentVersion?.kind !== "exam")
            throw new Error(data.error ?? t.examMode);
          if (mounted) setQuestionSet(data);
        }
      } catch (reason) {
        if (mounted) setError(reason instanceof Error ? reason.message : t.unableToLoad);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void initialize();
    return () => { mounted = false; };
  }, [t.examMode, t.unableToLoad]);

  const activeQuestions = useMemo(
    () => questionSet?.questions.filter((question) => question.isActive) ?? [],
    [questionSet],
  );
  const sections = useMemo<ExamSection[]>(() => {
    if (!questionSet) return [];
    return questionSet.categories
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((category) => ({
        ...category,
        categoryName: getLocalizedCategoryName(category, locale),
        questions: activeQuestions
          .filter((question) => question.categoryId === category.id)
          .map((question) => getLocalizedQuestion(question, locale)),
      }))
      .filter((category) => category.questions.length > 0);
  }, [activeQuestions, locale, questionSet]);
  const answeredCount = activeQuestions.filter((question) => isComplete(question, answers[question.id])).length;
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);
  const selectedRecipient = recipients.find((recipient) => recipient.id === recipientId);
  const gradingQuestions = selectedAttempt?.assessmentVersion?.questions.filter(
    (question) => question.isActive,
  ) ?? [];
  const manualQuestions = gradingQuestions.filter(
    (question) => isQuestionScored(question) && !isAutoScored(question),
  );
  const readyToGrade = manualQuestions.every((question) => {
    const value = manualScores[question.id];
    return value !== undefined && value !== "" && Number.isFinite(Number(value)) &&
      Number(value) >= 0 && Number(value) <= question.maxScore;
  });

  function setAnswer(questionId: string, answer: QuestionAnswer | undefined) {
    setAnswers((current) => {
      const next = { ...current };
      if (answer === undefined) delete next[questionId];
      else next[questionId] = answer;
      return next;
    });
  }

  async function changeTopic(topicId: string) {
    setError("");
    try {
      await loadTopic(topicId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.unableToLoad);
    }
  }

  async function submitExam() {
    if (!questionSet || !selectedRecipient || !Number.isInteger(Number(round)) || Number(round) < 1) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/exam-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedRecipient.id,
          topicId: selectedTopicId,
          assessmentVersionId: questionSet.assessmentVersion.id,
          evaluationRound: Number(round),
          answers,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.unableToSave);
      await refreshQueue();
      setNotice(t.examSubmitted);
      setMode("submitted");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.unableToSave);
    } finally {
      setSaving(false);
    }
  }

  function startExam() {
    setAnswers({});
    setError("");
    setNotice("");
    setMode("taking");
  }

  function openGrading(attempt: ExamAttemptView) {
    setSelectedAttempt(attempt);
    setManualScores({});
    setError("");
    setNotice("");
    setMode("grading");
  }

  async function submitGrade() {
    if (!selectedAttempt || !readyToGrade || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/exam-attempts/${encodeURIComponent(selectedAttempt.id)}/grade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores: Object.fromEntries(manualQuestions.map((question) => [
            question.id,
            Number(manualScores[question.id]),
          ])),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.unableToSave);
      setGradeResult(data.evaluation);
      await refreshQueue();
      setNotice(t.success);
      setMode("submitted");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.unableToSave);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return <Card className="p-8 text-center text-sm text-slate-500">{t.loading}</Card>;

  return (
    <section className="mx-auto min-w-0 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <FileCheck2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">{t.examMode}</p>
          <h2 className="text-2xl font-black">{selectedTopic?.topicName ?? t.examMode}</h2>
        </div>
      </div>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</p>}

      {mode === "dashboard" && (
        <>
          <Card className="space-y-5 p-5">
            <div>
              <h3 className="text-lg font-black">{t.startExam}</h3>
              <p className="mt-1 text-sm text-slate-500">{selectedTopic?.topicName}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold">
                <span>{t.selectRecipient}</span>
                <select
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3"
                  value={recipientId}
                  onChange={(event) => setRecipientId(event.target.value)}
                >
                  <option value="">{t.selectRecipient}</option>
                  {recipients.map((recipient) => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.employeeId} - {recipient.recipientName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-semibold">
                <span>{t.round}</span>
                <Input type="number" min="1" max="99" value={round} onChange={(event) => setRound(event.target.value)} />
              </label>
            </div>
            {topics.length > 1 && (
              <label className="block space-y-2 text-sm font-semibold">
                <span>{t.course}</span>
                <select className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3" value={selectedTopicId} onChange={(event) => void changeTopic(event.target.value)}>
                  {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.topicName}</option>)}
                </select>
              </label>
            )}
            <div className="flex justify-end">
              <Button onClick={startExam} disabled={!questionSet || !selectedRecipient || !Number.isInteger(Number(round)) || Number(round) < 1}>
                {t.startExam}<CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            <h3 className="text-lg font-black">{t.pendingExams} · {queue.length}</h3>
            {queue.length ? queue.map((attempt) => (
              <Card key={attempt.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-bold">{attempt.recipient?.recipientName ?? attempt.recipientId}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {attempt.topicName} · {t.round} {attempt.evaluationRound} · {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(attempt.submittedAt))}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-amber-700">{t.awaitingGrading}</p>
                </div>
                <Button className="bg-slate-100 text-slate-800 shadow-none hover:bg-slate-200" onClick={() => openGrading(attempt)}>
                  {t.gradeExam}<ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </Card>
            )) : <Card className="p-8 text-center text-sm text-slate-500">{t.noPendingExams}</Card>}
          </div>
        </>
      )}

      {mode === "taking" && questionSet && (
        <Card className="space-y-6 p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-bold text-primary">{selectedRecipient?.recipientName}</p>
              <h3 className="mt-1 text-xl font-black">{questionSet.assessmentVersion.name}</h3>
            </div>
            <p className="text-sm font-semibold text-slate-500">{answeredCount}/{activeQuestions.length} · {Math.round((answeredCount / Math.max(activeQuestions.length, 1)) * 100)}%</p>
          </div>
          {sections.map((section) => (
            <div key={section.id} className="space-y-4">
              <h4 className="border-b border-slate-100 pb-2 font-black">{section.categoryName}</h4>
              {section.questions.map((question, index) => (
                <CriterionQuestion key={question.id} index={index + 1} question={question} answer={answers[question.id]} onAnswer={(answer) => setAnswer(question.id, answer)} />
              ))}
            </div>
          ))}
          <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-4">
            <Button className="bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200" onClick={() => setMode("dashboard")}>
              <ChevronLeft className="h-4 w-4" />{t.back}
            </Button>
            <Button onClick={() => void submitExam()} disabled={saving || answeredCount !== activeQuestions.length}>
              {saving ? t.submitting : t.submitExam}<CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {mode === "grading" && selectedAttempt && (
        <Card className="space-y-5 p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-bold text-primary">{selectedAttempt.recipient?.recipientName ?? selectedAttempt.recipientId}</p>
              <h3 className="mt-1 text-xl font-black">{selectedAttempt.assessmentVersion?.name ?? selectedAttempt.topicName}</h3>
              <p className="mt-1 text-sm text-slate-500">{selectedAttempt.topicName} · {t.round} {selectedAttempt.evaluationRound}</p>
            </div>
            <p className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800">{t.awaitingGrading}</p>
          </div>
          {selectedAttempt.assessmentVersion?.categories
            .slice()
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((category) => {
              const questions = gradingQuestions.filter((question) => question.categoryId === category.id);
              if (!questions.length) return null;
              return (
                <div key={category.id} className="space-y-4">
                  <h4 className="border-b border-slate-100 pb-2 font-black">{getLocalizedCategoryName(category, locale)}</h4>
                  {questions.map((question, index) => {
                    const isAuto = isAutoScored(question);
                    const isScored = isQuestionScored(question);
                    return (
                      <div key={question.id} className="rounded-xl border border-slate-200 p-4">
                        <p className="font-bold">{index + 1}. {getLocalizedQuestion(question, locale).questionText}</p>
                        <p className="mt-3 text-xs font-bold uppercase text-slate-500">{t.candidateAnswer}</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{answerLabel(question, selectedAttempt.answers[question.id])}</p>
                        {isAuto && (
                          <div className="mt-3 space-y-1 text-sm">
                            <p className={`font-semibold ${answerMatchesKey(question, selectedAttempt.answers[question.id]) ? "text-emerald-700" : "text-red-700"}`}>
                              {t.autoScored}: {selectedAttempt.automaticScores[question.id] ?? 0}/{question.maxScore}
                            </p>
                            <p className="text-slate-600">{t.correctAnswer}: {answerLabel(question, question.correctAnswer)}</p>
                          </div>
                        )}
                        {isScored && !isAuto && (
                          <label className="mt-4 flex max-w-xs items-center gap-3 text-sm font-semibold">
                            <span>{t.manualScore} / {question.maxScore}</span>
                            <Input
                              type="number"
                              min="0"
                              max={question.maxScore}
                              step="0.1"
                              value={manualScores[question.id] ?? ""}
                              onChange={(event) => setManualScores((current) => ({ ...current, [question.id]: event.target.value }))}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-4">
            <Button className="bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200" onClick={() => setMode("dashboard")}>
              <ChevronLeft className="h-4 w-4" />{t.back}
            </Button>
            <Button onClick={() => void submitGrade()} disabled={saving || !readyToGrade}>
              {saving ? t.submitting : t.submitGrade}<CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {mode === "submitted" && (
        <Card className="grid justify-items-center gap-3 p-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          <h3 className="text-xl font-black">{gradeResult ? t.result : t.examSubmitted}</h3>
          {gradeResult && <p className="text-lg font-bold">{gradeResult.totalScore.toFixed(2)} · {gradeResult.result}</p>}
          <Button onClick={() => {
            setMode("dashboard");
            setNotice("");
            setGradeResult(null);
          }}>{t.back}</Button>
        </Card>
      )}
    </section>
  );
}