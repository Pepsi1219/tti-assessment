"use client";

import { Award, Eye, FileText, ImageDown, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/lib/i18n/context";
import { getReportCategoryName } from "@/lib/reports/evaluation-report";
import { cn } from "@/lib/utils";
import type { EvaluationSummary } from "@/lib/types";

export default function EvaluationSummariesPage() {
  const { t } = useI18n();
  const [summaries, setSummaries] = useState<EvaluationSummary[]>([]);
  const [selected, setSelected] = useState<EvaluationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function exportSummaryPdf(summary: EvaluationSummary) {
    const response = await fetch(`/api/export/pdf?summaryId=${encodeURIComponent(summary.id)}`);
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
        if (!response.ok) throw new Error(data.error ?? "Unable to load consolidated results.");
        setSummaries(data);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load consolidated results."))
      .finally(() => setLoading(false));
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

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t.admin}</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight">{t.evaluationSummaries}</h1>
      </div>

      {error ? (
        <Card className="p-5 text-sm font-semibold text-danger">{error}</Card>
      ) : summaries.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-400">{t.noData}</Card>
      ) : (
        <Card className="p-5">
          <Table className="min-w-[1180px]">
            <TableHeader>
              <TableRow>
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
              {summaries.map((summary) => (
                <TableRow key={summary.id}>
                  <TableCell className="font-bold tabular-nums">{summary.recipient?.employeeId ?? "—"}</TableCell>
                  <TableCell className="font-bold">{summary.recipient?.recipientName ?? "—"}</TableCell>
                  <TableCell>{summary.buCode ?? "—"}</TableCell>
                  <TableCell>{summary.bu}</TableCell>
                  <TableCell>{summary.topicName}</TableCell>
                  <TableCell className="font-bold tabular-nums">{summary.evaluationRound}</TableCell>
                  <TableCell className="tabular-nums">{summary.evaluationYear}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-primary">
                      <Users className="h-3.5 w-3.5" /> {summary.evaluatorCount}
                    </span>
                  </TableCell>
                  <TableCell className="font-black tabular-nums">{summary.totalScore.toFixed(2)}</TableCell>
                  <TableCell><Badge tone={summary.result === "Pass" ? "success" : "danger"}>{summary.result === "Pass" ? t.pass : t.fail}</Badge></TableCell>
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
            </TableBody>
          </Table>
        </Card>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <SummaryModal summary={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}

function SummaryModal({ summary, onClose }: { summary: EvaluationSummary; onClose: () => void }) {
  const radarData = summary.categorySummary.map((category) => ({ ...category, reportName: getReportCategoryName(category) }));
  const reportRef = useRef<HTMLDivElement>(null);
  const [isSavingPng, setIsSavingPng] = useState(false);

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
      captureRoot.style.pointerEvents = "none";
      const clonedCard = captureRoot.querySelector<HTMLElement>("#summary-evaluation-report");
      if (!clonedCard) throw new Error("Unable to prepare summary for PNG export.");
      clonedCard.style.maxHeight = "none";
      clonedCard.style.overflow = "visible";
      captureRoot.querySelectorAll("[data-html2canvas-ignore]").forEach((element) => element.remove());
      document.body.appendChild(captureRoot);
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

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
    <Card id="summary-evaluation-report" role="dialog" aria-modal="true" aria-label="Summary evaluation report" className="max-h-[calc(100vh-1.5rem)] w-full max-w-6xl overflow-y-auto rounded-3xl border-0 bg-white p-0 shadow-2xl sm:max-h-[calc(100vh-3rem)]">
      <div className="flex items-start justify-between gap-4 bg-slate-950 px-5 py-6 text-white md:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">Summary Evaluation</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{summary.recipient?.recipientName ?? "—"}</h2>
          <p className="mt-1 text-sm text-slate-300">{summary.topicName} · {summary.evaluationYear} · Round {summary.evaluationRound}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2" data-html2canvas-ignore="true">
          <button
            type="button"
            onClick={savePng}
            disabled={isSavingPng}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-xs font-bold transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
          >
            <ImageDown className="h-4 w-4" />
            {isSavingPng ? "Saving..." : "Save PNG"}
          </button>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20" aria-label="Close summary">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-6 bg-white p-5 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryTile label="Employee ID" value={summary.recipient?.employeeId ?? "—"} />
          <SummaryTile label="Evaluators" value={String(summary.evaluatorCount)} icon={<Users className="h-4 w-4" />} />
          <SummaryTile label="Score" value={`${summary.totalScore.toFixed(2)} / 5`} icon={<Award className="h-4 w-4" />} />
          <SummaryTile label="Percentage" value={`${summary.percentage.toFixed(2)}%`} />
          <SummaryTile label="Result" value={summary.result} result={summary.result} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-center text-lg font-black">Combined Competency Profile</h3>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="67%">
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="reportName" tick={{ fontSize: 10, fill: "#475569" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} tick={{ fontSize: 9, fill: "#64748b" }} />
                  <Radar dataKey="average" fill="#2563EB" fillOpacity={0.35} stroke="#2563EB" strokeWidth={2} />
                  <Tooltip formatter={(value) => [Number(value).toFixed(2), "Average"]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-5">
            <h3 className="text-lg font-black">Combined Category Scores</h3>
            <div className="mt-4 space-y-3">
              {summary.categorySummary.map((category) => {
                const criticalFailure = category.isCritical && category.average < 3;
                return (
                  <div key={category.categoryId}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-slate-700">{getReportCategoryName(category)}</span>
                      <span className={cn("font-black tabular-nums", criticalFailure ? "text-danger" : "text-primary")}>{category.average.toFixed(2)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200"><div className={cn("h-2 rounded-full", criticalFailure ? "bg-danger" : "bg-primary")} style={{ width: `${(category.average / 5) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-black">Individual Evaluations</h3>
            <span className="text-sm text-slate-500">Each evaluator has equal weight in the combined score.</span>
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
                  <TableCell className="font-bold">{evaluation.evaluatorName}</TableCell>
                  <TableCell>{evaluation.evaluationDate}</TableCell>
                  <TableCell className="font-black tabular-nums">{evaluation.totalScore.toFixed(2)}</TableCell>
                  <TableCell>{evaluation.percentage}%</TableCell>
                  <TableCell><Badge tone={evaluation.result === "Pass" ? "success" : "danger"}>{evaluation.result}</Badge></TableCell>
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

function SummaryTile({ label, value, icon, result }: { label: string; value: string; icon?: React.ReactNode; result?: "Pass" | "Fail" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">{icon}{label}</p>
      <p className={cn("mt-2 text-2xl font-black", result === "Pass" && "text-success", result === "Fail" && "text-danger")}>{value}</p>
    </div>
  );
}
