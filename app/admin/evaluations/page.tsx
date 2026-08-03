"use client";

import { Download, Eye, FileText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/types";

export default function EvaluationManagementPage() {
  const { t } = useI18n();
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [query, setQuery] = useState("");
  const [filterResult, setFilterResult] = useState<string>("all");
  const [filterBu, setFilterBu] = useState<string>("all");
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

  const buOptions = useMemo(() => {
    const bus = new Set(evaluations.map((e) => e.bu));
    return Array.from(bus).sort();
  }, [evaluations]);

  const filtered = useMemo(() => {
    return evaluations.filter((ev) => {
      if (filterResult !== "all" && ev.result !== filterResult) return false;
      if (filterBu !== "all" && ev.bu !== filterBu) return false;
      if (query) {
        const text = query.toLowerCase();
        return [ev.trainer?.trainerName, ev.trainer?.employeeId, ev.evaluatorName, ev.bu, ev.evaluationDate]
          .join(" ")
          .toLowerCase()
          .includes(text);
      }
      return true;
    });
  }, [evaluations, query, filterResult, filterBu]);

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
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input className="rounded-2xl pl-11" placeholder={t.search} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select
            className="touch-target rounded-2xl border px-4 text-sm font-semibold outline-none"
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
          >
            <option value="all">{t.all} {t.result}</option>
            <option value="Pass">{t.pass}</option>
            <option value="Fail">{t.fail}</option>
          </select>
          <select
            className="touch-target rounded-2xl border px-4 text-sm font-semibold outline-none"
            value={filterBu}
            onChange={(e) => setFilterBu(e.target.value)}
          >
            <option value="all">{t.all} {t.bu}</option>
            {buOptions.map((bu) => (
              <option key={bu} value={bu}>{bu}</option>
            ))}
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.trainer}</TableHead>
              <TableHead>{t.evaluatedBy}</TableHead>
              <TableHead>{t.bu}</TableHead>
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
                <TableCell>
                  <div>
                    <p className="font-bold">{ev.trainer?.trainerName ?? "—"}</p>
                    <p className="text-xs text-slate-400">{ev.trainer?.employeeId}</p>
                  </div>
                </TableCell>
                <TableCell>{ev.evaluatorName}</TableCell>
                <TableCell>{ev.bu}</TableCell>
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
                      onClick={() => setSelected(selected?.id === ev.id ? null : ev)}
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-blue-50"
                      title={t.view}
                    >
                      <Eye className="h-4 w-4 text-primary" />
                    </button>
                    <button
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
                <TableCell colSpan={8} className="py-8 text-center text-slate-400">{t.noData}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {selected && (
        <Card className="space-y-5 p-5 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t.resultReport}</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">{selected.trainer?.trainerName}</h2>
              <p className="mt-1 text-sm text-slate-500">{selected.evaluationDate} · {t.evaluatedBy}: {selected.evaluatorName}</p>
            </div>
            <Badge tone={selected.result === "Pass" ? "success" : "danger"}>
              {selected.result === "Pass" ? t.pass : t.fail}
            </Badge>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="h-80 rounded-[28px] bg-white/70 p-3">
              <ResponsiveContainer>
                <RadarChart data={selected.categorySummary}>
                  <PolarGrid stroke="#dbe3ef" />
                  <PolarAngleAxis dataKey="categoryName" tick={{ fontSize: 10, fill: "#475569" }} />
                  <Radar dataKey="average" fill="#2563EB" fillOpacity={0.28} stroke="#2563EB" strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {selected.categorySummary.map((item) => (
                <div key={item.categoryId} className="rounded-2xl bg-white/75 p-3">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-bold">{item.categoryName}</span>
                    <span className={cn("font-black", item.isCritical && item.average < 3 ? "text-danger" : "")}>{item.average.toFixed(2)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className={cn("h-2 rounded-full", item.isCritical && item.average < 3 ? "bg-danger" : "bg-primary")}
                      style={{ width: `${(item.average / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {selected.comment && (
            <div className="rounded-2xl bg-white/75 p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">{t.comment}</p>
              <p className="text-sm leading-6 text-slate-700">{selected.comment}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
