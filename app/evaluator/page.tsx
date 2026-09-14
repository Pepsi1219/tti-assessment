"use client";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ImageDown,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EvaluationCategoryReport } from "@/components/evaluation-category-report";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type {
  Category,
  EvaluationRecipient,
  EvaluationResult,
  EvaluationTopic,
  Question,
} from "@/lib/types";

type Section = Category & { questions: Question[] };

export default function EvaluatorPage() {
  const { t } = useI18n();
  const [recipients, setRecipients] = useState<EvaluationRecipient[]>([]);
  const [topics, setTopics] = useState<EvaluationTopic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedBu, setSelectedBu] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [evaluationRound, setEvaluationRound] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [step, setStep] = useState(0);
  const [latest, setLatest] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadFormData() {
      try {
        const [recipientRes, topicRes, questionRes] = await Promise.all([
          fetch("/api/recipients"),
          fetch("/api/topics"),
          fetch("/api/questions"),
        ]);
        if (!recipientRes.ok || !topicRes.ok || !questionRes.ok)
          throw new Error("Unable to load evaluation form data.");
        const [recipientData, topicData, questionData] = await Promise.all([
          recipientRes.json(),
          topicRes.json(),
          questionRes.json(),
        ]);
        if (!isMounted) return;
        setRecipients(recipientData);
        setTopics(topicData);
        setCategories(questionData.categories);
        setQuestions(questionData.questions);
      } catch {
        if (isMounted)
          setLoadError(
            "Unable to load the evaluation form. Please refresh and try again.",
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void loadFormData();
    return () => {
      isMounted = false;
    };
  }, []);

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
          questions: activeQuestions.filter(
            (question) => question.categoryId === category.id,
          ),
        }))
        .filter((category) => category.questions.length > 0),
    [activeQuestions, categories],
  );
  const isReviewStep = step === sections.length;
  const answeredCount = activeQuestions.filter((question) =>
    Boolean(scores[question.id]),
  ).length;
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
  const round = Number(evaluationRound);
  const readyToEvaluate = Boolean(
    selectedRecipient && selectedTopic && Number.isInteger(round) && round >= 1,
  );
  const currentSectionComplete =
    Boolean(currentSection) &&
    currentSection.questions.every((question) => Boolean(scores[question.id]));

  function setScore(questionId: string, score: number) {
    setScores((current) => ({ ...current, [questionId]: score }));
  }
  function goBack() {
    setSubmitError("");
    setStep((current) => Math.max(0, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function goNext() {
    if (currentSectionComplete) {
      setSubmitError("");
      setStep((current) => Math.min(sections.length, current + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function startNextEvaluation() {
    setLatest(null);
    setSelectedRecipientId("");
    setScores({});
    setComment("");
    setSubmitError("");
    setStep(0);
  }

  function returnToSetup() {
    setLatest(null);
    setSelectedBu("");
    setSelectedRecipientId("");
    setSelectedTopicId("");
    setEvaluationRound("");
    setScores({});
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
          evaluationRound: round,
          comment,
          scores,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSubmitError(result.error ?? "Unable to save evaluation.");
        return;
      }
      setLatest(result as EvaluationResult);
    } catch {
      setSubmitError(
        "Unable to connect to the evaluation service. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (latest)
    return (
      <EvaluationResultScreen
        result={latest}
        onBack={returnToSetup}
        onNext={startNextEvaluation}
      />
    );

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
              <span className="text-sm font-bold text-slate-700">BU</span>
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
                  aria-label="BU"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-sm shadow-none transition hover:border-slate-300 hover:bg-white focus:ring-4 focus:ring-blue-100 dark:bg-slate-900"
                >
                  <SelectValue className="truncate" placeholder="All BU" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={8}
                  className="rounded-2xl border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl"
                >
                  <SelectItem value="all" className="py-3 text-[15px]">
                    All BU
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
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-sm shadow-none transition hover:border-slate-300 hover:bg-white focus:ring-4 focus:ring-blue-100 dark:bg-slate-900"
                >
                  <SelectValue
                    className="truncate"
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
                      {recipient.employeeId} - {recipient.recipientName} (
                      {recipient.buCode ?? "-"} / {recipient.bu})
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
                onValueChange={(value) => {
                  setSelectedTopicId(value);
                  setStep(0);
                }}
                disabled={answeredCount > 0}
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
              <Input
                type="number"
                min="1"
                max="99"
                step="1"
                className="border-slate-200 bg-white"
                value={evaluationRound}
                onChange={(event) => {
                  setEvaluationRound(event.target.value);
                  setStep(0);
                }}
                disabled={answeredCount > 0}
              />
            </label>
          </div>
          {answeredCount > 0 && (
            <p className="text-xs font-semibold text-slate-500">
              The recipient, topic, and round are locked after scoring begins.
              Select “Evaluate next” to begin a new form.
            </p>
          )}
        </div>
      </Card>
      {loading && (
        <Card className="p-8 text-center text-sm font-semibold text-slate-500">
          Loading evaluation form…
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
          <h3 className="mt-4 text-xl font-black">Set up the evaluation</h3>
          <p className="mt-2 text-sm text-slate-500">
            Select the recipient, evaluation topic, and round to begin.
          </p>
        </Card>
      )}
      {!loading && !loadError && readyToEvaluate && currentSection && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-5 py-5 md:px-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-primary">
                  Section {step + 1} of {sections.length}
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
                score={scores[question.id]}
                onScore={(score) => setScore(question.id, score)}
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
            <p className="text-sm font-bold text-primary">Review</p>
            <h3 className="mt-1 text-2xl font-black tracking-tight">
              Ready to submit
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              All {activeQuestions.length} questions have been scored. Add a
              comment if needed.
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
                        (question) => scores[question.id],
                      ).length
                    }
                    /{section.questions.length} complete
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
                Back
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

function CriterionQuestion({
  index,
  question,
  score,
  onScore,
}: {
  index: number;
  question: Question;
  score?: number;
  onScore: (score: number) => void;
}) {
  const criteria = question.options.slice(0, question.maxScore || 5);
  return (
    <fieldset className="rounded-[24px] border border-slate-200 bg-white p-4 md:p-5">
      <legend className="sr-only">{question.questionText}</legend>
      <div className="flex gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">
          {index}
        </span>
        <p className="pt-1 text-sm font-bold leading-6 text-slate-800">
          {question.questionText}
        </p>
      </div>
      <div className="mt-4 space-y-2">
        {criteria.map((criterion, index) => {
          const value = index + 1;
          const selected = score === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onScore(value)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition",
                selected
                  ? "border-primary bg-blue-50 text-slate-950 shadow-[0_10px_22px_rgba(37,99,235,0.10)]"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black",
                  selected
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                {value}
              </span>
              <span className="pt-0.5 text-sm font-medium leading-6">
                {criterion}
              </span>
              {selected && (
                <CheckCircle2 className="ml-auto mt-1 h-4 w-4 shrink-0 text-primary" />
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
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
  return (
    <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5">
      <Button
        type="button"
        className="bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200"
        disabled={!canGoBack}
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      <Button type="button" disabled={!canGoNext} onClick={onNext}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function EvaluationResultScreen({
  result,
  onBack,
  onNext,
}: {
  result: EvaluationResult;
  onBack: () => void;
  onNext: () => void;
}) {
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
      const link = document.createElement("a");
      link.download = `evaluation-${result.recipient?.employeeId ?? result.recipientId}-${result.evaluationDate}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      captureRoot?.remove();
      setSavingPng(false);
    }
  }
  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <div
        ref={reportRef}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="bg-slate-950 px-5 py-7 text-white md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
            Evaluation summary
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">
            {result.recipient?.recipientName ?? "—"}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            {result.topicName} · Round {result.evaluationRound ?? "—"} ·{" "}
            {result.evaluationDate}
          </p>
        </div>
        <div className="space-y-6 p-5 md:p-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ResultTile
              label="Employee ID"
              value={result.recipient?.employeeId ?? "—"}
            />
            <ResultTile
              label="Score"
              value={`${result.totalScore.toFixed(2)} / 5`}
            />
            <ResultTile
              label="Percentage"
              value={`${result.percentage.toFixed(2)}%`}
            />
            <ResultTile
              label="Result"
              value={result.result}
              success={result.result === "Pass"}
            />
          </div>
          <EvaluationCategoryReport categories={result.categorySummary} />
          {result.comment && (
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Comments
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {result.comment}
              </p>
            </div>
          )}
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
          Back
        </Button>
        <Button
          type="button"
          className="bg-slate-950 shadow-none hover:bg-slate-800"
          disabled={savingPng}
          onClick={savePng}
        >
          <ImageDown className="h-4 w-4" />
          {savingPng ? "Saving PNG..." : "Save PNG"}
        </Button>
        <Button type="button" onClick={onNext}>
          <RotateCcw className="h-4 w-4" />
          Evaluate next
        </Button>
      </div>
    </section>
  );
}

function ResultTile({
  label,
  value,
  success,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-black tracking-tight",
          success ? "text-emerald-500" : "text-slate-950",
        )}
      >
        {value}
      </p>
    </div>
  );
}
