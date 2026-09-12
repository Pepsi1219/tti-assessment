"use client";

import { Check, Download, Eye, FileText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/lib/i18n/context";
import { getPassingCriteria, getReportCategoryName } from "@/lib/reports/evaluation-report";
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
  const [selected, setSelected] = useState<EvaluationResult | null>(null);
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected]);

  const filterOptions = useMemo(() => {
    const unique = (values: Array<string | undefined>) => Array.from(
      new Set(values.filter((value): value is string => Boolean(value))),
    ).sort();

    return {
      buCodes: unique(evaluations.map((evaluation) => evaluation.buCode)),
      departments: unique(evaluations.map((evaluation) => evaluation.bu)),
      courses: unique(evaluations.map((evaluation) => evaluation.topicName)),
      years: unique(evaluations.map((evaluation) => evaluation.evaluationDate?.slice(0, 4))).sort().reverse(),
    };
  }, [evaluations]);

  const filtered = useMemo(() => {
    return evaluations.filter((ev) => {
      if (filterResult !== "all" && ev.result !== filterResult) return false;
      if (filterBuCode !== "all" && ev.buCode !== filterBuCode) return false;
      if (filterDepartment !== "all" && ev.bu !== filterDepartment) return false;
      if (filterCourse !== "all" && ev.topicName !== filterCourse) return false;
      if (filterYear !== "all" && ev.evaluationDate.slice(0, 4) !== filterYear) return false;
      if (filterEmployeeId && !(ev.recipient?.employeeId ?? "").toLowerCase().includes(filterEmployeeId.trim().toLowerCase())) return false;
      return true;
    });
  }, [evaluations, filterEmployeeId, filterBuCode, filterDepartment, filterCourse, filterYear, filterResult]);

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
    const url = evaluationId ? `/api/export/pdf?id=${evaluationId}` : "/api/export/pdf";
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
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t.admin}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">{t.evaluationManagement}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportExcel}>
            <Download className="h-4 w-4" />
            {t.exportExcel}
          </Button>
          <Button className="bg-slate-950 hover:bg-slate-800" onClick={() => exportPdf()}>
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
            {filterOptions.buCodes.map((buCode) => <option key={buCode} value={buCode}>{buCode}</option>)}
          </select>
          <select
            className="touch-target w-full rounded-2xl border bg-white px-4 text-sm font-semibold outline-none"
            value={filterDepartment}
            onChange={(event) => setFilterDepartment(event.target.value)}
          >
            <option value="all">{t.all} {t.department}</option>
            {filterOptions.departments.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
          <select
            className="touch-target w-full rounded-2xl border bg-white px-4 text-sm font-semibold outline-none"
            value={filterCourse}
            onChange={(event) => setFilterCourse(event.target.value)}
          >
            <option value="all">{t.all} {t.course}</option>
            {filterOptions.courses.map((course) => <option key={course} value={course}>{course}</option>)}
          </select>
          <select
            className="touch-target w-full rounded-2xl border bg-white px-4 text-sm font-semibold outline-none"
            value={filterYear}
            onChange={(event) => setFilterYear(event.target.value)}
          >
            <option value="all">{t.all} {t.year}</option>
            {filterOptions.years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <select
            className="touch-target w-full rounded-2xl border bg-white px-4 text-sm font-semibold outline-none"
            value={filterResult}
            onChange={(event) => setFilterResult(event.target.value)}
          >
            <option value="all">{t.all} {t.result}</option>
            <option value="Pass">{t.pass}</option>
            <option value="Fail">{t.fail}</option>
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.employeeId}</TableHead>
              <TableHead>{t.name}</TableHead>
              <TableHead>BU</TableHead>
              <TableHead>{t.department}</TableHead>
              <TableHead>{t.course}</TableHead>
              <TableHead>{t.round}</TableHead>
              <TableHead>{t.evaluatedBy}</TableHead>
              <TableHead>{t.date}</TableHead>
              <TableHead>{t.score}</TableHead>
              <TableHead>{t.percentage}</TableHead>
              <TableHead>{t.result}</TableHead>
              <TableHead className="text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ev) => (
              <TableRow key={ev.id} className={selected?.id === ev.id ? "bg-blue-50/50" : ""}>
                <TableCell className="font-bold tabular-nums">{ev.recipient?.employeeId ?? "—"}</TableCell>
                <TableCell>
                  <p className="font-bold">{ev.recipient?.recipientName ?? "—"}</p>
                </TableCell>
                <TableCell className="font-bold">{ev.buCode ?? "—"}</TableCell>
                <TableCell>{ev.bu || "—"}</TableCell>
                <TableCell>{ev.topicName || "—"}</TableCell>
                <TableCell className="font-bold tabular-nums">{ev.evaluationRound ?? "—"}</TableCell>
                <TableCell>{ev.evaluatorName}</TableCell>
                <TableCell>{ev.evaluationDate}</TableCell>
                <TableCell className="font-black">{ev.totalScore.toFixed(2)}</TableCell>
                <TableCell>{ev.percentage}%</TableCell>
                <TableCell>
                  <Badge tone={ev.result === "Pass" ? "success" : "danger"}>
                    {ev.result === "Pass" ? t.pass : t.fail}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => showDetails(ev)}
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-xl transition",
                        selected?.id === ev.id
                          ? "bg-primary text-white shadow-sm"
                          : "bg-blue-50 text-primary hover:bg-blue-100"
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
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-100"
                      title={t.exportPdf}
                    >
                      <FileText className="h-4 w-4 text-slate-500" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="py-8 text-center text-slate-400">{t.noData}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
            <EvaluationReport evaluation={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function EvaluationReport({ evaluation, onClose }: { evaluation: EvaluationResult; onClose: () => void }) {
  const totalActual = evaluation.categorySummary.reduce((sum, category) => sum + category.actualScore, 0);
  const totalFull = evaluation.categorySummary.reduce((sum, category) => sum + category.fullScore, 0);
  const criteria = getPassingCriteria(evaluation.totalScore, evaluation.categorySummary);
  const radarData = evaluation.categorySummary.map((category) => ({
    ...category,
    reportName: getReportCategoryName(category),
  }));

  return (
    <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-xl shadow-slate-200/50">
      <div className="border-b border-slate-200 bg-slate-950 px-5 py-6 text-white md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-300">Evaluation Report</p>
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
          <ReportField label="Evaluation Recipient" value={evaluation.recipient?.recipientName ?? "—"} />
          <ReportField label="Employee ID" value={evaluation.recipient?.employeeId ?? "—"} />
          <ReportField label="Evaluation Topic" value={evaluation.topicName || "—"} />
          <ReportField label="Department / BU" value={`${evaluation.bu || "—"}${evaluation.buCode ? ` / ${evaluation.buCode}` : ""}`} />
          <ReportField label="Evaluator" value={evaluation.evaluatorName} />
          <ReportField label="Date" value={evaluation.evaluationDate} />
          <ReportField label="Round" value={evaluation.evaluationRound ? String(evaluation.evaluationRound) : "—"} />
          <ReportField label="Final Result" value={evaluation.result} emphasize={evaluation.result === "Pass" ? "success" : "danger"} />
        </dl>

        <section>
          <h3 className="mb-4 text-lg font-black text-slate-950">Evaluation Summary</h3>
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
                  const criticalFailure = category.isCritical && category.average < 3;
                  return (
                    <tr key={category.categoryId} className={criticalFailure ? "bg-red-50/70" : "bg-white"}>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <span className="mr-3 text-slate-400">{index + 1}</span>
                        {getReportCategoryName(category)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{category.actualScore.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{category.fullScore.toFixed(0)}</td>
                      <td className={cn("px-4 py-3 text-right font-black tabular-nums", criticalFailure && "text-red-600")}>
                        {category.average.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-black text-slate-950">
                <tr>
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totalActual.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totalFull.toFixed(0)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">—</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-3">Overall Average</td>
                  <td colSpan={2} />
                  <td className="px-4 py-3 text-right text-lg tabular-nums">{evaluation.totalScore.toFixed(2)} / 5</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-lg font-black text-slate-950">Passing Criteria</h3>
              <div className="mt-4 space-y-3">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="flex items-start gap-3 text-sm">
                    <ReportCheckbox checked={criterion.passed} />
                    <p className="flex-1 leading-6 text-slate-700">{criterion.label}</p>
                    <span className={cn("font-black tabular-nums", criterion.passed ? "text-emerald-600" : "text-red-600")}>
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
            <h3 className="text-center text-lg font-black text-slate-950">Competency Profile</h3>
            <div className="mt-2 h-[390px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="66%">
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="reportName" tick={{ fontSize: 10, fill: "#475569" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} tick={{ fontSize: 9, fill: "#64748b" }} />
                  <Radar dataKey="average" fill="#22c55e" fillOpacity={0.42} stroke="#16a34a" strokeWidth={2} />
                  <Tooltip formatter={(value) => [Number(value).toFixed(2), "Average"]} />
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
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className={cn(
        "mt-1 font-bold text-slate-900",
        emphasize === "success" && "text-emerald-600",
        emphasize === "danger" && "text-red-600",
      )}>
        {value}
      </dd>
    </div>
  );
}

function ReportCheckbox({ checked }: { checked: boolean }) {
  return (
    <span className={cn(
      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border-2",
      checked ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white",
    )}>
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  );
}
