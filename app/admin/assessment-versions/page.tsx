"use client";

import { ChevronLeft, Circle, CopyPlus, Eye, Heart, Plus, Save, Send, Square, Star, ThumbsUp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CriterionQuestion } from "@/components/criterion-question";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StandardSelect } from "@/components/ui/standard-select";
import { useEscapeKey } from "@/lib/hooks/use-escape-key";
import { useI18n } from "@/lib/i18n/context";
import { getLocalizedCategoryName, getLocalizedQuestion } from "@/lib/i18n/question-content";
import { getQuestionScore, isQuestionScored } from "@/lib/services/evaluation-scoring";
import type { AssessmentKind, AssessmentVersion, Category, EvaluationTopic, OverallPassThresholdType, Question, QuestionAnswer, QuestionAnswerType } from "@/lib/types";

type EditableAssessment = Omit<
  AssessmentVersion,
  "id" | "version" | "status" | "createdAt" | "updatedAt" | "publishedAt"
> & { id?: string };
type AssessmentView = "courses" | "versions" | "editor";

function createClientId(prefix: string) {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
}

const emptyAssessment = (): EditableAssessment => ({
  name: "",
  kind: "assessment",
  overallPassThresholdType: "average",
  dashboardProfile: "category-score",
  overallPassThreshold: 3.5,
  criticalCategoryPassThreshold: 3,
  categories: [],
  questions: [],
});

function isPreviewQuestionComplete(question: Question, answer: QuestionAnswer | undefined) {
  const isBlank = answer === undefined || answer === null || answer === "" ||
    (Array.isArray(answer) && answer.length === 0);
  if (question.isRequired === false && isBlank) return true;
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
      return typeof answer === "number" && Number.isInteger(answer) && answer >= (question.minScore ?? 1) && answer <= question.maxScore;
  }
}

function getPreviewSectionScore(
  questions: Question[],
  answers: Record<string, QuestionAnswer>,
) {
  return questions.filter(isQuestionScored).reduce(
    (score, question) => ({
      obtained: score.obtained + (getQuestionScore(question, answers[question.id]) ?? 0) * question.weight,
      full: score.full + question.maxScore * question.weight,
    }),
    { obtained: 0, full: 0 },
  );
}

export default function AssessmentVersionsPage() {
  const { t, locale } = useI18n();
  const [versions, setVersions] = useState<AssessmentVersion[]>([]);
  const [topics, setTopics] = useState<EvaluationTopic[]>([]);
  const [assessment, setAssessment] = useState<EditableAssessment | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [view, setView] = useState<AssessmentView>("courses");
  const [newAssessmentFlow, setNewAssessmentFlow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingDeleteVersion, setPendingDeleteVersion] = useState<AssessmentVersion | null>(null);
  const [deletingVersion, setDeletingVersion] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [categoryStep, setCategoryStep] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, QuestionAnswer>>({});

  async function load() {
    const [versionResponse, topicResponse] = await Promise.all([
      fetch("/api/assessment-versions"),
      fetch("/api/topics"),
    ]);
    if (versionResponse.ok) setVersions(await versionResponse.json());
    if (topicResponse.ok) setTopics(await topicResponse.json());
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function createNewAssessment(topicId?: string) {
    setError("");
    setSuccess("");
    setCategoryStep(0);
    setSelectedId("");
    setSelectedTopicId(topicId ?? "");
    setNewAssessmentFlow(true);
    setAssessment(emptyAssessment());
    setView("editor");
  }

  function createRevision() {
    setError("");
    setSuccess("");
    setCategoryStep(0);
    const sourceVersion = versions.find((version) => version.id === selectedId);
    if (!sourceVersion) {
      setError(t.error);
      return;
    }
    setSelectedId("");
    setAssessment({
      name: sourceVersion.name,
      kind: sourceVersion.kind ?? "assessment",
      overallPassThresholdType: sourceVersion.overallPassThresholdType ?? "average",
      dashboardProfile: sourceVersion.dashboardProfile,
      overallPassThreshold: sourceVersion.overallPassThreshold,
      criticalCategoryPassThreshold: sourceVersion.criticalCategoryPassThreshold,
      categories: sourceVersion.categories.map((category) => ({ ...category })),
      questions: sourceVersion.questions.map((question) => ({ ...question })),
    });
    setSuccess(t.revisionReady);
    setNewAssessmentFlow(false);
    setView("editor");
  }

  function selectVersion(version: AssessmentVersion) {
    setCategoryStep(0);
    setSelectedId(version.id);
    setAssessment({
      id: version.id,
      name: version.name,
      kind: version.kind ?? "assessment",
      overallPassThresholdType: version.overallPassThresholdType ?? "average",
      dashboardProfile: version.dashboardProfile,
      overallPassThreshold: version.overallPassThreshold,
      criticalCategoryPassThreshold: version.criticalCategoryPassThreshold,
      categories: version.categories,
      questions: version.questions,
    });
    setError("");
    setSuccess("");
    setNewAssessmentFlow(false);
    setView("editor");
  }

  function selectCourse(topicId: string) {
    setSelectedTopicId(topicId);
    setError("");
    setSuccess("");
    const topic = topics.find((item) => item.id === topicId);
    setSelectedId(topic?.activeAssessmentVersionId ?? "");
    setAssessment(null);
    setView("versions");
  }

  function goBack() {
    setError("");
    setSuccess("");
    if (view === "editor") {
      setAssessment(null);
      if (newAssessmentFlow) {
        setSelectedId("");
        setSelectedTopicId("");
        setNewAssessmentFlow(false);
        setView("courses");
        return;
      }
      setView("versions");
      return;
    }
    if (view === "versions") {
      setAssessment(null);
      setSelectedId("");
      setSelectedTopicId("");
      setView("courses");
    }
  }

  useEscapeKey(goBack, view !== "courses" && !previewOpen);

  async function save(action: "saveDraft" | "publish") {
    if (!assessment) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/assessment-versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, version: assessment }),
      });
      const data = await response.json();
      if (!response.ok) {
        const validationDetails = Array.isArray(data.details)
          ? data.details
              .map((detail: { path?: string; message?: string }) =>
                [detail.path, detail.message].filter(Boolean).join(": "),
              )
              .filter(Boolean)
          : [];
        setError(
          validationDetails.length
            ? `${data.error ?? t.error}: ${validationDetails.join("; ")}`
            : data.error ?? t.error,
        );
        return;
      }
      setAssessment({
        id: data.id,
        name: data.name,
        kind: data.kind ?? "assessment",
        overallPassThresholdType: data.overallPassThresholdType ?? "average",
        dashboardProfile: data.dashboardProfile,
        overallPassThreshold: data.overallPassThreshold,
        criticalCategoryPassThreshold: data.criticalCategoryPassThreshold,
        categories: data.categories,
        questions: data.questions,
      });
      setSelectedId(data.id);
      let courseAssignmentFailed = false;
      const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);
      if (action === "publish" && selectedTopic) {
        try {
          const topicResponse = await fetch("/api/topics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: selectedTopic.id,
              topicName: selectedTopic.topicName,
              description: selectedTopic.description,
              status: selectedTopic.status,
              activeAssessmentVersionId: data.id,
            }),
          });
          if (topicResponse.ok) {
            const updatedTopic: EvaluationTopic = await topicResponse.json();
            setTopics((current) =>
              current.map((topic) =>
                topic.id === updatedTopic.id ? updatedTopic : topic,
              ),
            );
          } else {
            courseAssignmentFailed = true;
          }
        } catch {
          courseAssignmentFailed = true;
        }
      }
      await load();
      if (courseAssignmentFailed) {
        setError(t.publishedButCourseNotUpdated);
      } else {
        setSuccess(action === "publish" ? t.versionPublished : t.draftSaved);
      }
    } catch {
      setError(t.error);
    } finally {
      setSaving(false);
    }
  }

  function confirmRemoveVersion(version: AssessmentVersion) {
    setDeleteError("");
    setPendingDeleteVersion(version);
  }

  async function removeVersion() {
    if (!pendingDeleteVersion) return;

    setDeletingVersion(true);
    setDeleteError("");
    setSuccess("");
    try {
      const response = await fetch(
        `/api/assessment-versions?id=${encodeURIComponent(pendingDeleteVersion.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setDeleteError(response.status === 409 ? t.assessmentVersionInUse : data?.error ?? t.error);
        return;
      }

      setVersions((current) => current.filter((item) => item.id !== pendingDeleteVersion.id));
      setSuccess(t.assessmentVersionDeleted);
      setPendingDeleteVersion(null);
    } catch {
      setDeleteError(t.error);
    } finally {
      setDeletingVersion(false);
    }
  }

  function updateCategory(id: string, patch: Partial<Category>) {
    setAssessment((current) => current && ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === id ? { ...category, ...patch } : category,
      ),
    }));
  }

  function updateQuestion(id: string, patch: Partial<Question>) {
    setAssessment((current) => current && ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === id ? { ...question, ...patch } : question,
      ),
    }));
  }

  function openPreview() {
    setPreviewAnswers({});
    setPreviewStep(0);
    setPreviewOpen(true);
  }

  if (loading)
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const isPublished = versions.find((version) => version.id === selectedId)?.status === "Published";
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);
  const editorCategories = assessment
    ? assessment.categories.slice().sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  const activeCategoryIndex = Math.min(categoryStep, Math.max(0, editorCategories.length - 1));
  const activeEditorCategory = editorCategories[activeCategoryIndex];
  const editorCategoryQuestions = assessment?.questions.filter(
    (question) => question.categoryId === activeEditorCategory?.id,
  ) ?? [];
  const previewSections = assessment
    ? assessment.categories
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((category) => ({
          ...category,
          categoryName: getLocalizedCategoryName(category, locale),
          questions: assessment.questions
            .filter((question) => question.isActive && question.categoryId === category.id)
            .map((question) => getLocalizedQuestion(question, locale)),
        }))
        .filter((category) => category.questions.length > 0)
    : [];
  const previewQuestionCount = previewSections.reduce((count, section) => count + section.questions.length, 0);
  const previewAnsweredCount = previewSections.reduce(
    (count, section) => count + section.questions.filter((question) =>
      isPreviewQuestionComplete(question, previewAnswers[question.id]),
    ).length,
    0,
  );
  const previewSection = previewSections[previewStep];
  const isPreviewReviewStep = previewStep === previewSections.length;
  const assignedVersion = versions.find(
    (version) => version.id === selectedTopic?.activeAssessmentVersionId,
  );
  const courseGroups = topics
    .filter((topic) => topic.status === "Active")
    .reduce<Map<string, { version: AssessmentVersion | null; topics: EvaluationTopic[] }>>(
      (groups, topic) => {
        const version = versions.find(
          (item) => item.id === topic.activeAssessmentVersionId,
        ) ?? null;
        const key = version?.name ?? "unassigned";
        const group = groups.get(key) ?? { version, topics: [] };
        group.topics.push(topic);
        groups.set(key, group);
        return groups;
      },
      new Map(),
    );
  const versionsForCourse = assignedVersion
    ? versions.filter((version) => version.name === assignedVersion.name)
    : versions;
  const assignedVersionIds = new Set(
    topics
      .map((topic) => topic.activeAssessmentVersionId)
      .filter((id): id is string => Boolean(id)),
  );
  const unassignedVersions = versions.filter(
    (version) => !assignedVersionIds.has(version.id),
  );
  const profileOptions = [
    { value: "category-score", label: t.categoryScoreProfile },
    { value: "overall-score", label: t.overallScoreProfile },
    { value: "pass-fail", label: t.passFailProfile },
  ];
  const thresholdTypeOptions = [
    { value: "average", label: t.averageOutOfFive },
    { value: "percentage", label: t.percentage },
  ];
  const questionTypeOptions: { value: QuestionAnswerType; label: string }[] = [
    { value: "choice", label: "Choice" },
    { value: "text", label: "Text" },
    { value: "rating", label: "Rating" },
    { value: "date", label: "Date" },
    { value: "ranking", label: "Ranking" },
    { value: "likert", label: "Likert" },
    { value: "nps", label: "Net Promoter Score" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">{t.assessmentVersions}</h1>
      <main className="min-w-0">
      {error && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{success}</p>}
      {view === "courses" ? (
        <>
        <section className="space-y-6">
          <div className="flex justify-end">
            <Button className="h-9 whitespace-nowrap px-4" onClick={() => createNewAssessment()}>
              <Plus className="h-4 w-4" />{t.createAssessment}
            </Button>
          </div>
          {courseGroups.size ? Array.from(courseGroups.entries()).map(([groupId, group]) => (
            <section key={groupId} className="space-y-3">
              <h3 className="border-b border-slate-200 pb-2 text-sm font-bold text-slate-500">
                {group.version?.name ?? t.legacyAssessment}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {group.topics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => selectCourse(topic.id)}
                    className="min-h-24 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="block font-bold">{topic.topicName}</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">
                      {versions.find((version) => version.id === topic.activeAssessmentVersionId)
                        ? `v${versions.find((version) => version.id === topic.activeAssessmentVersionId)?.version}`
                        : t.legacyAssessment}
                    </span>
                    {topic.description && <span className="mt-1 block text-sm font-normal text-slate-500">{topic.description}</span>}
                  </button>
                ))}
              </div>
            </section>
          )) : <Card className="p-10 text-center text-sm text-slate-500">{t.noData}</Card>}
        </section>
      {unassignedVersions.length > 0 && (
        <section className="mt-8 space-y-3">
          <h3 className="border-b border-slate-200 pb-2 text-sm font-bold text-slate-500">
            {t.unassignedAssessmentVersions}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {unassignedVersions.map((version) => (
              <div
                key={version.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-primary"
              >
                <button
                  type="button"
                  onClick={() => selectVersion(version)}
                  className="min-w-0 flex-1 p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-bold">{version.name}</span>
                    <Badge tone={version.status === "Published" ? "success" : "neutral"}>
                      {version.status === "Published" ? t.published : t.draft}
                    </Badge>
                  </span>
                  <span className="mt-2 block text-sm text-slate-500">v{version.version}</span>
                </button>
                <button
                  type="button"
                  title={t.delete}
                  aria-label={`${t.delete} ${version.name} v${version.version}`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  onClick={() => confirmRemoveVersion(version)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
        </>
      ) : view === "versions" ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Button className="h-9 w-9 shrink-0 px-0" onClick={goBack} title={t.back} aria-label={t.back}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-sm font-bold uppercase text-slate-400">{t.selectAssessment}</p>
                <h2 className="text-2xl font-black">{selectedTopic?.topicName}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {assignedVersion ? `${assignedVersion.name} · v${assignedVersion.version}` : t.legacyAssessment}
                </p>
              </div>
            </div>
            <Button onClick={assignedVersion ? createRevision : () => createNewAssessment(selectedTopicId)}>
              <CopyPlus className="h-4 w-4" />{assignedVersion ? t.createRevision : t.createAssessment}
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {versionsForCourse.map((version) => (
              <div
                key={version.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-primary"
              >
                <button
                  type="button"
                  onClick={() => selectVersion(version)}
                  className="min-w-0 flex-1 p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-bold">{version.name}</span>
                    <Badge tone={version.status === "Published" ? "success" : "neutral"}>
                      {version.status === "Published" ? t.published : t.draft}
                    </Badge>
                  </span>
                  <span className="mt-2 block text-sm text-slate-500">v{version.version}</span>
                </button>
                <button
                  type="button"
                  title={t.delete}
                  aria-label={`${t.delete} ${version.name} v${version.version}`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  onClick={() => confirmRemoveVersion(version)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : assessment ? (
        <section className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <Button className="h-9 w-9 px-0" onClick={goBack} title={t.back} aria-label={t.back}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <p className="text-xs font-bold uppercase text-slate-400">{selectedTopic?.topicName ?? t.assessmentVersion}</p>
              </div>
              <h2 className="text-2xl font-black">{assessment.name || t.createAssessment}</h2>
              {isPublished && <p className="mt-1 text-sm text-slate-500">{t.publishedVersionHelp}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200" onClick={openPreview}>
                <Eye className="h-4 w-4" />{t.previewAssessment}
              </Button>
              {isPublished ? (
                <Button onClick={createRevision}>
                  <CopyPlus className="h-4 w-4" />{t.createRevision}
                </Button>
              ) : (
                <>
                  <Button className="bg-slate-200 text-slate-700 shadow-none hover:bg-slate-300" onClick={() => save("saveDraft")} disabled={saving || !assessment.name}>
                    <Save className="h-4 w-4" />{t.save}
                  </Button>
                  <Button onClick={() => save("publish")} disabled={saving || !assessment.name || !assessment.questions.length}>
                    <Send className="h-4 w-4" />{t.publishAssessment}
                  </Button>
                </>
              )}
            </div>
          </div>

          <Card className="grid gap-4 p-5 md:grid-cols-2">
            <label className="space-y-1 text-sm font-bold">
              <span>{t.assessmentName}</span>
              <Input value={assessment.name} disabled={isPublished} onChange={(event) => setAssessment({ ...assessment, name: event.target.value })} />
            </label>
            <label className="space-y-1 text-sm font-bold">
              <span>{t.assessmentType}</span>
              <StandardSelect
                value={assessment.kind ?? "assessment"}
                onValueChange={(value) => {
                  const kind = value as AssessmentKind;
                  setAssessment({
                    ...assessment,
                    kind,
                    questions: assessment.questions.map((question) => {
                      if (kind === "exam") {
                        return question.answerType === "text"
                          ? { ...question, isScored: true }
                          : question.answerType === "choice"
                            ? { ...question, isScored: true }
                            : question;
                      }
                      if (question.answerType === "text" || question.answerType === "date" ||
                          question.answerType === "ranking" ||
                          question.answerType === "choice" && question.allowMultiple) {
                        const rest = { ...question };
                        delete rest.correctAnswer;
                        return { ...rest, isScored: false };
                      }
                      const rest = { ...question };
                      delete rest.correctAnswer;
                      return rest;
                    }),
                  });
                }}
                ariaLabel={t.assessmentType}
                options={[
                  { value: "assessment", label: t.assessmentMode },
                  { value: "exam", label: t.examMode },
                ]}
                disabled={isPublished}
              />
            </label>
            <label className="space-y-1 text-sm font-bold">
              <span>{t.dashboardProfile}</span>
              <StandardSelect value={assessment.dashboardProfile} onValueChange={(value) => setAssessment({ ...assessment, dashboardProfile: value as EditableAssessment["dashboardProfile"] })} ariaLabel={t.dashboardProfile} options={profileOptions} disabled={isPublished} />
            </label>
            <label className="space-y-1 text-sm font-bold">
              <span>{t.overallPassThresholdType}</span>
              <StandardSelect
                value={assessment.overallPassThresholdType ?? "average"}
                onValueChange={(value) => {
                  const type = value as OverallPassThresholdType;
                  const currentType = assessment.overallPassThresholdType ?? "average";
                  if (type === currentType) return;
                  setAssessment({
                    ...assessment,
                    overallPassThresholdType: type,
                    overallPassThreshold: Number((type === "percentage"
                      ? assessment.overallPassThreshold * 20
                      : assessment.overallPassThreshold / 20).toFixed(1)),
                  });
                }}
                ariaLabel={t.overallPassThresholdType}
                options={thresholdTypeOptions}
                disabled={isPublished}
              />
            </label>
            <label className="space-y-1 text-sm font-bold">
              <span>{t.overallPassThreshold}</span>
              <Input type="number" min="0" max={assessment.overallPassThresholdType === "percentage" ? "100" : "5"} step="0.1" value={assessment.overallPassThreshold} disabled={isPublished} onChange={(event) => setAssessment({ ...assessment, overallPassThreshold: Number(event.target.value) })} />
            </label>
            <label className="space-y-1 text-sm font-bold">
              <span>{t.criticalPassThreshold}</span>
              <Input type="number" min="0" max="5" step="0.1" value={assessment.criticalCategoryPassThreshold} disabled={isPublished} onChange={(event) => setAssessment({ ...assessment, criticalCategoryPassThreshold: Number(event.target.value) })} />
            </label>
          </Card>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="relative h-[116px] bg-white pt-2">
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-6 rounded-r-full bg-primary" />
              <h3 className="relative z-10 inline-flex h-[90px] items-center rounded-t-2xl bg-primary px-6 text-2xl font-black text-white">
                {t.sectionProgress} {activeEditorCategory ? activeCategoryIndex + 1 : 0} {t.of} {editorCategories.length}
              </h3>
              <h3 className="absolute bottom-0 right-6 z-10 flex h-6 items-center text-xs font-bold text-white">
                {t.questions} · {editorCategoryQuestions.length}
              </h3>
              {!isPublished && <Button className="absolute right-6 top-4 z-20 h-9 bg-white px-4 text-primary shadow-none hover:bg-slate-50" onClick={() => {
                setAssessment({ ...assessment, categories: [...assessment.categories, { id: createClientId("cat"), categoryName: "", sortOrder: assessment.categories.length + 1 }] });
                setCategoryStep(assessment.categories.length);
              }}><Plus className="h-4 w-4" />{t.addCategory}</Button>}
            </div>
            {activeEditorCategory ? (
            <div key={activeEditorCategory.id} className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              <Input value={activeEditorCategory.categoryName} disabled={isPublished} aria-label={t.section} onChange={(event) => updateCategory(activeEditorCategory.id, { categoryName: event.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={Boolean(activeEditorCategory.isCritical)} disabled={isPublished} onChange={(event) => updateCategory(activeEditorCategory.id, { isCritical: event.target.checked })} />
                {t.critical}
              </label>
              {!isPublished && <button type="button" title={t.delete} aria-label={t.delete} className="grid h-9 w-9 place-items-center rounded-md text-red-600 hover:bg-red-50" onClick={() => setAssessment({ ...assessment, categories: assessment.categories.filter((item) => item.id !== activeEditorCategory.id), questions: assessment.questions.filter((item) => item.categoryId !== activeEditorCategory.id) })}><Trash2 className="h-4 w-4" /></button>}
            </div>
            ) : (
              <div className="border-t border-slate-200 p-6 text-center text-sm text-slate-500">{t.noData}</div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            {!isPublished && <div className="flex flex-wrap gap-2">
              {assessment.questions.some((question) => question.answerType === "choice" && !question.allowMultiple && question.options.length >= 2 && question.options.length <= 10 && !question.isScored) && <Button className="px-3 py-1.5 text-xs" onClick={() => setAssessment({ ...assessment, questions: assessment.questions.map((question) => question.answerType === "choice" && !question.allowMultiple && question.options.length >= 2 && question.options.length <= 10 ? { ...question, isScored: true, maxScore: question.options.length } : question) })}>{t.scoreAllChoiceQuestions}</Button>}
            </div>}
          </div>
          <div className="space-y-3">
            {editorCategoryQuestions.map((question) => (
              <Card key={question.id} className="grid min-h-40 gap-3 p-4">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                  <textarea className="h-11 w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 dark:disabled:border-slate-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-100" value={question.questionText} disabled={isPublished} aria-label={t.question} onChange={(event) => updateQuestion(question.id, { questionText: event.target.value })} />
                  <StandardSelect value={question.answerType ?? "rating"} onValueChange={(value) => {
                    const answerType = value as QuestionAnswerType;
                    updateQuestion(question.id, {
                      answerType,
                      options: ["choice", "ranking", "rating", "likert"].includes(answerType) ? question.options : [],
                      statements: answerType === "likert" ? question.statements ?? [] : [],
                      likertIcon: answerType === "likert" ? question.likertIcon ?? "star" : question.likertIcon,
                      minScore: answerType === "rating" ? question.minScore ?? 1 : question.minScore,
                      correctAnswer: undefined,
                      maxScore: answerType === "nps" ? 10 : answerType === "likert" ? Math.max(2, question.maxScore) : answerType === "choice" && question.options.length ? question.options.length : Math.min(5, question.maxScore),
                      isScored: assessment.kind === "exam" && ["text", "choice"].includes(answerType)
                        ? true
                        : answerType === "nps" ? false : ["rating", "likert"].includes(answerType) || answerType === "choice" && !question.allowMultiple,
                      allowMultiple: answerType === "choice" ? question.allowMultiple : false,
                    });
                  }} ariaLabel={t.questionType} options={questionTypeOptions} disabled={isPublished} />
                </div>
                {(assessment.kind === "exam" && question.answerType === "text" && question.isScored !== false || question.answerType === "nps") && <div className="flex flex-wrap items-center gap-4">
                  {assessment.kind === "exam" && question.answerType === "text" && question.isScored !== false && <label className="flex items-center gap-2 text-sm">{t.maxScore}<Input className="w-20" type="number" min="1" max="10" value={question.maxScore} disabled={isPublished} onChange={(event) => updateQuestion(question.id, { maxScore: Number(event.target.value) })} /></label>}
                  {question.answerType === "nps" && <span className="text-sm text-slate-500">0-10</span>}
                </div>}
                {question.answerType === "rating" && <div className="space-y-3 rounded-md border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold">{t.ratingRange}</span>
                    <StandardSelect value={String(question.minScore ?? 1)} onValueChange={(value) => {
                      const minScore = Number(value);
                      updateQuestion(question.id, { minScore, maxScore: Math.max(question.maxScore, minScore) });
                    }} ariaLabel={t.ratingStart} options={Array.from({ length: 5 }, (_, index) => ({ value: String(index + 1), label: String(index + 1) }))} disabled={isPublished} className="h-10 w-20 bg-white px-3" />
                    <span className="text-sm text-slate-500">{t.to}</span>
                    <StandardSelect value={String(question.maxScore)} onValueChange={(value) => updateQuestion(question.id, { minScore: question.minScore ?? 1, maxScore: Number(value) })} ariaLabel={t.ratingEnd} options={Array.from({ length: 6 - (question.minScore ?? 1) }, (_, index) => {
                      const value = (question.minScore ?? 1) + index;
                      return { value: String(value), label: String(value) };
                    })} disabled={isPublished} className="h-10 w-20 bg-white px-3" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
                      <span className="text-sm font-medium text-slate-600">{question.minScore ?? 1}</span>
                      <Input value={question.minScoreLabel ?? question.options[0] ?? ""} disabled={isPublished} aria-label={`${t.ratingStart} ${t.ratingLabelPlaceholder}`} placeholder={t.ratingLabelPlaceholder} onChange={(event) => updateQuestion(question.id, { minScore: question.minScore ?? 1, minScoreLabel: event.target.value })} />
                    </label>
                    <label className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
                      <span className="text-sm font-medium text-slate-600">{question.maxScore}</span>
                      <Input value={question.maxScoreLabel ?? question.options.at(-1) ?? ""} disabled={isPublished} aria-label={`${t.ratingEnd} ${t.ratingLabelPlaceholder}`} placeholder={t.ratingLabelPlaceholder} onChange={(event) => updateQuestion(question.id, { minScore: question.minScore ?? 1, maxScoreLabel: event.target.value })} />
                    </label>
                  </div>
                </div>}
                {question.answerType === "likert" && <div className="space-y-4 rounded-md border border-slate-200 p-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="space-y-1 text-sm font-bold">
                      <span>{t.likertScale}</span>
                      <StandardSelect value={String(question.maxScore)} onValueChange={(value) => updateQuestion(question.id, { maxScore: Number(value) })} ariaLabel={t.likertScale} options={Array.from({ length: 9 }, (_, index) => {
                        const value = index + 2;
                        return { value: String(value), label: String(value) };
                      })} disabled={isPublished} className="h-10 w-24 bg-white px-3" />
                    </label>
                    <label className="space-y-1 text-sm font-bold">
                      <span>{t.likertSymbol}</span>
                      <StandardSelect value={question.likertIcon ?? "star"} onValueChange={(value) => updateQuestion(question.id, { likertIcon: value as "star" | "heart" | "thumbs-up" })} ariaLabel={t.likertSymbol} options={[
                        { value: "star", label: `★ ${t.likertStar}` },
                        { value: "heart", label: `♥ ${t.likertHeart}` },
                        { value: "thumbs-up", label: `👍 ${t.likertThumbsUp}` },
                      ]} disabled={isPublished} className="h-10 min-w-36 bg-white px-3" />
                    </label>
                  </div>
                  <div className="grid min-w-[320px] grid-flow-col auto-cols-fr gap-2 overflow-x-auto text-center">
                    {Array.from({ length: question.maxScore }, (_, index) => <div key={index} className="flex flex-col items-center gap-2 py-2">
                      <span className="text-base font-medium">{index + 1}</span>
                      {question.likertIcon === "heart" ? <Heart aria-hidden="true" className="h-7 w-7 text-slate-500" /> : question.likertIcon === "thumbs-up" ? <ThumbsUp aria-hidden="true" className="h-7 w-7 text-slate-500" /> : <Star aria-hidden="true" className="h-7 w-7 text-slate-500" />}
                    </div>)}
                  </div>
                </div>}
                {question.answerType === "choice" && <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={`${question.id}-option-${optionIndex}`} className="flex items-center gap-3">
                      {question.allowMultiple ? <Square aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400" /> : <Circle aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400" />}
                      <Input value={option} disabled={isPublished} aria-label={`${t.options} ${optionIndex + 1}`} placeholder={`${t.optionPlaceholder} ${optionIndex + 1}`} onChange={(event) => {
                        const options = [...question.options];
                        const oldOption = options[optionIndex];
                        options[optionIndex] = event.target.value;
                        const correctAnswer = Array.isArray(question.correctAnswer)
                          ? question.correctAnswer.map((answer) => answer === oldOption ? event.target.value : answer)
                          : question.correctAnswer === oldOption ? event.target.value : question.correctAnswer;
                        updateQuestion(question.id, { options, correctAnswer });
                      }} />
                      {!isPublished && <button type="button" title={t.delete} aria-label={`${t.delete} ${t.options} ${optionIndex + 1}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100" onClick={() => {
                        const removedOption = question.options[optionIndex];
                        const options = question.options.filter((_, index) => index !== optionIndex);
                        const correctAnswer = Array.isArray(question.correctAnswer)
                          ? question.correctAnswer.filter((answer) => answer !== removedOption)
                          : question.correctAnswer === removedOption ? undefined : question.correctAnswer;
                        updateQuestion(question.id, { options, correctAnswer });
                      }}><Trash2 className="h-4 w-4" /></button>}
                    </div>
                  ))}
                  {!isPublished && <div className="ml-8 flex flex-wrap items-center gap-2 text-sm">
                    <button type="button" className="font-medium text-primary hover:underline" onClick={() => updateQuestion(question.id, { options: [...question.options, ""] })}>{t.addOption}</button>
                    <span className="text-slate-500">{t.or}</span>
                    <button type="button" disabled={question.options.includes(t.otherOptionLabel)} className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline" onClick={() => updateQuestion(question.id, { options: [...question.options, t.otherOptionLabel] })}>{t.addOtherOption}</button>
                  </div>}
                </div>}
                {question.answerType === "ranking" && <label className="space-y-1 text-sm font-bold">
                  <span>{t.optionsHint}</span>
                  <textarea className="min-h-40 w-full rounded-md border border-slate-200 p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 dark:disabled:border-slate-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-100" value={question.options.join("\n")} disabled={isPublished} placeholder={t.optionsPlaceholder} onChange={(event) => updateQuestion(question.id, { options: event.target.value.split("\n").map((value) => value.trim()).filter(Boolean) })} />
                </label>}
                {question.answerType === "likert" && <label className="space-y-1 text-sm font-bold">
                  <span>{t.statements}</span>
                  <textarea className="min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-100 dark:disabled:border-slate-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-100" value={(question.statements ?? []).join("\n")} disabled={isPublished} onChange={(event) => updateQuestion(question.id, { statements: event.target.value.split("\n").map((value) => value.trim()).filter(Boolean) })} />
                </label>}
                {assessment.kind === "exam" && question.answerType === "choice" && question.isScored !== false && (
                  <div className="space-y-2 text-sm font-bold">
                    <span>{t.correctAnswer}</span>
                    {question.allowMultiple ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {question.options.map((option) => {
                          const correctAnswers = Array.isArray(question.correctAnswer)
                            ? question.correctAnswer
                            : [];
                          return (
                            <label key={option} className="flex items-center gap-2 rounded-md border border-slate-200 p-3 font-normal">
                              <input
                                type="checkbox"
                                checked={correctAnswers.includes(option)}
                                disabled={isPublished}
                                onChange={(event) => {
                                  const next = event.target.checked
                                    ? [...correctAnswers, option]
                                    : correctAnswers.filter((item) => item !== option);
                                  updateQuestion(question.id, { correctAnswer: next.length ? next : undefined });
                                }}
                              />
                              {option}
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <select
                        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 font-normal"
                        value={typeof question.correctAnswer === "string" ? question.correctAnswer : ""}
                        disabled={isPublished || !question.options.length}
                        onChange={(event) => updateQuestion(question.id, { correctAnswer: event.target.value || undefined })}
                      >
                        <option value="">{t.selectCorrectAnswer}</option>
                        {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-3 border-t border-slate-100 pt-3">
                  {!isPublished && <div className="flex items-center gap-1">
                    <button type="button" title={t.duplicateQuestion} aria-label={t.duplicateQuestion} className="grid h-10 w-10 place-items-center rounded-md text-slate-600 hover:bg-slate-100" onClick={() => setAssessment({ ...assessment, questions: assessment.questions.flatMap((item) => item.id === question.id ? [item, { ...item, id: createClientId("question") }] : [item]) })}><CopyPlus className="h-5 w-5" /></button>
                    <button type="button" title={t.delete} aria-label={`${t.delete} ${t.question}`} className="grid h-10 w-10 place-items-center rounded-md text-slate-600 hover:bg-red-50 hover:text-red-600" onClick={() => setAssessment({ ...assessment, questions: assessment.questions.filter((item) => item.id !== question.id) })}><Trash2 className="h-5 w-5" /></button>
                  </div>}
                  <span aria-hidden="true" className="hidden h-8 border-l border-slate-200 sm:block" />
                  <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="checkbox" className="peer sr-only" checked={question.isRequired !== false} disabled={isPublished} onChange={(event) => updateQuestion(question.id, { isRequired: event.target.checked })} />
                      <span>{t.required}</span>
                      <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-disabled:opacity-50" />
                    </label>
                    {(["rating", "likert", "nps"].includes(question.answerType ?? "rating") || assessment.kind === "exam" && ["text", "choice"].includes(question.answerType ?? "rating")) && <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="checkbox" className="peer sr-only" checked={question.isScored !== false} disabled={isPublished} onChange={(event) => updateQuestion(question.id, { isScored: event.target.checked })} />
                      <span>{t.scored}</span>
                      <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-disabled:opacity-50" />
                    </label>}
                    {["rating", "likert", "nps"].includes(question.answerType ?? "rating") && question.isScored !== false && <label className="flex items-center gap-2 text-sm">{t.weight}<Input className="w-20" type="number" min="0.01" step="0.1" value={question.weight} disabled={isPublished} onChange={(event) => updateQuestion(question.id, { weight: Number(event.target.value) })} /></label>}
                    {question.answerType === "choice" && <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="checkbox" className="peer sr-only" checked={Boolean(question.allowMultiple)} disabled={isPublished} onChange={(event) => updateQuestion(question.id, { allowMultiple: event.target.checked, correctAnswer: undefined })} />
                      <span>{t.allowMultiple}</span>
                      <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-disabled:opacity-50" />
                    </label>}
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="checkbox" className="peer sr-only" checked={question.isActive} disabled={isPublished} onChange={(event) => updateQuestion(question.id, { isActive: event.target.checked })} />
                      <span>{t.active}</span>
                      <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-disabled:opacity-50" />
                    </label>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {!isPublished && <div className="flex justify-center pt-2">
            <Button className="px-3 py-1.5 text-xs" disabled={!activeEditorCategory} onClick={() => setAssessment({ ...assessment, questions: [...assessment.questions, { id: createClientId("question"), categoryId: activeEditorCategory?.id ?? "", questionText: "", answerType: "rating", isRequired: true, isScored: true, options: [], weight: 1, minScore: 1, maxScore: 5, isActive: true }] })}><Plus className="h-4 w-4" />{t.addQuestion}</Button>
          </div>}
          <div className="flex justify-between gap-3 border-t border-slate-100 pt-5">
            <Button
              type="button"
              className="bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200"
              disabled={!activeEditorCategory || activeCategoryIndex === 0}
              onClick={() => setCategoryStep((current) => Math.max(0, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" />{t.back}
            </Button>
            <div className="self-center text-sm font-bold text-slate-500">
              {activeEditorCategory ? `${t.section} ${activeCategoryIndex + 1} ${t.of} ${editorCategories.length}` : `${t.section} 0 ${t.of} 0`}
            </div>
            <Button
              type="button"
              disabled={!activeEditorCategory || activeCategoryIndex >= editorCategories.length - 1}
              onClick={() => setCategoryStep((current) => Math.min(editorCategories.length - 1, current + 1))}
            >
              {t.next}<ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
          <Dialog
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            title={t.previewAssessment}
            className="max-w-4xl"
          >
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-black">{assessment.name || t.assessmentName}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.previewModeNotice}</p>
              </div>
              {!previewSections.length ? (
                <Card className="p-8 text-center text-sm text-slate-500">{t.noData}</Card>
              ) : isPreviewReviewStep ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="font-bold">{t.review}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {previewAnsweredCount}/{previewQuestionCount} {t.complete}
                    </p>
                  </div>
                  <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                    {previewSections.map((section, index) => (
                      <button
                        key={section.id}
                        type="button"
                        className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50"
                        onClick={() => setPreviewStep(index)}
                      >
                        <span className="font-semibold">{section.categoryName}</span>
                        <span className="shrink-0 text-right">
                          {(() => {
                            const score = getPreviewSectionScore(section.questions, previewAnswers);
                            return score.full > 0 ? (
                              <span className="block text-sm font-semibold">
                                {score.obtained.toLocaleString(locale, { maximumFractionDigits: 2 })}/{score.full.toLocaleString(locale, { maximumFractionDigits: 2 })} {t.score}
                              </span>
                            ) : null;
                          })()}
                          <span className="block text-xs text-slate-500">
                            {section.questions.filter((question) =>
                              isPreviewQuestionComplete(question, previewAnswers[question.id]),
                            ).length}/{section.questions.length} {t.complete}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : previewSection ? (
                <div className="space-y-5">
                  <div className="border-b border-slate-200 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-primary">
                          {t.section} {previewStep + 1} {t.of} {previewSections.length}
                        </p>
                        <h4 className="mt-1 text-xl font-black">{previewSection.categoryName}</h4>
                        {previewSection.isCritical && <Badge tone="warning">{t.critical}</Badge>}
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-slate-500">
                        {previewAnsweredCount}/{previewQuestionCount}
                      </p>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${previewQuestionCount ? Math.round((previewAnsweredCount / previewQuestionCount) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {previewSection.questions.map((question, index) => (
                      <CriterionQuestion
                        key={question.id}
                        index={index + 1}
                        question={question}
                        answer={previewAnswers[question.id]}
                        onAnswer={(answer) => setPreviewAnswers((current) => {
                          const next = { ...current };
                          if (answer === undefined) delete next[question.id];
                          else next[question.id] = answer;
                          return next;
                        })}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="flex justify-between gap-3 border-t border-slate-200 pt-4">
                <Button
                  className="bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200"
                  onClick={() => setPreviewStep((step) => Math.max(0, step - 1))}
                  disabled={previewStep === 0 || !previewSections.length}
                >
                  <ChevronLeft className="h-4 w-4" />{t.back}
                </Button>
                {previewSections.length && !isPreviewReviewStep ? (
                  <Button
                    onClick={() => setPreviewStep((step) => step + 1)}
                    disabled={!previewSection?.questions.every((question) =>
                      isPreviewQuestionComplete(question, previewAnswers[question.id]),
                    )}
                  >
                    {t.next}<ChevronLeft className="h-4 w-4 rotate-180" />
                  </Button>
                ) : (
                  <Button onClick={() => setPreviewOpen(false)}>{t.close}</Button>
                )}
              </div>
            </div>
          </Dialog>
        </section>
      ) : (
        <Card className="grid min-h-48 place-items-center p-8 text-sm text-slate-500">{t.selectCourseAssessment}</Card>
      )}
      <Dialog
        open={Boolean(pendingDeleteVersion)}
        onClose={() => {
          if (!deletingVersion) setPendingDeleteVersion(null);
        }}
        title={t.confirmDelete}
      >
        <div className="space-y-5">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-bold text-slate-950">
              {pendingDeleteVersion?.name} · v{pendingDeleteVersion?.version}
            </p>
            <p className="mt-2 text-sm leading-6 text-red-700">
              {t.deleteAssessmentVersionWarning}
            </p>
          </div>
          {deleteError && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {deleteError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button
              className="bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200"
              onClick={() => setPendingDeleteVersion(null)}
              disabled={deletingVersion}
            >
              {t.cancel}
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => void removeVersion()}
              disabled={deletingVersion}
            >
              <Trash2 className="h-4 w-4" />
              {deletingVersion ? t.submitting : t.delete}
            </Button>
          </div>
        </div>
      </Dialog>
      </main>
    </div>
  );
}
