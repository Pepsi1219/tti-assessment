"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/lib/i18n/context";
import {
  getPassingCriteria,
  getReportCategoryName,
} from "@/lib/reports/evaluation-report";
import { useEscapeKey } from "@/lib/hooks/use-escape-key";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/types";

export default function EvaluationManagementPage() {
  const { t } = useI18n();
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [filterEmployeeId, setFilterEmployeeId] = useState("");
  const [filterBuCode, setFilterBuCode] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterResult, setFilterResult] = useState<string>("all");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<EvaluationResult | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EvaluationResult | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [loading, setLoading] = useState(true);
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
    });
  }, [
    evaluations,
    filterEmployeeId,
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

  async function exportExcel() {
    const res = await fetch("/api/export/excel");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nanyang-trainer-evaluations.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

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
        throw new Error(data?.error || "Unable to delete evaluation");

      setEvaluations((current) =>
        current.filter((evaluation) => evaluation.id !== pendingDelete.id),
      );
      setSelected((current) =>
        current?.id === pendingDelete.id ? null : current,
      );
      setPendingDelete(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Unable to delete evaluation",
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            {t.admin}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">Result</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportExcel}>
            <Download className="h-4 w-4" />
            {t.exportExcel}
          </Button>
          <Button
            className="bg-slate-950 hover:bg-slate-800"
            onClick={() => exportPdf()}
          >
            <FileText className="h-4 w-4" />
            {t.exportPdf}
          </Button>
        </div>
      </div>

      <Card className="p-5">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Input
            className="rounded-2xl"
            placeholder={t.employeeId}
            value={filterEmployeeId}
            onChange={(event) => setFilterEmployeeId(event.target.value)}
          />
          <select
            className="touch-target w-full rounded-2xl border bg-white px-4 text-sm font-semibold outline-none"
            value={filterBuCode}
            onChange={(event) => setFilterBuCode(event.target.value)}
          >
            <option value="all">{t.all} BU</option>
            {filterOptions.buCodes.map((buCode) => (
              <option key={buCode} value={buCode}>
                {buCode}
              </option>
            ))}
          </select>
          <select
            className="touch-target w-full rounded-2xl border bg-white px-4 text-sm font-semibold outline-none"
            value={filterDepartment}
            onChange={(event) => setFilterDepartment(event.target.value)}
          >
            <option value="all">
              {t.all} {t.department}
            </option>
            {filterOptions.departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
          <select
            className="touch-target w-full rounded-2xl border bg-white px-4 text-sm font-semibold outline-none"
            value={filterCourse}
            onChange={(event) => setFilterCourse(event.target.value)}
          >
            <option value="all">
              {t.all} {t.course}
            </option>
            {filterOptions.courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
          <select
            className="touch-target w-full rounded-2xl border bg-white px-4 text-sm font-semibold outline-none"
            value={filterYear}
            onChange={(event) => setFilterYear(event.target.value)}
          >
            <option value="all">
              {t.all} {t.year}
            </option>
            {filterOptions.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            className="touch-target w-full rounded-2xl border bg-white px-4 text-sm font-semibold outline-none"
            value={filterResult}
            onChange={(event) => setFilterResult(event.target.value)}
          >
            <option value="all">
              {t.all} {t.result}
            </option>
            <option value="Pass">{t.pass}</option>
            <option value="Fail">{t.fail}</option>
          </select>
        </div>

        <Table className="min-w-[1520px] table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-px whitespace-nowrap">
                {t.employeeId}
              </TableHead>
              <TableHead className="min-w-44">{t.name}</TableHead>
              <TableHead className="w-px whitespace-nowrap">BU</TableHead>
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
              <TableHead className="w-[148px] min-w-[148px] whitespace-nowrap text-center">
                {t.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((ev) => (
              <TableRow
                key={ev.id}
                className={selected?.id === ev.id ? "bg-blue-50/50" : ""}
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
                <TableCell className="w-[148px] min-w-[148px]">
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
            <select
              aria-label={t.rowsPerPage}
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {[25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="whitespace-nowrap">
              {filtered.length === 0
                ? "0"
                : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)}`}{" "}
              {t.of} {filtered.length}
            </span>
          </div>
          <nav aria-label="Pagination" className="flex items-center gap-1">
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
                  aria-label={`Page ${pageNumber}`}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div
            id="evaluation-report-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Evaluation report"
            className="max-h-[calc(100vh-1.5rem)] w-full max-w-6xl overflow-y-auto rounded-3xl shadow-2xl sm:max-h-[calc(100vh-3rem)]"
          >
            <EvaluationReport
              evaluation={selected}
              onClose={() => setSelected(null)}
            />
          </div>
        </div>
      )}

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

function EvaluationReport({
  evaluation,
  onClose,
}: {
  evaluation: EvaluationResult;
  onClose: () => void;
}) {
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
  );
  const radarData = evaluation.categorySummary.map((category) => ({
    ...category,
    reportName: getReportCategoryName(category),
  }));

  return (
    <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-xl shadow-slate-200/50">
      <div className="border-b border-slate-200 bg-slate-950 px-5 py-6 text-white md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">
              Evaluation Report
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
              Nanyang Trainer Certification Evaluation Form
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close report"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-8 p-5 md:p-8">
        <dl className="grid gap-x-8 gap-y-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <ReportField
            label="Evaluation Recipient"
            value={evaluation.recipient?.recipientName ?? "—"}
          />
          <ReportField
            label="Employee ID"
            value={evaluation.recipient?.employeeId ?? "—"}
          />
          <ReportField
            label="Evaluation Topic"
            value={evaluation.topicName || "—"}
          />
          <ReportField
            label="Department / BU"
            value={`${evaluation.bu || "—"}${evaluation.buCode ? ` / ${evaluation.buCode}` : ""}`}
          />
          <ReportField label="Evaluator" value={evaluation.evaluatorName} />
          <ReportField label="Date" value={evaluation.evaluationDate} />
          <ReportField
            label="Round"
            value={
              evaluation.evaluationRound
                ? String(evaluation.evaluationRound)
                : "—"
            }
          />
          <ReportField
            label="Final Result"
            value={evaluation.result}
            emphasize={evaluation.result === "Pass" ? "success" : "danger"}
          />
        </dl>

        <section>
          <h3 className="mb-4 text-lg font-black text-slate-950">
            Evaluation Summary
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-4 py-3">Evaluation Item</th>
                  <th className="px-4 py-3 text-right">Obtained Score</th>
                  <th className="px-4 py-3 text-right">Full Score</th>
                  <th className="px-4 py-3 text-right">Average (Max 5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evaluation.categorySummary.map((category, index) => {
                  const criticalFailure =
                    category.isCritical && category.average < 3;
                  return (
                    <tr
                      key={category.categoryId}
                      className={criticalFailure ? "bg-red-50/70" : "bg-white"}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <span className="mr-3 text-slate-400">{index + 1}</span>
                        {getReportCategoryName(category)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {category.actualScore.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {category.fullScore.toFixed(0)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-black tabular-nums",
                          criticalFailure && "text-red-600",
                        )}
                      >
                        {category.average.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-black text-slate-950">
                <tr>
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {totalActual.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {totalFull.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">—</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-3">Overall Average</td>
                  <td colSpan={2} />
                  <td className="px-4 py-3 text-right text-lg tabular-nums">
                    {evaluation.totalScore.toFixed(2)} / 5
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
                Passing Criteria
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
                      {criterion.actual.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-lg font-black text-slate-950">Result</h3>
              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                <div className="flex items-center gap-3 font-bold text-slate-800">
                  <ReportCheckbox checked={evaluation.result === "Pass"} /> Pass
                </div>
                <div className="flex items-center gap-3 font-bold text-slate-800">
                  <ReportCheckbox checked={evaluation.result === "Fail"} /> Fail
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-lg font-black text-slate-950">Comments</h3>
              <p className="mt-3 min-h-20 whitespace-pre-wrap border-b border-dashed border-slate-300 pb-3 text-sm leading-7 text-slate-700">
                {evaluation.comment || "No comment"}
              </p>
            </section>
          </div>

          <section className="rounded-2xl bg-slate-50 p-4">
            <h3 className="text-center text-lg font-black text-slate-950">
              Competency Profile
            </h3>
            <div className="mt-2 h-[390px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="66%">
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis
                    dataKey="reportName"
                    tick={{ fontSize: 10, fill: "#475569" }}
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
                    formatter={(value) => [Number(value).toFixed(2), "Average"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </Card>
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
