"use client";

import { Check, Eye, FileText, ImageDown, Users, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WrappedRadarTick } from "@/components/evaluation-category-report";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/lib/i18n/context";
import { useEscapeKey } from "@/lib/hooks/use-escape-key";
import {
  getPassingCriteria,
  getReportCategoryName,
} from "@/lib/reports/evaluation-report";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import type { EvaluationSummary } from "@/lib/types";

const filterSelectTriggerClass =
  "h-11 rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none transition hover:border-slate-300 hover:bg-white focus:ring-4 focus:ring-blue-100";
const filterSelectContentClass =
  "rounded-2xl border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl";

export default function EvaluationSummariesPage() {
  const { t } = useI18n();
  const [summaries, setSummaries] = useState<EvaluationSummary[]>([]);
  const [selected, setSelected] = useState<EvaluationSummary | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [filterEmployeeId, setFilterEmployeeId] = useState("");
  const [filterEvaluator, setFilterEvaluator] = useState("all");
  const [filterBuCode, setFilterBuCode] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filterOptions = useMemo(() => {
    const unique = (values: Array<string | undefined>) =>
      Array.from(
        new Set(values.filter((value): value is string => Boolean(value))),
      ).sort();

    return {
      buCodes: unique(summaries.map((summary) => summary.buCode)),
      departments: unique(summaries.map((summary) => summary.bu)),
      courses: unique(summaries.map((summary) => summary.topicName)),
      evaluators: Array.from(
        new Set(
          summaries.flatMap((summary) =>
            summary.evaluations
              .map((evaluation) => evaluation.evaluatorName)
              .filter(Boolean),
          ),
        ),
      ).sort(),
      years: unique(summaries.map((summary) => summary.evaluationYear))
        .sort()
        .reverse(),
    };
  }, [summaries]);

  const filteredSummaries = useMemo(
    () => {
      const matchingSummaries = summaries.filter((summary) => {
        if (
          filterEmployeeId &&
          !(summary.recipient?.employeeId ?? "")
            .toLowerCase()
            .includes(filterEmployeeId.trim().toLowerCase())
        )
          return false;
        if (filterBuCode !== "all" && summary.buCode !== filterBuCode)
          return false;
        if (filterDepartment !== "all" && summary.bu !== filterDepartment)
          return false;
        if (filterCourse !== "all" && summary.topicName !== filterCourse)
          return false;
        if (filterYear !== "all" && summary.evaluationYear !== filterYear)
          return false;
        if (filterResult !== "all" && summary.result !== filterResult)
          return false;
        if (
          filterEvaluator !== "all" &&
          !summary.evaluations.some(
            (evaluation) => evaluation.evaluatorName === filterEvaluator,
          )
        )
          return false;
        return true;
      });

      return matchingSummaries.sort(
        (left, right) =>
          right.evaluationRound - left.evaluationRound ||
          right.evaluationYear.localeCompare(left.evaluationYear),
      );
    },
    [
      summaries,
      filterEmployeeId,
      filterEvaluator,
      filterBuCode,
      filterDepartment,
      filterCourse,
      filterYear,
      filterResult,
    ],
  );

  async function exportSummaryPdf(summary: EvaluationSummary) {
    const response = await fetch(
      `/api/export/pdf?summaryId=${encodeURIComponent(summary.id)}`,
    );
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Unable to export the consolidated report.");
      return;
    }
    const blobUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `consolidated-evaluation-${summary.recipient?.employeeId ?? summary.recipientId}-${summary.evaluationYear}-round-${summary.evaluationRound}.pdf`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  }

  useEffect(() => {
    fetch("/api/evaluation-summaries")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error ?? "Unable to load consolidated results.");
        setSummaries(data);
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load consolidated results.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected && !comparisonOpen) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected, comparisonOpen]);

  useEffect(() => {
    if (!selectedIds.size || selected || comparisonOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIds(new Set());
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [comparisonOpen, selected, selectedIds.size]);

  const selectedSummaries = summaries.filter((summary) =>
    selectedIds.has(summary.id),
  );
  const allFilteredSelected =
    filteredSummaries.length > 0 &&
    filteredSummaries.every((summary) => selectedIds.has(summary.id));

  function toggleSummary(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllFiltered() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allFilteredSelected) {
        filteredSummaries.forEach((summary) => next.delete(summary.id));
      } else {
        filteredSummaries.forEach((summary) => next.add(summary.id));
      }
      return next;
    });
  }

  function clearSelectionWhenClickingEmptySpace(
    event: React.MouseEvent<HTMLDivElement>,
  ) {
    if (!selectedIds.size || selected || comparisonOpen) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, input, select, a")) return;
    setSelectedIds(new Set());
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div onMouseDown={clearSelectionWhenClickingEmptySpace}>
      {error ? (
        <Card className="p-5 text-sm font-semibold text-danger">{error}</Card>
      ) : summaries.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-400">
          {t.noData}
        </Card>
      ) : (
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">
              Selected {selectedIds.size} item
              {selectedIds.size === 1 ? "" : "s"}
            </p>
            <Button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={() => setComparisonOpen(true)}
            >
              <Eye className="h-4 w-4" />
              View selected results
            </Button>
          </div>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
            <Input
              className="rounded-2xl"
              placeholder={t.employeeId}
              value={filterEmployeeId}
              onChange={(event) => setFilterEmployeeId(event.target.value)}
            />
            <Select
              value={filterEvaluator}
              onValueChange={setFilterEvaluator}
            >
              <SelectTrigger aria-label={t.evaluatedBy} className={filterSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className={filterSelectContentClass}>
                <SelectItem value="all">{t.evaluatedBy}</SelectItem>
                {filterOptions.evaluators.map((evaluator) => (
                  <SelectItem key={evaluator} value={evaluator}>
                    {evaluator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterBuCode}
              onValueChange={setFilterBuCode}
            >
              <SelectTrigger aria-label="BU" className={filterSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className={filterSelectContentClass}>
                <SelectItem value="all">BU</SelectItem>
                {filterOptions.buCodes.map((buCode) => (
                  <SelectItem key={buCode} value={buCode}>
                    {buCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterDepartment}
              onValueChange={setFilterDepartment}
            >
              <SelectTrigger aria-label={t.department} className={filterSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className={filterSelectContentClass}>
                <SelectItem value="all">{t.department}</SelectItem>
                {filterOptions.departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterCourse}
              onValueChange={setFilterCourse}
            >
              <SelectTrigger aria-label={t.course} className={filterSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className={filterSelectContentClass}>
                <SelectItem value="all">{t.course}</SelectItem>
                {filterOptions.courses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterYear}
              onValueChange={setFilterYear}
            >
              <SelectTrigger aria-label={t.year} className={filterSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className={filterSelectContentClass}>
                <SelectItem value="all">{t.year}</SelectItem>
                {filterOptions.years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterResult}
              onValueChange={setFilterResult}
            >
              <SelectTrigger aria-label={t.result} className={filterSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className={filterSelectContentClass}>
                <SelectItem value="all">{t.result}</SelectItem>
                <SelectItem value="Pass">{t.pass}</SelectItem>
                <SelectItem value="Fail">{t.fail}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table className="min-w-[1180px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAllFiltered}
                    aria-label="Select all filtered results"
                    className="h-4 w-4 rounded border-slate-300 accent-primary"
                  />
                </TableHead>
                <TableHead>{t.employeeId}</TableHead>
                <TableHead>{t.name}</TableHead>
                <TableHead>BU</TableHead>
                <TableHead>{t.department}</TableHead>
                <TableHead>{t.course}</TableHead>
                <TableHead>{t.round}</TableHead>
                <TableHead>{t.year}</TableHead>
                <TableHead>{t.evaluator}</TableHead>
                <TableHead>{t.score}</TableHead>
                <TableHead>{t.result}</TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSummaries.map((summary) => (
                <TableRow
                  key={summary.id}
                  className={
                    summary.result === "Pass"
                      ? "bg-emerald-50/80 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/45"
                      : "bg-red-50/80 hover:bg-red-100/80 dark:bg-red-950/30 dark:hover:bg-red-950/45"
                  }
                >
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(summary.id)}
                      onChange={() => toggleSummary(summary.id)}
                      aria-label={`Select ${summary.recipient?.recipientName ?? summary.recipientId}`}
                      className="h-4 w-4 rounded border-slate-300 accent-primary"
                    />
                  </TableCell>
                  <TableCell className="font-bold tabular-nums">
                    {summary.recipient?.employeeId ?? "—"}
                  </TableCell>
                  <TableCell className="font-bold">
                    {summary.recipient?.recipientName ?? "—"}
                  </TableCell>
                  <TableCell>{summary.buCode ?? "—"}</TableCell>
                  <TableCell>{summary.bu}</TableCell>
                  <TableCell>{summary.topicName}</TableCell>
                  <TableCell className="font-bold tabular-nums">
                    {summary.evaluationRound}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {summary.evaluationYear}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-primary">
                      <Users className="h-3.5 w-3.5" /> {summary.evaluatorCount}
                    </span>
                  </TableCell>
                  <TableCell className="font-black tabular-nums">
                    {summary.totalScore.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      tone={summary.result === "Pass" ? "success" : "danger"}
                    >
                      {summary.result === "Pass" ? t.pass : t.fail}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelected(summary)}
                        className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-primary transition hover:bg-blue-100"
                        title={t.view}
                        aria-label={`${t.view}: ${summary.recipient?.recipientName ?? ""}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => exportSummaryPdf(summary)}
                        className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-100"
                        title={t.exportPdf}
                        aria-label={`${t.exportPdf}: ${summary.recipient?.recipientName ?? ""}`}
                      >
                        <FileText className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSummaries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="py-10 text-center text-slate-400"
                  >
                    {t.noData}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex touch-pan-y items-stretch justify-center overflow-y-scroll overscroll-contain bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          style={{ WebkitOverflowScrolling: "touch" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <SummaryModal summary={selected} onClose={() => setSelected(null)} />
        </div>
      )}

      {comparisonOpen && selectedSummaries.length > 0 && (
        <SummaryComparisonModal
          summaries={selectedSummaries}
          onClose={() => setComparisonOpen(false)}
        />
      )}
    </div>
  );
}

const COMPARISON_COLORS = [
  { stroke: "#0891b2", fill: "#67e8f9" },
  { stroke: "#9333ea", fill: "#d8b4fe" },
  { stroke: "#2563eb", fill: "#93c5fd" },
  { stroke: "#ea580c", fill: "#fdba74" },
  { stroke: "#16a34a", fill: "#86efac" },
  { stroke: "#db2777", fill: "#f9a8d4" },
];

function SummaryComparisonModal({
  summaries,
  onClose,
}: {
  summaries: EvaluationSummary[];
  onClose: () => void;
}) {
  useEscapeKey(onClose);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isSavingPng, setIsSavingPng] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  async function savePng() {
    const report = reportRef.current;
    if (!report || isSavingPng) return;

    setIsSavingPng(true);
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
      captureRoot.dataset.exportTheme = "light";
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
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => {
          if (value) resolve(value);
          else reject(new Error("Unable to create PNG"));
        }, "image/png");
      });
      const filename = `summary-result-comparison-${new Date().toISOString().slice(0, 10)}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      const canShareFile =
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare({ files: [file] }));

      if (canShareFile) {
        try {
          await navigator.share({
            files: [file],
            title: "Summary Result Comparison",
          });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError")
            return;
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
      setIsSavingPng(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 touch-pan-y overflow-y-scroll overscroll-contain bg-slate-950/60 p-0 backdrop-blur-sm sm:p-6"
      style={{ WebkitOverflowScrolling: "touch" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={reportRef}
        role="dialog"
        aria-modal="true"
        aria-label="Selected summary results"
        className="mx-auto min-h-[100dvh] w-full max-w-[1600px] overflow-hidden rounded-none border-0 bg-white shadow-2xl sm:min-h-0 sm:rounded-3xl sm:border sm:border-slate-200"
      >
        <div className="sticky top-0 z-10 flex flex-col gap-3 bg-slate-950 px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-5 md:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">
              Summary Result Comparison
            </p>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              {summaries.length} selected employees
            </h2>
          </div>
          <div
            className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto"
            data-html2canvas-ignore="true"
          >
            <button
              type="button"
              onClick={() => setShowDetails((current) => !current)}
              aria-expanded={showDetails}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-xs font-bold transition hover:bg-white/20"
            >
              <FileText className="h-4 w-4" />
              {showDetails ? "Hide detail" : "Detail"}
            </button>
            <button
              type="button"
              onClick={savePng}
              disabled={isSavingPng}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-xs font-bold transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
            >
              <ImageDown className="h-4 w-4" />
              {isSavingPng ? "Saving..." : "Save PNG"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Close comparison"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 bg-white p-3 sm:gap-5 sm:p-4 md:p-6 xl:grid-cols-2 2xl:grid-cols-3">
          {summaries.map((summary, index) => {
            const color = COMPARISON_COLORS[index % COMPARISON_COLORS.length];
            const radarData = summary.categorySummary.map((category) => ({
              ...category,
              reportName: getReportCategoryName(category),
            }));
            return (
              <section
                key={summary.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="border-b border-slate-200 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-xl font-black text-slate-950">
                        {summary.recipient?.recipientName ?? "—"}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {summary.recipient?.employeeId ?? "—"} ·{" "}
                        {summary.buCode ?? "—"}
                      </p>
                    </div>
                    <ComparisonResultStamp result={summary.result} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <ComparisonField
                      label="Score"
                      value={`${summary.totalScore.toFixed(2)} / 5`}
                    />
                    <ComparisonField
                      label="Percentage"
                      value={`${summary.percentage.toFixed(2)}%`}
                    />
                    <ComparisonField label="Course" value={summary.topicName} />
                    <ComparisonField
                      label="Round / Year"
                      value={`${summary.evaluationRound} / ${summary.evaluationYear}`}
                    />
                    <ComparisonField
                      label="Department"
                      value={summary.bu || "—"}
                    />
                    <ComparisonField
                      label="Evaluators"
                      value={String(summary.evaluatorCount)}
                    />
                  </dl>
                </div>

                <div className="h-[320px] p-2 sm:h-[390px] sm:p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={radarData}
                      outerRadius="58%"
                      margin={{ top: 34, right: 56, bottom: 34, left: 56 }}
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
                        fill={color.fill}
                        fillOpacity={0.5}
                        stroke={color.stroke}
                        strokeWidth={2.5}
                      />
                      <Tooltip
                        formatter={(value) => [
                          Number(value).toFixed(2),
                          "Average",
                        ]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {showDetails && (
                  <div className="border-t border-slate-200 p-4">
                    <div className="space-y-2">
                      {summary.categorySummary.map((category) => {
                        const criticalFailure =
                          category.isCritical && category.average < 3;
                        return (
                          <div
                            key={category.categoryId}
                            className="flex items-center justify-between gap-3 text-xs"
                          >
                            <span className="font-semibold text-slate-600">
                              {getReportCategoryName(category)}
                            </span>
                            <span
                              className={cn(
                                "font-black tabular-nums text-slate-950",
                                criticalFailure && "text-red-600",
                              )}
                            >
                              {category.average.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ComparisonField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 break-words font-bold text-slate-800">{value}</dd>
    </div>
  );
}

function ComparisonResultStamp({ result }: { result: "Pass" | "Fail" }) {
  const passed = result === "Pass";
  const color = passed ? "#16a34a" : "#dc2626";
  return (
    <svg
      viewBox="0 0 132 48"
      width="132"
      height="48"
      className={cn(
        "h-12 w-[132px] shrink-0 overflow-visible",
        passed ? "-rotate-6" : "rotate-6",
      )}
      role="img"
      aria-label={result}
    >
      <rect
        x="3"
        y="4"
        width="126"
        height="40"
        rx="5"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
      {passed && (
        <>
          <circle cx="22" cy="24" r="9" fill={color} />
          <path
            d="M17.5 24.2 21 27.5 26.8 20.8"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      <text
        x={passed ? 78 : 66}
        y="24"
        fill={color}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="16"
        fontWeight="900"
        letterSpacing="1.6"
      >
        {passed ? "PASSED" : "FAIL"}
      </text>
    </svg>
  );
}

function ReportResultStamp({ result }: { result: "Pass" | "Fail" }) {
  return (
    <img
      src={
        result === "Pass"
          ? "/result-stamps/passed.svg"
          : "/result-stamps/fail.svg"
      }
      alt={result}
      className="h-9 w-[112px] shrink-0 overflow-visible"
    />
  );
}

function SummaryModal({
  summary,
  onClose,
}: {
  summary: EvaluationSummary;
  onClose: () => void;
}) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isSavingPng, setIsSavingPng] = useState(false);
  useEscapeKey(onClose);

  async function savePng() {
    const report = reportRef.current;
    if (!report || isSavingPng) return;

    setIsSavingPng(true);
    let captureRoot: HTMLDivElement | undefined;
    try {
      const html2canvas = (await import("html2canvas")).default;
      // The visible modal is viewport-limited. Capture a full-height clone instead.
      captureRoot = report.cloneNode(true) as HTMLDivElement;
      captureRoot.style.position = "fixed";
      captureRoot.style.left = "-100000px";
      captureRoot.style.top = "0";
      captureRoot.style.width = `${Math.ceil(report.getBoundingClientRect().width)}px`;
      captureRoot.style.background = "#ffffff";
      captureRoot.dataset.exportTheme = "light";
      captureRoot.style.pointerEvents = "none";
      const clonedCard = captureRoot.querySelector<HTMLElement>(
        "#summary-evaluation-report",
      );
      if (!clonedCard)
        throw new Error("Unable to prepare summary for PNG export.");
      clonedCard.style.maxHeight = "none";
      clonedCard.style.overflow = "visible";
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
      const recipient = summary.recipient?.employeeId ?? summary.recipientId;
      link.download = `summary-evaluation-${recipient}-${summary.evaluationYear}-round-${summary.evaluationRound}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      captureRoot?.remove();
      setIsSavingPng(false);
    }
  }

  return (
    <div ref={reportRef}>
      <Card
        id="summary-evaluation-report"
        role="dialog"
        aria-modal="true"
        aria-label="Summary evaluation report"
        className="min-h-[100dvh] w-full max-w-6xl overscroll-contain overflow-y-auto touch-pan-y rounded-none border-0 bg-white p-0 shadow-2xl sm:min-h-0 sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="sticky top-0 z-10 flex flex-col gap-3 bg-slate-950 px-4 py-4 text-white sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-6 md:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">
              Evaluation Report
            </p>
            <h2 className="mt-2 break-words text-xl font-black tracking-tight sm:text-2xl md:text-3xl">
              Nanyang Trainer Certification Evaluation Form
            </h2>
          </div>
          <div
            className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto"
            data-html2canvas-ignore="true"
          >
            <button
              type="button"
              onClick={savePng}
              disabled={isSavingPng}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-xs font-bold transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
            >
              <ImageDown className="h-4 w-4" />
              {isSavingPng ? "Saving..." : "Save PNG"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Close summary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-5 bg-white p-4 text-slate-950 sm:space-y-8 sm:p-5 md:p-8">
          <dl className="grid gap-x-8 gap-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
            <ReportField
              label="Evaluation Recipient"
              value={summary.recipient?.recipientName ?? "—"}
            />
            <ReportField
              label="Employee ID"
              value={summary.recipient?.employeeId ?? summary.recipientId}
            />
            <ReportField
              label="Evaluation Topic"
              value={summary.topicName || "—"}
            />
            <ReportField
              label="Department / BU"
              value={`${summary.bu || "—"}${summary.buCode ? ` / ${summary.buCode}` : ""}`}
            />
            <ReportField
              label="Evaluator"
              value={`${summary.evaluatorCount} evaluator${summary.evaluatorCount === 1 ? "" : "s"}`}
            />
            <ReportField
              label="Date"
              value={summary.evaluations[0]?.evaluationDate ?? "—"}
            />
            <ReportField
              label="Round"
              value={String(summary.evaluationRound)}
            />
            <ReportField
              label="Final Result"
              value={summary.result}
              emphasize={summary.result === "Pass" ? "success" : "danger"}
            />
          </dl>

          <section>
            <h3 className="mb-4 text-lg font-black text-slate-950">
              Evaluation Summary
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-white text-left text-xs uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Evaluation Item</th>
                    <th className="px-4 py-3 text-center">Obtained Score</th>
                    <th className="px-4 py-3 text-center">Full Score</th>
                    <th className="px-4 py-3 text-center">Average (Max 5)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.categorySummary.map((category, index) => {
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
                          {getReportCategoryName(category)}
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
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {summary.categorySummary
                        .reduce(
                          (total, category) => total + category.actualScore,
                          0,
                        )
                        .toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {summary.categorySummary
                        .reduce(
                          (total, category) => total + category.fullScore,
                          0,
                        )
                        .toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-center">—</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td className="px-4 py-3">Overall Average</td>
                    <td colSpan={2} />
                    <td className="px-4 py-3 text-center text-lg tabular-nums">
                      {summary.totalScore.toFixed(2)} / 5
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
                  {getPassingCriteria(
                    summary.totalScore,
                    summary.categorySummary,
                  ).map((criterion) => (
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
                    <ReportCheckbox checked={summary.result === "Pass"} /> Pass
                  </div>
                  <div className="flex items-center gap-3 font-bold text-slate-800">
                    <ReportCheckbox checked={summary.result === "Fail"} /> Fail
                  </div>
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-lg font-black text-slate-950">Comments</h3>
                <p className="mt-3 min-h-20 border-b border-dashed border-slate-300 pb-3 text-sm leading-7 text-slate-700">
                  {summary.evaluations.find((evaluation) => evaluation.comment)
                    ?.comment || "No comment"}
                </p>
              </section>
            </div>
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-center text-lg font-black text-slate-950">
                Competency Profile
              </h3>
              <div className="mt-2 h-[320px] w-full sm:h-[390px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={summary.categorySummary.map((category) => ({
                      ...category,
                      reportName: getReportCategoryName(category),
                    }))}
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
                        "Average",
                      ]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-black">Individual Evaluations</h3>
            </div>
            <Table className="min-w-[680px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{"Evaluator"}</TableHead>
                  <TableHead>{"Date"}</TableHead>
                  <TableHead>{"Score"}</TableHead>
                  <TableHead>{"Percentage"}</TableHead>
                  <TableHead>{"Result"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.evaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell className="font-bold">
                      {evaluation.evaluatorName}
                    </TableCell>
                    <TableCell>{evaluation.evaluationDate}</TableCell>
                    <TableCell className="font-black tabular-nums">
                      {evaluation.totalScore.toFixed(2)}
                    </TableCell>
                    <TableCell>{evaluation.percentage}%</TableCell>
                    <TableCell className="align-middle text-center">
                      <ReportResultStamp result={evaluation.result} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </div>
      </Card>
    </div>
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
      aria-hidden="true"
    >
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  );
}
