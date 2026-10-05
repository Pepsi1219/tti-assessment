"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Pencil,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdminEvaluationActions } from "@/components/admin-evaluation-actions";
import { Dialog } from "@/components/ui/dialog";
import { WrappedRadarTick } from "@/components/evaluation-category-report";
import { Input } from "@/components/ui/input";
import { StandardSelect } from "@/components/ui/standard-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/lib/i18n/context";
import { getLocalizedQuestion } from "@/lib/i18n/question-content";
import {
  getPassingCriteria,
  getReportCategoryName,
} from "@/lib/reports/evaluation-report";
import { useEscapeKey } from "@/lib/hooks/use-escape-key";
import { cn } from "@/lib/utils";
import type {
  Category,
  EvaluationRecipient,
  EvaluationResult,
  EvaluationTopic,
  Evaluator,
  Question,
  QuestionAnswer,
} from "@/lib/types";

export default function EvaluationManagementPage() {
  const { t } = useI18n();
  const { setActions } = useAdminEvaluationActions();
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [filterEmployeeId, setFilterEmployeeId] = useState("");
  const [filterEvaluator, setFilterEvaluator] = useState<string>("all");
  const [filterBuCode, setFilterBuCode] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterResult, setFilterResult] = useState<string>("all");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<EvaluationResult | null>(null);
  const [editing, setEditing] = useState<EvaluationResult | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EvaluationResult | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  useEffect(() => {
    fetch("/api/evaluations")
      .then((res) => res.json())
      .then((data) => {
        setEvaluations(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selected) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  const filterOptions = useMemo(() => {
    const unique = (values: Array<string | undefined>) =>
      Array.from(
        new Set(values.filter((value): value is string => Boolean(value))),
      ).sort();

    return {
      buCodes: unique(evaluations.map((evaluation) => evaluation.buCode)),
      departments: unique(evaluations.map((evaluation) => evaluation.bu)),
      courses: unique(evaluations.map((evaluation) => evaluation.topicName)),
      evaluators: unique(
        evaluations.map((evaluation) => evaluation.evaluatorName),
      ),
      years: unique(
        evaluations.map((evaluation) => evaluation.evaluationDate?.slice(0, 4)),
      )
        .sort()
        .reverse(),
    };
  }, [evaluations]);

  const filtered = useMemo(() => {
    return evaluations.filter((ev) => {
      if (filterResult !== "all" && ev.result !== filterResult) return false;
      if (filterEvaluator !== "all" && ev.evaluatorName !== filterEvaluator)
        return false;
      if (filterBuCode !== "all" && ev.buCode !== filterBuCode) return false;
      if (filterDepartment !== "all" && ev.bu !== filterDepartment)
        return false;
      if (filterCourse !== "all" && ev.topicName !== filterCourse) return false;
      if (filterYear !== "all" && ev.evaluationDate.slice(0, 4) !== filterYear)
        return false;
      if (
        filterEmployeeId &&
        !(ev.recipient?.employeeId ?? "")
          .toLowerCase()
          .includes(filterEmployeeId.trim().toLowerCase())
      )
        return false;
      return true;
    }).sort(
      (left, right) =>
        right.evaluationDate.localeCompare(left.evaluationDate) ||
        right.createdAt.localeCompare(left.createdAt),
    );
  }, [
    evaluations,
    filterEmployeeId,
    filterEvaluator,
    filterBuCode,
    filterDepartment,
    filterCourse,
    filterYear,
    filterResult,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );
  const pageNumbers = useMemo(
    () => getPageNumbers(totalPages, page),
    [page, totalPages],
  );

  useEffect(() => {
    setPage(1);
  }, [
    filterEmployeeId,
    filterEvaluator,
    filterBuCode,
    filterDepartment,
    filterCourse,
    filterYear,
    filterResult,
    pageSize,
  ]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const exportExcel = useCallback(async () => {
    const res = await fetch("/api/export/excel");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nanyang-trainer-evaluations.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    setActions({
      openImport: () => setImportOpen(true),
      exportExcel,
    });
    return () => setActions(null);
  }, [exportExcel, setActions]);

  async function exportPdf(evaluationId?: string) {
    const url = evaluationId
      ? `/api/export/pdf?id=${evaluationId}`
      : "/api/export/pdf";
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "trainer-evaluation-report.pdf";
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  function showDetails(evaluation: EvaluationResult) {
    setSelected(evaluation);
  }

  async function deleteEvaluation() {
    if (!pendingDelete || deleting) return;

    setDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(
        `/api/evaluations?id=${encodeURIComponent(pendingDelete.id)}`,
        {
          method: "DELETE",
        },
      );
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok)
        throw new Error(data?.error || t.unableToDelete);

      setEvaluations((current) =>
        current.filter((evaluation) => evaluation.id !== pendingDelete.id),
      );
      setSelected((current) =>
        current?.id === pendingDelete.id ? null : current,
      );
      setPendingDelete(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : t.unableToDelete,
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          <Input
            className="rounded-2xl"
            placeholder={t.employeeId}
            value={filterEmployeeId}
            onChange={(event) => setFilterEmployeeId(event.target.value)}
          />
          <StandardSelect
            value={filterEvaluator}
            onValueChange={setFilterEvaluator}
            ariaLabel={t.evaluatedBy}
            options={[
              { value: "all", label: t.evaluatedBy },
              ...filterOptions.evaluators.map((evaluator) => ({
                value: evaluator,
                label: evaluator,
              })),
            ]}
          />
          <StandardSelect
            value={filterBuCode}
            onValueChange={setFilterBuCode}
            ariaLabel="BU"
            options={[
              { value: "all", label: "BU" },
              ...filterOptions.buCodes.map((buCode) => ({
                value: buCode,
                label: buCode,
              })),
            ]}
          />
          <StandardSelect
            value={filterDepartment}
            onValueChange={setFilterDepartment}
            ariaLabel={t.department}
            options={[
              { value: "all", label: t.department },
              ...filterOptions.departments.map((department) => ({
                value: department,
                label: department,
              })),
            ]}
          />
          <StandardSelect
            value={filterCourse}
            onValueChange={setFilterCourse}
            ariaLabel={t.course}
            options={[
              { value: "all", label: t.course },
              ...filterOptions.courses.map((course) => ({
                value: course,
                label: course,
              })),
            ]}
          />
          <StandardSelect
            value={filterYear}
            onValueChange={setFilterYear}
            ariaLabel={t.year}
            options={[
              { value: "all", label: t.year },
              ...filterOptions.years.map((year) => ({
                value: year,
                label: year,
              })),
            ]}
          />
          <StandardSelect
            value={filterResult}
            onValueChange={setFilterResult}
            ariaLabel={t.result}
            options={[
              { value: "all", label: t.result },
              { value: "Pass", label: t.pass },
              { value: "Fail", label: t.fail },
            ]}
          />
        </div>

        <Table className="min-w-[1520px] table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-px whitespace-nowrap">
                {t.employeeId}
              </TableHead>
              <TableHead className="min-w-44">{t.name}</TableHead>
              <TableHead className="w-px whitespace-nowrap">{t.bu}</TableHead>
              <TableHead className="min-w-36">{t.department}</TableHead>
              <TableHead className="min-w-52">{t.course}</TableHead>
              <TableHead className="w-px whitespace-nowrap">
                {t.round}
              </TableHead>
              <TableHead className="min-w-48">{t.evaluatedBy}</TableHead>
              <TableHead className="w-px whitespace-nowrap">{t.date}</TableHead>
              <TableHead className="w-px whitespace-nowrap">
                {t.score}
              </TableHead>
              <TableHead className="w-px whitespace-nowrap">
                {t.percentage}
              </TableHead>
              <TableHead className="w-px whitespace-nowrap">
                {t.result}
              </TableHead>
              <TableHead className="w-[192px] min-w-[192px] whitespace-nowrap text-center">
                {t.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((ev) => (
              <TableRow
                key={ev.id}
                className={cn(
                  ev.result === "Pass"
                    ? "bg-emerald-50/80 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/45"
                    : "bg-red-50/80 hover:bg-red-100/80 dark:bg-red-950/30 dark:hover:bg-red-950/45",
                  selected?.id === ev.id && "ring-1 ring-inset ring-primary/40",
                )}
              >
                <TableCell className="whitespace-nowrap font-bold tabular-nums">
                  {ev.recipient?.employeeId ?? "—"}
                </TableCell>
                <TableCell>
                  <p className="font-bold">
                    {ev.recipient?.recipientName ?? "—"}
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap font-bold">
                  {ev.buCode ?? "—"}
                </TableCell>
                <TableCell>{ev.bu || "—"}</TableCell>
                <TableCell>{ev.topicName || "—"}</TableCell>
                <TableCell className="whitespace-nowrap font-bold tabular-nums">
                  {ev.evaluationRound ?? "—"}
                </TableCell>
                <TableCell>{ev.evaluatorName}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {ev.evaluationDate}
                </TableCell>
                <TableCell className="whitespace-nowrap font-black">
                  {ev.totalScore.toFixed(2)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {ev.percentage}%
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge tone={ev.result === "Pass" ? "success" : "danger"}>
                    {ev.result === "Pass" ? t.pass : t.fail}
                  </Badge>
                </TableCell>
                <TableCell className="w-[192px] min-w-[192px]">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => showDetails(ev)}
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-xl transition",
                        selected?.id === ev.id
                          ? "bg-primary text-white shadow-sm"
                          : "bg-blue-50 text-primary hover:bg-blue-100",
                      )}
                      title={t.view}
                      aria-label={`${t.view}: ${ev.recipient?.recipientName ?? ""}`}
                      aria-controls="evaluation-report-dialog"
                      aria-expanded={selected?.id === ev.id}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(ev)}
                      className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700 transition hover:bg-amber-100 hover:text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-950"
                      title={t.edit}
                      aria-label={`${t.edit}: ${ev.recipient?.recipientName ?? ""}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => exportPdf(ev.id)}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      title={t.exportPdf}
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError("");
                        setPendingDelete(ev);
                      }}
                      className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950"
                      title={t.delete}
                      aria-label={`${t.delete}: ${ev.recipient?.recipientName ?? ""}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="py-8 text-center text-slate-400"
                >
                  {t.noData}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap">{t.rowsPerPage}</span>
            <StandardSelect
              aria-label={t.rowsPerPage}
              ariaLabel={t.rowsPerPage}
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
              className="h-9 w-20 rounded-xl px-3 text-sm font-bold"
              options={[25, 50, 100].map((size) => ({
                value: String(size),
                label: String(size),
              }))}
            />
            <span className="whitespace-nowrap">
              {filtered.length === 0
                ? "0"
                : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)}`}{" "}
              {t.of} {filtered.length}
            </span>
          </div>
          <nav aria-label={t.rowsPerPage} className="flex items-center gap-1">
            <button
              type="button"
              aria-label={t.previous}
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers.map((pageNumber, index) =>
              pageNumber === null ? (
                <span key={`ellipsis-${index}`} className="px-1 text-slate-400">
                  …
                </span>
              ) : (
                <button
                  key={pageNumber}
                  type="button"
                  aria-label={`${t.page} ${pageNumber}`}
                  aria-current={pageNumber === page ? "page" : undefined}
                  onClick={() => setPage(pageNumber)}
                  className={cn(
                    "grid h-9 min-w-9 place-items-center rounded-xl border px-2 font-bold transition",
                    pageNumber === page
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
                  )}
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label={t.next}
              disabled={page === totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </Card>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex touch-pan-y items-start justify-center overflow-y-scroll overscroll-contain bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          style={{ WebkitOverflowScrolling: "touch" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div
            id="evaluation-report-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t.evaluationReport}
            className="scrollbar-hide max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl overscroll-contain overflow-y-auto touch-pan-y rounded-3xl shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <EvaluationReport
              evaluation={selected}
              onClose={() => setSelected(null)}
            />
          </div>
        </div>
      )}

      <EditEvaluationDialog
        evaluation={editing}
        onClose={() => setEditing(null)}
        onUpdated={(updated) => {
          setEvaluations((current) =>
            current.map((evaluation) =>
              evaluation.id === updated.id ? updated : evaluation,
            ),
          );
          setSelected((current) =>
            current?.id === updated.id ? updated : current,
          );
          setEditing(null);
        }}
      />

      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
        title={t.confirmDelete}
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
            <p className="font-bold text-slate-950 dark:text-white">
              {pendingDelete?.recipient?.recipientName ?? "—"}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {pendingDelete?.topicName} · {t.round}{" "}
              {pendingDelete?.evaluationRound}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-red-700 dark:text-red-300">
              {t.deleteEvaluationWarning}
            </p>
          </div>
          {deleteError && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300"
            >
              {deleteError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
              className="touch-target rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <Button
              type="button"
              onClick={deleteEvaluation}
              disabled={deleting}
              className="rounded-xl bg-red-600 shadow-[0_12px_24px_rgba(220,38,38,0.22)] hover:bg-red-700"
            >
              <X className="h-4 w-4" />
              {deleting ? t.loading : t.delete}
            </Button>
          </div>
        </div>
      </Dialog>

      <ImportEvaluationDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={async () => {
          setImportOpen(false);
          const response = await fetch("/api/evaluations");
          if (response.ok) setEvaluations(await response.json());
        }}
      />
    </div>
  );
}

function getPageNumbers(
  totalPages: number,
  currentPage: number,
): Array<number | null> {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const ordered = Array.from(pages)
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((a, b) => a - b);
  const result: Array<number | null> = [];
  ordered.forEach((pageNumber, index) => {
    if (index > 0 && pageNumber - ordered[index - 1] > 1) result.push(null);
    result.push(pageNumber);
  });
  return result;
}

function EditEvaluationDialog({
  evaluation,
  onClose,
  onUpdated,
}: {
  evaluation: EvaluationResult | null;
  onClose: () => void;
  onUpdated: (evaluation: EvaluationResult) => void;
}) {
  const { t, locale } = useI18n();
  const [recipients, setRecipients] = useState<EvaluationRecipient[]>([]);
  const [topics, setTopics] = useState<EvaluationTopic[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [selectedBu, setSelectedBu] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [evaluatorEmployeeId, setEvaluatorEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [round, setRound] = useState("");
  const [comment, setComment] = useState("");
  const [categoryScores, setCategoryScores] = useState<Record<string, string>>(
    {},
  );
  const [roundPadOpen, setRoundPadOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!evaluation) return;
    setSelectedBu(evaluation.buCode ?? "");
    setRecipientId(evaluation.recipientId);
    setTopicId(evaluation.topicId);
    setEvaluatorEmployeeId(evaluation.evaluatorEmployeeId ?? "");
    setDate(evaluation.evaluationDate);
    setRound(String(evaluation.evaluationRound ?? ""));
    setComment(evaluation.comment ?? "");
    setCategoryScores(
      Object.fromEntries(
        evaluation.categorySummary.map((category) => [
          category.categoryId,
          String(category.actualScore),
        ]),
      ),
    );
    setError("");
    setRoundPadOpen(false);
  }, [evaluation]);

  useEffect(() => {
    if (!evaluation) return;
    let cancelled = false;
    void Promise.all([
      fetch("/api/recipients"),
      fetch("/api/topics"),
      fetch("/api/evaluators?includeInactive=1"),
    ])
      .then(async ([recipientResponse, topicResponse, evaluatorResponse]) => {
        if (!recipientResponse.ok || !topicResponse.ok || !evaluatorResponse.ok)
          throw new Error(t.unableToLoad);
        const [recipientData, topicData, evaluatorData] = await Promise.all([
          recipientResponse.json(),
          topicResponse.json(),
          evaluatorResponse.json(),
        ]);
        if (cancelled) return;
        setRecipients(recipientData);
        setTopics(topicData);
        setEvaluators(evaluatorData);
        if (!evaluation.evaluatorEmployeeId) {
          const matchingEvaluator = (
            evaluatorData as Array<{ name: string; employeeId: string }>
          ).find(
            (item) =>
              item.name.toLowerCase() ===
              evaluation.evaluatorName.toLowerCase(),
          );
          if (matchingEvaluator)
            setEvaluatorEmployeeId(matchingEvaluator.employeeId);
        }
      })
      .catch((reason) => {
        if (!cancelled)
          setError(
            reason instanceof Error
              ? reason.message
              : t.unableToLoad,
          );
      });
    return () => {
      cancelled = true;
    };
  }, [evaluation, t.unableToLoad]);

  if (!evaluation) return null;
  const currentEvaluation = evaluation;

  const availableBus = Array.from(
    new Set(recipients.map((recipient) => recipient.buCode ?? "")),
  )
    .filter(Boolean)
    .sort();
  const visibleRecipients = recipients.filter(
    (recipient) => !selectedBu || recipient.buCode === selectedBu,
  );

  async function save() {
    if (saving) return;
    const parsedRound = Number(round);
    const parsedScores = Object.fromEntries(
      currentEvaluation.categorySummary.map((category) => [
        category.categoryId,
        Number(categoryScores[category.categoryId]),
      ]),
    );
    const invalidCategory = currentEvaluation.categorySummary.find(
      (category) => {
        const score = parsedScores[category.categoryId];
        return (
          !Number.isFinite(score) || score < 0 || score > category.fullScore
        );
      },
    );
    if (
      !recipientId ||
      !topicId ||
      !evaluatorEmployeeId ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isInteger(parsedRound) ||
      parsedRound < 1 ||
      parsedRound > 99 ||
      invalidCategory
    ) {
      setError(
        invalidCategory
          ? `${getReportCategoryName(invalidCategory, locale)}: 0-${invalidCategory.fullScore}`
          : t.allFieldsRequired,
      );
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/evaluations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentEvaluation.id,
          recipientId,
          topicId,
          evaluatorEmployeeId,
          evaluationDate: date,
          evaluationRound: parsedRound,
          comment,
          categoryScores: parsedScores,
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        evaluation?: EvaluationResult;
        error?: string;
      } | null;
      if (!response.ok || !data?.evaluation)
        throw new Error(data?.error || t.unableToUpdate);

      const selectedRecipient = recipients.find(
        (recipient) => recipient.id === recipientId,
      );
      const selectedTopic = topics.find((topic) => topic.id === topicId);
      onUpdated({
        ...currentEvaluation,
        ...data.evaluation,
        recipient: selectedRecipient
          ? {
              ...currentEvaluation.recipient!,
              ...selectedRecipient,
            }
          : currentEvaluation.recipient,
        topic: selectedTopic
          ? { ...currentEvaluation.topic!, ...selectedTopic }
          : currentEvaluation.topic,
        details: currentEvaluation.details,
      });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : t.unableToUpdate,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog
        open
        onClose={() => {
          if (!saving) onClose();
        }}
        title={t.editEvaluation}
        className="max-w-3xl"
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">
              {t.bu}
              <Select
                value={selectedBu}
                onValueChange={(value) => {
                  setSelectedBu(value);
                  setRecipientId("");
                }}
              >
                <SelectTrigger className="mt-1 h-11">
                  <SelectValue placeholder={t.bu} />
                </SelectTrigger>
                <SelectContent>
                  {availableBus.map((bu) => (
                    <SelectItem key={bu} value={bu}>
                      {bu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="text-sm font-bold">
              {t.recipient}
              <Select value={recipientId} onValueChange={setRecipientId}>
                <SelectTrigger className="mt-1 h-11">
                  <SelectValue placeholder={t.selectRecipient} />
                </SelectTrigger>
                <SelectContent>
                  {visibleRecipients.map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      {recipient.employeeId} - {recipient.recipientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="text-sm font-bold">
              {t.evaluator}
              <Select
                value={evaluatorEmployeeId}
                onValueChange={setEvaluatorEmployeeId}
              >
                <SelectTrigger className="mt-1 h-11">
                  <SelectValue placeholder={t.selectEvaluator} />
                </SelectTrigger>
                <SelectContent>
                  {evaluators.map((evaluator) => (
                    <SelectItem key={evaluator.id} value={evaluator.employeeId}>
                      {evaluator.employeeId} - {evaluator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="text-sm font-bold">
              {t.course}
              <Select value={topicId} onValueChange={setTopicId}>
                <SelectTrigger className="mt-1 h-11">
                  <SelectValue placeholder={t.selectTopic} />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.topicName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="text-sm font-bold">
              {t.date}
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal text-slate-900 outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>
            <label className="text-sm font-bold">
              {t.round}
              <Button
                type="button"
                className="mt-1 h-11 w-full justify-between rounded-xl border border-slate-200 bg-white px-3 text-left font-normal text-slate-900 shadow-none hover:bg-slate-50 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                onClick={() => setRoundPadOpen(true)}
              >
                {round || t.selectRound}
                <span>⌄</span>
              </Button>
            </label>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 text-sm dark:border-slate-700">
            {evaluation.categorySummary.map((category, index) => (
              <div
                key={category.categoryId}
                className="grid grid-cols-[minmax(0,1fr)_minmax(120px,32%)] border-b border-slate-200 last:border-b-0 dark:border-slate-700"
              >
                <label
                  htmlFor={`edit-score-${category.categoryId}`}
                  className="flex min-w-0 items-center px-4 py-3 font-bold text-slate-800 dark:text-slate-100"
                >
                  {index + 1}. {getReportCategoryName(category, locale)}
                </label>
                <div className="border-l border-slate-200 px-3 py-2 dark:border-slate-700">
                  <input
                    id={`edit-score-${category.categoryId}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={category.fullScore}
                    step="any"
                    value={categoryScores[category.categoryId] ?? ""}
                    onChange={(event) =>
                      setCategoryScores((current) => ({
                        ...current,
                        [category.categoryId]: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-right font-bold tabular-nums text-slate-900 outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    aria-describedby={`edit-score-max-${category.categoryId}`}
                  />
                  <p
                    id={`edit-score-max-${category.categoryId}`}
                    className="mt-1 text-right text-[10px] font-semibold text-slate-400"
                  >
                    {t.maxScore} {category.fullScore}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <label className="block text-sm font-bold">
            {t.comment}
            <textarea
              rows={3}
              maxLength={5_000}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 font-normal text-slate-900 outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              disabled={saving}
              className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={onClose}
            >
              {t.cancel}
            </Button>
            <Button type="button" disabled={saving} onClick={save}>
              <Check className="h-4 w-4" />
              {saving ? t.saving : t.saveChanges}
            </Button>
          </div>
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
              className="h-14 rounded-xl border border-slate-200 bg-white text-lg font-black text-slate-900 transition hover:border-primary hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              onClick={() => {
                setRound(String(value));
                setRoundPadOpen(false);
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </Dialog>
    </>
  );
}

function ImportEvaluationDialog({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => Promise<void>;
}) {
  const { t, locale } = useI18n();
  const [recipients, setRecipients] = useState<
    Array<{
      id: string;
      employeeId: string;
      recipientName: string;
      buCode?: string;
      status?: string;
    }>
  >([]);
  const [topics, setTopics] = useState<
    Array<{ id: string; topicName: string }>
  >([]);
  const [importCategories, setImportCategories] = useState<Category[]>([]);
  const [evaluators, setEvaluators] = useState<
    Array<{ id: string; name: string; employeeId: string; status?: string }>
  >([]);
  const [selectedBu, setSelectedBu] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [evaluatorEmployeeId, setEvaluatorEmployeeId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [round, setRound] = useState("2");
  const [roundPadOpen, setRoundPadOpen] = useState(false);
  const [categoryScores, setCategoryScores] = useState<string[]>([]);
  const categoryLabels = importCategories.map((category) =>
    getReportCategoryName(
      {
        categoryId: category.id,
        categoryName: category.categoryName,
        isCritical: Boolean(category.isCritical),
      },
      locale,
    ),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    void Promise.all([
      fetch("/api/recipients"),
      fetch("/api/topics"),
      fetch("/api/evaluators"),
    ]).then(async ([recipientResponse, topicResponse, evaluatorResponse]) => {
      if (recipientResponse.ok) setRecipients(await recipientResponse.json());
      if (topicResponse.ok) setTopics(await topicResponse.json());
      if (evaluatorResponse.ok) setEvaluators(await evaluatorResponse.json());
    });
  }, [open]);

  async function selectImportTopic(value: string) {
    setTopicId(value);
    setImportCategories([]);
    setCategoryScores([]);
    setError("");
    if (!value) return;
    try {
      const response = await fetch(
        `/api/questions?topicId=${encodeURIComponent(value)}`,
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.unableToLoad);
      const nextCategories = data.categories as Category[];
      setImportCategories(nextCategories);
      setCategoryScores(Array(nextCategories.length).fill(""));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.unableToLoad);
    }
  }

  async function save() {
    if (saving) return;
    if (
      !recipientId ||
      !topicId ||
      !evaluatorEmployeeId.trim() ||
      !date ||
      !round ||
      !categoryScores.length ||
      categoryScores.some(
        (score) =>
          score.trim() === "" ||
          !Number.isFinite(Number(score)) ||
          Number(score) < 0,
      )
    ) {
      setError(t.allFieldsRequired);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/evaluations/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId,
          topicId,
          evaluationDate: date,
          evaluationRound: Number(round),
          evaluatorEmployeeId,
          categoryScores: categoryScores.map(Number),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.error || t.unableToSave);
      await onImported();
      setEvaluatorEmployeeId("");
      setCategoryScores(Array(importCategories.length).fill(""));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : t.unableToSave,
      );
    } finally {
      setSaving(false);
    }
  }

  const availableBus = Array.from(
    new Set(
      recipients
        .filter(
          (recipient) => !recipient.status || recipient.status === "Active",
        )
        .map((recipient) => recipient.buCode ?? ""),
    ),
  )
    .filter(Boolean)
    .sort();
  const visibleRecipients = recipients.filter(
    (recipient) =>
      (!recipient.status || recipient.status === "Active") &&
      (!selectedBu || (recipient.buCode ?? "") === selectedBu),
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={t.importResults}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            {t.importDescription}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-bold">
              {t.evaluator}
              <Select
                value={evaluatorEmployeeId}
                onValueChange={setEvaluatorEmployeeId}
              >
                <SelectTrigger className="mt-1 h-11">
                  <SelectValue placeholder={t.selectEvaluator} />
                </SelectTrigger>
                <SelectContent>
                  {evaluators
                    .filter(
                      (evaluator) =>
                        !evaluator.status || evaluator.status === "Active",
                    )
                    .map((evaluator) => (
                      <SelectItem
                        key={evaluator.id}
                        value={evaluator.employeeId}
                      >
                        {evaluator.employeeId} - {evaluator.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </label>
            <label className="text-sm font-bold">
              {t.bu}
              <Select
                value={selectedBu}
                onValueChange={(value) => {
                  setSelectedBu(value);
                  setRecipientId("");
                }}
              >
                <SelectTrigger className="mt-1 h-11">
                  <SelectValue placeholder={t.bu} />
                </SelectTrigger>
                <SelectContent>
                  {availableBus.map((bu) => (
                    <SelectItem key={bu} value={bu}>
                      {bu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="text-sm font-bold">
              {t.recipient}
              <Select value={recipientId} onValueChange={setRecipientId}>
                <SelectTrigger className="mt-1 h-11">
                  <SelectValue placeholder={t.selectRecipient} />
                </SelectTrigger>
                <SelectContent>
                  {visibleRecipients.map((recipient) => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      {recipient.employeeId} - {recipient.recipientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="text-sm font-bold">
              {t.course}
              <Select value={topicId} onValueChange={(value) => void selectImportTopic(value)}>
                <SelectTrigger className="mt-1 h-11">
                  <SelectValue placeholder={t.selectTopic} />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.topicName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="text-sm font-bold">
              {t.date}
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal"
              />
            </label>
            <label className="text-sm font-bold">
              {t.round}
              <Button
                type="button"
                className="mt-1 h-11 w-full justify-between rounded-xl border border-slate-200 bg-white px-3 text-left font-normal text-slate-900 shadow-none hover:bg-slate-50 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                onClick={() => setRoundPadOpen(true)}
              >
                {round || t.selectRound}
                <span>⌄</span>
              </Button>
            </label>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 text-sm">
            {categoryLabels.map((label, index) => (
              <div
                key={label}
                className="grid grid-cols-[minmax(0,1fr)_38%] border-b border-slate-200 last:border-b-0"
              >
                <label
                  htmlFor={`import-score-${index}`}
                  className="flex items-center px-4 py-3 font-bold text-slate-800"
                >
                  {index + 1}. {label}
                </label>
                <div className="border-l border-slate-200 px-3 py-2">
                  <input
                    id={`import-score-${index}`}
                    type="number"
                    min={0}
                    step="any"
                    value={categoryScores[index]}
                    onChange={(event) =>
                      setCategoryScores((current) =>
                        current.map((value, valueIndex) =>
                          valueIndex === index ? event.target.value : value,
                        ),
                      )
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal"
                  />
                </div>
              </div>
            ))}
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              onClick={onClose}
            >
              {t.cancel}
            </Button>
            <Button type="button" disabled={saving} onClick={save}>
              {saving ? t.saving : t.saveToFirestore}
            </Button>
          </div>
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
              className="h-14 rounded-xl border border-slate-200 bg-white text-lg font-black text-slate-900 hover:border-primary hover:bg-blue-50"
              onClick={() => {
                setRound(String(value));
                setRoundPadOpen(false);
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </Dialog>
    </>
  );
}

function EvaluationReport({
  evaluation,
  onClose,
}: {
  evaluation: EvaluationResult;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  useEscapeKey(onClose);
  const totalActual = evaluation.categorySummary.reduce(
    (sum, category) => sum + category.actualScore,
    0,
  );
  const totalFull = evaluation.categorySummary.reduce(
    (sum, category) => sum + category.fullScore,
    0,
  );
  const criteria = getPassingCriteria(
    evaluation.totalScore,
    evaluation.categorySummary,
    locale,
    evaluation.assessmentVersion,
  );
  const radarData = evaluation.categorySummary.map((category) => ({
    ...category,
    reportName: getReportCategoryName(category, locale),
  }));
  const answersByQuestion = new Map(
    evaluation.details
      .filter((detail) => detail.answer !== undefined)
      .map((detail) => [detail.questionId, detail.answer as QuestionAnswer]),
  );
  const responseRows = (evaluation.assessmentVersion?.questions ?? [])
    .filter((question) => answersByQuestion.has(question.id))
    .map((question) => ({
      question: getLocalizedQuestion(question, locale),
      answer: answersByQuestion.get(question.id)!,
    }));

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-xl shadow-slate-200/50">
      <div className="border-b border-slate-200 bg-slate-950 px-5 py-6 text-white md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">
              {t.evaluationReport}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
              {t.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label={t.closeReport}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-8 p-5 md:p-8">
        <dl className="grid gap-x-8 gap-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 xl:grid-cols-4">
          <ReportField
            label={t.recipient}
            value={evaluation.recipient?.recipientName ?? "—"}
          />
          <ReportField
            label={t.employeeId}
            value={evaluation.recipient?.employeeId ?? "—"}
          />
          <ReportField
            label={t.evaluationTopic}
            value={evaluation.topicName || "—"}
          />
          <ReportField
            label={`${t.department} / ${t.bu}`}
            value={`${evaluation.bu || "—"}${evaluation.buCode ? ` / ${evaluation.buCode}` : ""}`}
          />
          <ReportField label={t.evaluator} value={evaluation.evaluatorName} />
          <ReportField label={t.date} value={evaluation.evaluationDate} />
          <ReportField
            label={t.round}
            value={
              evaluation.evaluationRound
                ? String(evaluation.evaluationRound)
                : "—"
            }
          />
          <ReportField
            label={t.finalResult}
            value={evaluation.result === "Pass" ? t.pass : t.fail}
            emphasize={evaluation.result === "Pass" ? "success" : "danger"}
          />
        </dl>

        <section>
          <h3 className="mb-4 text-lg font-black text-slate-950">
            {t.categorySummary}
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="bg-white text-left text-xs uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-4 py-3">{t.evaluationItem}</th>
                  <th className="px-4 py-3 text-center">{t.obtainedScore}</th>
                  <th className="px-4 py-3 text-center">{t.fullScore}</th>
                  <th className="px-4 py-3 text-center">{t.averageMaxFive}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evaluation.categorySummary.map((category, index) => {
                  const criticalFailure =
                    category.isCritical && category.average < 3;
                  return (
                    <tr
                      key={category.categoryId}
                      className={
                        criticalFailure
                          ? "bg-red-50/70 dark:bg-slate-950"
                          : "bg-white dark:bg-slate-950"
                      }
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <span className="mr-3 text-slate-400">{index + 1}</span>
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
                    {evaluation.totalScore.toFixed(2)} / 5
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {responseRows.length > 0 && <section>
          <h3 className="mb-4 text-lg font-black text-slate-950">{t.responses}</h3>
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
            {responseRows.map(({ question, answer }) => (
              <div key={question.id} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <p className="text-sm font-semibold leading-6 text-slate-700">{question.questionText}</p>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">{formatQuestionAnswer(question, answer)}</p>
              </div>
            ))}
          </div>
        </section>}

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
                        criterion.passed ? "text-emerald-600" : "text-red-600",
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
                  <ReportCheckbox checked={evaluation.result === "Pass"} /> {t.pass}
                </div>
                <div className="flex items-center gap-3 font-bold text-slate-800">
                  <ReportCheckbox checked={evaluation.result === "Fail"} /> {t.fail}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-lg font-black text-slate-950">{t.comment}</h3>
              <p className="mt-3 min-h-20 whitespace-pre-wrap border-b border-dashed border-slate-300 pb-3 text-sm leading-7 text-slate-700">
                {evaluation.comment || t.noComment}
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
                    formatter={(value) => [Number(value).toFixed(2), t.average]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function formatQuestionAnswer(question: Question, answer: QuestionAnswer) {
  if (Array.isArray(answer))
    return question.answerType === "ranking"
      ? answer.map((item, index) => `${index + 1}. ${item}`).join("\n")
      : answer.join(", ");
  if (typeof answer === "object")
    return Object.entries(answer)
      .map(([index, value]) => `${question.statements?.[Number(index)] ?? Number(index) + 1}: ${question.options[value - 1] ?? value}`)
      .join("\n");
  if (typeof answer === "number")
    return question.answerType === "nps"
      ? `${answer}/10`
      : `${answer}${question.options[answer - 1] ? ` - ${question.options[answer - 1]}` : ""}`;
  return answer;
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
        "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border-2",
        checked
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-300 bg-white",
      )}
    >
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  );
}
