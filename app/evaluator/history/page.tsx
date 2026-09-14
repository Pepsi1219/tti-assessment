"use client";

import { Calendar, Eye, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EvaluationCategoryReport } from "@/components/evaluation-category-report";
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
import { useEscapeKey } from "@/lib/hooks/use-escape-key";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/types";

export default function HistoryPage() {
  const { t } = useI18n();
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/evaluations");
        if (!response.ok) throw new Error("Unable to load evaluation history.");
        setEvaluations(await response.json());
      } catch {
        setLoadError("Unable to load evaluation history. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    void loadHistory();
  }, []);

  const filteredEvaluations = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return evaluations;
    return evaluations.filter((evaluation) =>
      [
        evaluation.recipient?.recipientName,
        evaluation.recipient?.employeeId,
        evaluation.topicName,
        evaluation.bu,
        evaluation.evaluationDate,
      ]
        .join(" ")
        .toLowerCase()
        .includes(text),
    );
  }, [evaluations, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            {t.evaluator}
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">
            {t.evaluationHistory}
          </h2>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            className="rounded-2xl pl-11"
            placeholder={t.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      {loadError && (
        <p
          role="alert"
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-danger"
        >
          {loadError}
        </p>
      )}
      {!loading && !loadError && filteredEvaluations.length === 0 && (
        <Card className="p-10 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            {t.noEvaluationsYet}
          </p>
        </Card>
      )}
      {!loading && !loadError && filteredEvaluations.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>{t.recipient}</TableHead>
              <TableHead>{t.evaluationTopics}</TableHead>
              <TableHead>{t.round}</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>{t.percentage}</TableHead>
              <TableHead>{t.result}</TableHead>
              <TableHead>{t.date}</TableHead>
              <TableHead className="text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell className="whitespace-nowrap font-bold">
                  {evaluation.recipient?.employeeId ?? "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap font-bold text-slate-900">
                  {evaluation.recipient?.recipientName ?? "—"}
                </TableCell>
                <TableCell className="min-w-48">
                  {evaluation.topicName}
                </TableCell>
                <TableCell className="text-center">
                  {evaluation.evaluationRound ?? "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap font-black text-primary">
                  {evaluation.totalScore.toFixed(2)}/5
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {evaluation.percentage.toFixed(2)}%
                </TableCell>
                <TableCell>
                  <Badge
                    tone={evaluation.result === "Pass" ? "success" : "danger"}
                  >
                    {evaluation.result === "Pass" ? t.pass : t.fail}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {evaluation.evaluationDate}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => setSelected(evaluation)}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-primary transition hover:bg-blue-100"
                    title={t.viewResult}
                    aria-label={`${t.viewResult}: ${evaluation.recipient?.recipientName ?? ""}`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selected && (
        <ResultModal evaluation={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function ResultModal({
  evaluation,
  onClose,
}: {
  evaluation: EvaluationResult;
  onClose: () => void;
}) {
  const { t } = useI18n();
  useEscapeKey(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.resultReport}
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl overflow-y-auto rounded-3xl border-0 bg-white p-0 shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="flex items-start justify-between gap-4 bg-slate-950 px-5 py-6 text-white md:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
              {t.resultReport}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
              {evaluation.recipient?.recipientName ?? "—"}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {evaluation.topicName} · {t.round}{" "}
              {evaluation.evaluationRound ?? "—"} · {evaluation.evaluationDate}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-6 bg-white p-5 md:p-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ResultTile
              label="Employee ID"
              value={evaluation.recipient?.employeeId ?? "—"}
            />
            <ResultTile
              label="Score"
              value={`${evaluation.totalScore.toFixed(2)} / 5`}
            />
            <ResultTile
              label={t.percentage}
              value={`${evaluation.percentage.toFixed(2)}%`}
            />
            <ResultTile
              label={t.result}
              value={evaluation.result === "Pass" ? t.pass : t.fail}
              success={evaluation.result === "Pass"}
            />
          </div>
          <EvaluationCategoryReport categories={evaluation.categorySummary} />
          {evaluation.comment && (
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.comment}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {evaluation.comment}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
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
