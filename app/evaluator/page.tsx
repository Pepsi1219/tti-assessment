"use client";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ImageDown,
  Check,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { CriterionQuestion } from "@/components/criterion-question";
import { WrappedRadarTick } from "@/components/evaluation-category-report";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import {
  getLocalizedCategoryName,
  getLocalizedQuestion,
} from "@/lib/i18n/question-content";
import {
  getPassingCriteria,
  getReportCategoryName,
} from "@/lib/reports/evaluation-report";
import { cn } from "@/lib/utils";
import type {
  Category,
  EvaluationRecipient,
  EvaluationResult,
  EvaluationTopic,
  Question,
  QuestionAnswer,
} from "@/lib/types";

type Section = Category & { questions: Question[] };

function isAnswered(question: Question, answer: QuestionAnswer | undefined) {
  if (answer === undefined || answer === null) return false;
  switch (question.answerType ?? "rating") {
    case "text":
      return typeof answer === "string" && answer.trim().length > 0;
    case "date":
      return typeof answer === "string" && answer.length > 0;
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
      return typeof answer === "number" && Number.isInteger(answer) && answer >= 1;
  }
}

function isQuestionComplete(question: Question, answers: Record<string, QuestionAnswer>) {
  const answer = answers[question.id];
  const isBlank = answer === undefined || answer === null || answer === "" ||
    (Array.isArray(answer) && answer.length === 0);
  return (question.isRequired === false && isBlank) || isAnswered(question, answer);
}

export default function EvaluatorPage() {
  const { t, locale } = useI18n();
  const [recipients, setRecipients] = useState<EvaluationRecipient[]>([]);
  const [topics, setTopics] = useState<EvaluationTopic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedBu, setSelectedBu] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedAssessmentVersionId, setSelectedAssessmentVersionId] =
    useState<string | null>(null);
  const assessmentRequestId = useRef(0);
  const [evaluationRound, setEvaluationRound] = useState<number | null>(null);
  const [roundPadOpen, setRoundPadOpen] = useState(false);
  const [roundSuggestion, setRoundSuggestion] = useState<number | null>(null);
  const [roundSuggestionOpen, setRoundSuggestionOpen] = useState(false);
  const [roundSuggestionLoading, setRoundSuggestionLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const sectionAnchorRef = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState("");
  const [step, setStep] = useState(0);
  const [latest, setLatest] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const assessmentInProgress = !latest && Boolean(
      Object.keys(answers).length > 0 ||
      comment.trim() ||
      step > 0
    );
    window.dispatchEvent(
      new CustomEvent("evaluator-assessment-state", {
        detail: assessmentInProgress,
      }),
    );
  }, [
    latest,
    answers,
    comment,
    step,
  ]);

  useEffect(() => () => {
    window.dispatchEvent(
      new CustomEvent("evaluator-assessment-state", { detail: false }),
    );
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadFormData() {
      try {
        const availabilityResponse = await fetch("/api/evaluation-availability");
        const availability = await availabilityResponse.json().catch(() => null);
        if (!availabilityResponse.ok || availability?.isOpen !== true) {
          window.location.replace("/evaluation-closed");
          return;
        }
        const requestedTopicId = new URLSearchParams(window.location.search).get(
          "topicId",
        );
        const [recipientRes, topicRes, questionRes] = await Promise.all([
          fetch("/api/recipients"),
          fetch("/api/topics"),
          fetch(
            requestedTopicId
              ? `/api/questions?topicId=${encodeURIComponent(requestedTopicId)}`
              : "/api/questions",
          ),
        ]);
        if (!recipientRes.ok || !topicRes.ok || !questionRes.ok)
          throw new Error("Unable to load evaluation form data.");
        const [recipientData, topicData, questionData] = await Promise.all([
          recipientRes.json(),
          topicRes.json(),
          questionRes.json(),
        ]);
        if (!isMounted) return;
        if (questionData.assessmentVersion?.kind === "exam") {
          window.location.replace(
            `/evaluator/exams?topicId=${encodeURIComponent(requestedTopicId ?? "")}`,
          );
          return;
        }
        setRecipients(recipientData);
        setTopics(topicData);
        if (
          requestedTopicId &&
          topicData.some(
            (topic: EvaluationTopic) =>
              topic.id === requestedTopicId && topic.status === "Active",
          )
        ) {
          setSelectedTopicId(requestedTopicId);
        }
        setCategories(questionData.categories);
        setQuestions(questionData.questions);
        setSelectedAssessmentVersionId(
          questionData.assessmentVersion?.id ?? null,
        );
      } catch {
        if (isMounted)
          setLoadError(
            t.unableToLoad,
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void loadFormData();
    return () => {
      isMounted = false;
    };
  }, [t.unableToLoad]);

  async function selectTopic(topicId: string) {
    const requestId = ++assessmentRequestId.current;
    setSelectedTopicId(topicId);
    setSelectedAssessmentVersionId(null);
    setAnswers({});
    setComment("");
    setStep(0);
    setLoadError("");
    if (!topicId) {
      setCategories([]);
      setQuestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/questions?topicId=${encodeURIComponent(topicId)}`,
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.unableToLoad);
      if (requestId !== assessmentRequestId.current) return;
      if (data.assessmentVersion?.kind === "exam") {
        window.location.replace(`/evaluator/exams?topicId=${encodeURIComponent(topicId)}`);
        return;
      }
      setCategories(data.categories);
      setQuestions(data.questions);
      setSelectedAssessmentVersionId(data.assessmentVersion?.id ?? null);
    } catch (reason) {
      if (requestId === assessmentRequestId.current)
        setLoadError(
          reason instanceof Error ? reason.message : t.unableToLoad,
        );
    } finally {
      if (requestId === assessmentRequestId.current) setLoading(false);
    }
  }

  const activeQuestions = useMemo(
    () => questions.filter((question) => question.isActive),
    [questions],
  );
  const sections = useMemo<Section[]>(
    () =>
      categories
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((category) => ({
          ...category,
          categoryName: getLocalizedCategoryName(category, locale),
          questions: activeQuestions
            .filter((question) => question.categoryId === category.id)
            .map((question) => getLocalizedQuestion(question, locale)),
        }))
        .filter((category) => category.questions.length > 0),
    [activeQuestions, categories, locale],
  );
  const isReviewStep = step === sections.length;
  const answeredCount = activeQuestions.filter((question) => isQuestionComplete(question, answers)).length;
  const progress = activeQuestions.length
    ? Math.round((answeredCount / activeQuestions.length) * 100)
    : 0;
  const selectedRecipient = recipients.find(
    (recipient) => recipient.id === selectedRecipientId,
  );
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);
  const availableBus = useMemo(
    () =>
      Array.from(
        new Set(
          recipients
            .filter((recipient) => recipient.status === "Active")
            .map((recipient) => recipient.buCode ?? recipient.bu),
        ),
      ).sort(),
    [recipients],
  );
  const visibleRecipients = useMemo(
    () =>
      recipients.filter(
        (recipient) =>
          recipient.status === "Active" &&
          (!selectedBu || (recipient.buCode ?? recipient.bu) === selectedBu),
      ),
    [recipients, selectedBu],
  );
  const currentSection = sections[step];
  const round = evaluationRound ?? 0;
  useEffect(() => {
    setEvaluationRound(null);
    setRoundSuggestion(null);
    setRoundSuggestionOpen(false);
    setRoundPadOpen(false);
    if (!selectedRecipient || !selectedTopicId) return;

    const controller = new AbortController();
    const params = new URLSearchParams({ topicId: selectedTopicId });
    if (selectedRecipient.buCode)
      params.set("buCode", selectedRecipient.buCode);
    params.set("bu", selectedRecipient.bu);

    setRoundSuggestionLoading(true);
    fetch(`/api/evaluations/round-suggestion?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? t.unableToLoad);
        return data as { latestRound: number | null };
      })
      .then(({ latestRound }) => {
        if (controller.signal.aborted) return;
        if (latestRound && latestRound > 0) {
          setRoundSuggestion(latestRound);
          setEvaluationRound(latestRound);
          setRoundSuggestionOpen(true);
        } else {
          setRoundSuggestion(1);
          setEvaluationRound(1);
          setRoundSuggestionOpen(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRoundSuggestion(1);
          setEvaluationRound(1);
          setRoundSuggestionOpen(false);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setRoundSuggestionLoading(false);
      });

    return () => controller.abort();
  }, [
    selectedRecipient?.bu,
    selectedRecipient?.buCode,
    selectedRecipientId,
    selectedTopicId,
    t.unableToLoad,
  ]);
  const readyToEvaluate = Boolean(
    selectedRecipient && selectedTopic && Number.isInteger(round) && round >= 1,
  );
  const currentSectionComplete =
    Boolean(currentSection) &&
    currentSection.questions.every(
      (question) => isQuestionComplete(question, answers),
    );

  function setAnswer(questionId: string, answer: QuestionAnswer | undefined) {
    setAnswers((current) => {
      const next = { ...current };
      if (answer === undefined) delete next[questionId];
      else next[questionId] = answer;
      return next;
    });
  }
  function scrollToSection() {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        sectionAnchorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }),
    );
  }
  function goBack() {
    setSubmitError("");
    setStep((current) => Math.max(0, current - 1));
    scrollToSection();
  }
  function goNext() {
    if (currentSectionComplete) {
      setSubmitError("");
      setStep((current) => Math.min(sections.length, current + 1));
      scrollToSection();
    }
  }
  function returnToSetup() {
    setLatest(null);
    setSelectedBu("");
    setSelectedRecipientId("");
    setSelectedTopicId("");
    setSelectedAssessmentVersionId(null);
    setEvaluationRound(null);
    setCategories([]);
    setQuestions([]);
    setEvaluationRound(null);
    setRoundSuggestion(null);
    setRoundSuggestionOpen(false);
    setRoundSuggestionLoading(false);
    setAnswers({});
    setComment("");
    setSubmitError("");
    setStep(0);
  }

  async function submit() {
    if (
      !selectedRecipient ||
      !selectedTopic ||
      !Number.isInteger(round) ||
      round < 1 ||
      answeredCount !== activeQuestions.length ||
      submitting
    )
      return;
    setSubmitError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedRecipient.id,
          topicId: selectedTopic.id,
          ...(selectedAssessmentVersionId
            ? { assessmentVersionId: selectedAssessmentVersionId }
            : {}),
          evaluationRound: round,
          comment,
          scores: {},
          answers,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSubmitError(result.error ?? t.unableToSave);
        return;
      }
      setLatest(result as EvaluationResult);
    } catch {
      setSubmitError(t.unableToSave);
    } finally {
      setSubmitting(false);
    }
  }

  if (latest)
    return <EvaluationResultScreen result={latest} onBack={returnToSetup} />;

  return (
    <section className="mx-auto min-w-0 max-w-5xl space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-slate-950 px-5 py-6 text-white md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
            {t.newEvaluation}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
            {t.title}
          </h2>
        </div>
        <div className="space-y-5 p-5 md:p-7">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-700">{t.bu}</span>
              <Select
                value={selectedBu || "all"}
                onValueChange={(value) => {
                  setSelectedBu(value === "all" ? "" : value);
                  setSelectedRecipientId("");
                  setStep(0);
                }}
                disabled={answeredCount > 0}
              >
                <SelectTrigger
                  aria-label={t.bu}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-sm shadow-none transition hover:border-slate-300 hover:bg-white focus:ring-4 focus:ring-blue-100 dark:bg-slate-900"
                >
                  <SelectValue className="truncate" placeholder={t.bu} />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={8}
                  className="rounded-2xl border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                >
                  <SelectItem value="all" className="py-3 text-[15px]">
                    {t.bu}
                  </SelectItem>
                  {availableBus.map((bu) => (
                    <SelectItem
                      key={bu}
                      value={bu}
                      className="py-3 text-[15px]"
                    >
                      {bu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-700">
                {t.selectRecipient}
              </span>
              <Select
                value={selectedRecipientId}
                onValueChange={(value) => {
                  setSelectedRecipientId(value);
                  setStep(0);
                }}
                disabled={answeredCount > 0}
              >
                <SelectTrigger
                  aria-label={t.selectRecipient}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-left text-sm shadow-none transition hover:border-slate-300 hover:bg-white focus:ring-4 focus:ring-blue-100 dark:bg-slate-900"
                >
                  <SelectValue
                    className="truncate text-left"
                    placeholder={t.selectRecipient}
                  />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={8}
                  className="rounded-2xl border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                >
                  {visibleRecipients.map((recipient) => (
                    <SelectItem
                      key={recipient.id}
                      value={recipient.id}
                      className="py-3 text-[15px]"
                    >
                      {recipient.employeeId} - {recipient.recipientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-700">
                {t.selectTopic}
              </span>
              <Select
                value={selectedTopicId}
                onValueChange={(value) => void selectTopic(value)}
                disabled
              >
                <SelectTrigger
                  aria-label={t.selectTopic}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-sm shadow-none transition hover:border-slate-300 hover:bg-white focus:ring-4 focus:ring-blue-100 dark:bg-slate-900"
                >
                  <SelectValue
                    className="truncate"
                    placeholder={t.selectTopic}
                  />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={8}
                  className="rounded-2xl border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                >
                  {topics
                    .filter((topic) => topic.status === "Active")
                    .map((topic) => (
                      <SelectItem
                        key={topic.id}
                        value={topic.id}
                        className="py-3 text-[15px]"
                      >
                        {topic.topicName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-700">
                {t.round}
              </span>
              <Button
                type="button"
                className="h-12 w-full cursor-not-allowed justify-between rounded-2xl border-slate-200 bg-slate-100 px-4 text-left font-semibold shadow-none opacity-70"
                disabled
                aria-label={t.round}
              >
                <span
                  className={
                    evaluationRound ? "text-slate-900" : "text-slate-400"
                  }
                >
                  {evaluationRound ?? (roundSuggestionLoading ? t.loading : t.round)}
                </span>
                <ChevronRight className="h-4 w-4 rotate-90 text-slate-400" />
              </Button>
            </label>
          </div>
          {answeredCount > 0 && (
            <p className="text-xs font-semibold text-slate-500">
              {t.selectionLockedAfterScoring}
            </p>
          )}
        </div>
      </Card>
      <Dialog
        open={roundSuggestionOpen}
        onClose={() => {
          if (roundSuggestion) setEvaluationRound(roundSuggestion);
          setRoundSuggestionOpen(false);
        }}
        title={t.latestRoundForBu}
        className="max-w-sm"
      >
        <p className="mb-5 text-sm text-slate-600">
          {t.bu}: {selectedRecipient?.buCode ?? selectedRecipient?.bu} · {t.round} {roundSuggestion}
        </p>
        <div className="grid gap-3">
          <Button
            type="button"
            onClick={() => {
              if (roundSuggestion) setEvaluationRound(roundSuggestion);
              setRoundSuggestionOpen(false);
            }}
          >
            {t.useLatestRound} ({roundSuggestion})
          </Button>
          <Button
            type="button"
            className="border border-slate-200 bg-white text-slate-700 shadow-none hover:bg-slate-50"
            onClick={() => {
              setRoundSuggestionOpen(false);
              setRoundPadOpen(true);
            }}
          >
            {t.chooseCustomRound}
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={roundPadOpen}
        onClose={() => setRoundPadOpen(false)}
        title={t.selectRound}
        className="max-w-sm"
      >
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }, (_, index) => index + 1).map((value) => (
            <button
              key={value}
              type="button"
              className="h-14 rounded-2xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-900 transition hover:border-primary hover:bg-blue-50 hover:text-primary"
              onClick={() => {
                setEvaluationRound(value);
                setStep(0);
                setRoundPadOpen(false);
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </Dialog>
      {loading && (
        <Card className="p-8 text-center text-sm font-semibold text-slate-500">
          {t.loading}
        </Card>
      )}
      {loadError && (
        <p
          role="alert"
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-danger"
        >
          {loadError}
        </p>
      )}
      {submitError && (
        <p
          role="alert"
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-danger"
        >
          {submitError}
        </p>
      )}
      {!loading && !loadError && !readyToEvaluate && (
        <Card className="p-8 text-center">
          <ClipboardCheck className="mx-auto h-10 w-10 text-primary" />
          <h3 className="mt-4 text-xl font-black">{t.setupEvaluation}</h3>
          <p className="mt-2 text-sm text-slate-500">
            {t.setupEvaluationDescription}
          </p>
        </Card>
      )}
      <div ref={sectionAnchorRef} className="scroll-mt-24" aria-hidden="true" />
      {!loading && !loadError && readyToEvaluate && currentSection && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-5 py-5 md:px-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-primary">
                  {t.section} {step + 1} {t.of} {sections.length}
                </p>
                <h3 className="mt-1 text-2xl font-black tracking-tight">
                  {currentSection.categoryName}
                </h3>
                {currentSection.isCritical && (
                  <div className="mt-2">
                    <Badge tone="warning">{t.critical}</Badge>
                  </div>
                )}
              </div>
              <p className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600">
                {answeredCount}/{activeQuestions.length} · {progress}%
              </p>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="space-y-5 p-5 md:p-7">
            {currentSection.questions.map((question, index) => (
              <CriterionQuestion
                key={question.id}
                index={index + 1}
                question={question}
                answer={answers[question.id]}
                onAnswer={(answer) => setAnswer(question.id, answer)}
              />
            ))}
            <WizardActions
              canGoNext={currentSectionComplete}
              canGoBack={step > 0}
              onBack={goBack}
              onNext={goNext}
            />
          </div>
        </Card>
      )}
      {!loading && !loadError && readyToEvaluate && isReviewStep && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-5 py-6 md:px-7">
            <p className="text-sm font-bold text-primary">{t.review}</p>
            <h3 className="mt-1 text-2xl font-black tracking-tight">
              {t.readyToSubmit}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {t.allQuestionsScored}
            </p>
          </div>
          <div className="space-y-5 p-5 md:p-7">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <p className="font-bold text-slate-800">
                    {section.categoryName}
                  </p>
                  <p className="mt-1 text-sm text-emerald-600">
                    {
                      section.questions.filter(
                        (question) => isQuestionComplete(question, answers),
                      ).length
                    }
                    /{section.questions.length} {t.complete}
                  </p>
                </div>
              ))}
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-700">
                {t.additionalComment}
              </span>
              <textarea
                className="min-h-32 w-full rounded-[24px] border border-slate-200 bg-white p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-primary"
                placeholder={t.commentPlaceholder}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </label>
            <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5">
              <Button
                type="button"
                className="bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200"
                onClick={goBack}
              >
                <ChevronLeft className="h-4 w-4" />
                {t.back}
              </Button>
              <Button type="button" disabled={submitting} onClick={submit}>
                {submitting ? t.submitting : t.submit}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}

function WizardActions({
  canGoNext,
  canGoBack,
  onBack,
  onNext,
}: {
  canGoNext: boolean;
  canGoBack: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5">
      <Button
        type="button"
        className="bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200"
        disabled={!canGoBack}
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4" />
        {t.back}
      </Button>
      <Button type="button" disabled={!canGoNext} onClick={onNext}>
        {t.next}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function EvaluationResultScreen({
  result,
  onBack,
}: {
  result: EvaluationResult;
  onBack: () => void;
}) {
  const { t, locale } = useI18n();
  const reportRef = useRef<HTMLDivElement>(null);
  const [savingPng, setSavingPng] = useState(false);
  async function savePng() {
    const report = reportRef.current;
    if (!report || savingPng) return;
    setSavingPng(true);
    let captureRoot: HTMLDivElement | undefined;
    try {
      const html2canvas = (await import("html2canvas")).default;
      captureRoot = report.cloneNode(true) as HTMLDivElement;
      captureRoot.style.position = "fixed";
      captureRoot.style.left = "-100000px";
      captureRoot.style.top = "0";
      captureRoot.style.width = `${Math.ceil(report.getBoundingClientRect().width)}px`;
      captureRoot.style.background = "#ffffff";
      captureRoot.dataset.exportTheme = "light";
      captureRoot.style.pointerEvents = "none";
      captureRoot
        .querySelectorAll("[data-html2canvas-ignore]")
        .forEach((element) => element.remove());
      document.body.appendChild(captureRoot);
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      const canvas = await html2canvas(captureRoot, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
        width: captureRoot.scrollWidth,
        height: captureRoot.scrollHeight,
      });
      const filename = `evaluation-${result.recipient?.employeeId ?? result.recipientId}-${result.evaluationDate}.png`;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => {
          if (value) resolve(value);
          else reject(new Error("Unable to create PNG"));
        }, "image/png");
      });
      const file = new File([blob], filename, { type: "image/png" });
      const canShareFile =
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare({ files: [file] }));
      if (canShareFile) {
        try {
          await navigator.share({ files: [file], title: "Evaluation result" });
          return;
        } catch (error) {
          // Cancellation is expected on mobile and should not trigger a second
          // download attempt.
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
        }
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.rel = "noopener";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } finally {
      captureRoot?.remove();
      setSavingPng(false);
    }
  }
  const totalActual = result.categorySummary.reduce(
    (sum, category) => sum + category.actualScore,
    0,
  );
  const totalFull = result.categorySummary.reduce(
    (sum, category) => sum + category.fullScore,
    0,
  );
  const criteria = getPassingCriteria(
    result.totalScore,
    result.categorySummary,
    locale,
    result.assessmentVersion,
  );
  const radarData = result.categorySummary.map((category) => ({
    ...category,
    reportName: getReportCategoryName(category, locale),
  }));
  return (
    <section className="mx-auto max-w-6xl space-y-5">
      <div
        ref={reportRef}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-950 shadow-sm"
      >
        <div className="border-b border-slate-200 bg-slate-950 px-5 py-7 text-white md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">
            {t.evaluationReport}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
            {t.title}
          </h2>
        </div>

        <div className="space-y-8 p-5 md:p-8">
          <dl className="grid gap-x-8 gap-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 xl:grid-cols-4">
            <ReportField
              label={t.recipient}
              value={result.recipient?.recipientName ?? "—"}
            />
            <ReportField
              label={t.employeeId}
              value={result.recipient?.employeeId ?? result.recipientId ?? "—"}
            />
            <ReportField
              label={t.evaluationTopic}
              value={result.topicName || "—"}
            />
            <ReportField
              label={`${t.department} / ${t.bu}`}
              value={`${result.bu || "—"}${result.buCode ? ` / ${result.buCode}` : ""}`}
            />
            <ReportField
              label={t.evaluator}
              value={result.evaluatorName || "—"}
            />
            <ReportField label={t.date} value={result.evaluationDate || "—"} />
            <ReportField
              label={t.round}
              value={
                result.evaluationRound ? String(result.evaluationRound) : "—"
              }
            />
            <ReportField
              label={t.finalResult}
              value={result.result === "Pass" ? t.pass : t.fail}
              emphasize={result.result === "Pass" ? "success" : "danger"}
            />
          </dl>

          <section>
            <h3 className="mb-4 text-lg font-black text-slate-950">
              {t.categorySummary}
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-white text-left text-xs uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3">{t.evaluationItem}</th>
                    <th className="px-4 py-3 text-center">{t.obtainedScore}</th>
                    <th className="px-4 py-3 text-center">{t.fullScore}</th>
                    <th className="px-4 py-3 text-center">{t.averageMaxFive}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.categorySummary.map((category, index) => {
                    const criticalFailure =
                      category.isCritical && category.average < 3;
                    return (
                      <tr
                        key={category.categoryId}
                        className={
                          criticalFailure ? "bg-red-50/70" : "bg-white"
                        }
                      >
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          <span className="mr-3 text-slate-400">
                            {index + 1}
                          </span>
                          {getReportCategoryName(category, locale)}
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums">
                          {category.actualScore.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums">
                          {category.fullScore.toFixed(0)}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-3 text-center font-black tabular-nums",
                            criticalFailure && "text-red-600",
                          )}
                        >
                          {category.average.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-slate-300 bg-white font-black text-slate-950">
                  <tr>
                    <td className="px-4 py-3">{t.total}</td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {totalActual.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {totalFull.toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">—</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td className="px-4 py-3">{t.overallAverage}</td>
                    <td colSpan={2} />
                    <td className="px-4 py-3 text-center text-lg tabular-nums">
                      {result.totalScore.toFixed(2)} / 5
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-lg font-black text-slate-950">
                  {t.showCriteria}
                </h3>
                <div className="mt-4 space-y-3">
                  {criteria.map((criterion) => (
                    <div
                      key={criterion.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <ReportCheckbox checked={criterion.passed} />
                      <p className="flex-1 leading-6 text-slate-700">
                        {criterion.label}
                      </p>
                      <span
                        className={cn(
                          "font-black tabular-nums",
                          criterion.passed
                            ? "text-emerald-600"
                            : "text-red-600",
                        )}
                      >
                        {criterion.unit === "%" ? `${criterion.actual.toFixed(2)}%` : criterion.actual.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-lg font-black text-slate-950">{t.result}</h3>
                <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                  <div className="flex items-center gap-3 font-bold text-slate-800">
                    <ReportCheckbox checked={result.result === "Pass"} /> {t.pass}
                  </div>
                  <div className="flex items-center gap-3 font-bold text-slate-800">
                    <ReportCheckbox checked={result.result === "Fail"} /> {t.fail}
                  </div>
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-lg font-black text-slate-950">{t.comment}</h3>
                <p className="mt-3 min-h-20 whitespace-pre-wrap border-b border-dashed border-slate-300 pb-3 text-sm leading-7 text-slate-700">
                  {result.comment || t.noComment}
                </p>
              </section>
            </div>
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-center text-lg font-black text-slate-950">
                {t.competencyProfile}
              </h3>
              <div className="mt-2 h-[390px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={radarData}
                    outerRadius="61%"
                    margin={{ top: 28, right: 48, bottom: 28, left: 48 }}
                  >
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis
                      dataKey="reportName"
                      tick={WrappedRadarTick}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 5]}
                      tickCount={6}
                      tick={{ fontSize: 9, fill: "#64748b" }}
                    />
                    <Radar
                      dataKey="average"
                      fill="#22c55e"
                      fillOpacity={0.42}
                      stroke="#16a34a"
                      strokeWidth={2}
                    />
                    <Tooltip
                      formatter={(value) => [
                        Number(value).toFixed(2),
                        t.average,
                      ]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>
      </div>
      <div
        className="flex flex-wrap justify-end gap-3"
        data-html2canvas-ignore="true"
      >
        <Button
          type="button"
          className="bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Button>
        <Button
          type="button"
          className="bg-slate-950 shadow-none hover:bg-slate-800"
          disabled={savingPng}
          onClick={savePng}
        >
          <ImageDown className="h-4 w-4" />
          {savingPng ? t.savingPng : t.savePng}
        </Button>
      </div>
    </section>
  );
}

function ReportField({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: "success" | "danger";
}) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 font-bold text-slate-900",
          emphasize === "success" && "text-emerald-600",
          emphasize === "danger" && "text-red-600",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function ReportCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded border-2",
        checked
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-300 bg-white",
      )}
      aria-hidden="true"
    >
      {checked && <Check className="h-4 w-4" strokeWidth={3} />}
    </span>
  );
}
