"use client";

import { Calendar, Eye, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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

const filterSelectTriggerClass =
  "h-11 rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none transition hover:border-slate-300 hover:bg-white focus:ring-4 focus:ring-blue-100";
const filterSelectContentClass =
  "rounded-2xl border-slate-200 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl";

export default function HistoryPage() {
  const { t } = useI18n();
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [query, setQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
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

  const filterOptions = useMemo(() => {
    const unique = (values: string[]) =>
      Array.from(new Set(values.filter(Boolean))).sort();

    return {
      courses: unique(evaluations.map((evaluation) => evaluation.topicName)),
      years: unique(
        evaluations.map((evaluation) => evaluation.evaluationDate.slice(0, 4)),
      ).reverse(),
    };
  }, [evaluations]);

  const filteredEvaluations = useMemo(() => {
    const text = query.trim().toLowerCase();
    const matching = evaluations.filter((evaluation) => {
      if (
        text &&
        ![
          evaluation.recipient?.recipientName,
          evaluation.recipient?.employeeId,
          evaluation.topicName,
          evaluation.bu,
          evaluation.evaluationDate,
        ]
          .join(" ")
          .toLowerCase()
          .includes(text)
      )
        return false;
      if (filterCourse !== "all" && evaluation.topicName !== filterCourse)
        return false;
      if (
        filterYear !== "all" &&
        evaluation.evaluationDate.slice(0, 4) !== filterYear
      )
        return false;
      if (filterResult !== "all" && evaluation.result !== filterResult)
        return false;
      return true;
    });

    return [...matching].sort(
      (left, right) =>
        right.evaluationDate.localeCompare(left.evaluationDate) ||
        right.createdAt.localeCompare(left.createdAt),
    );
  }, [evaluations, filterCourse, filterResult, filterYear, query]);

  return (
    <div className="space-y-6">
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
      {!loading && !loadError && evaluations.length === 0 && (
        <Card className="p-10 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            {t.noEvaluationsYet}
          </p>
        </Card>
      )}
      {!loading && !loadError && evaluations.length > 0 && (
        <Card className="p-5">
          <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div className="relative w-full max-w-none">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                className="rounded-2xl pl-11"
                placeholder={t.search}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Select
              value={filterCourse}
              onValueChange={setFilterCourse}
            >
              <SelectTrigger aria-label={t.course} className={filterSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={8}
                className={filterSelectContentClass}
              >
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
              <SelectContent
                position="popper"
                sideOffset={8}
                className={filterSelectContentClass}
              >
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
              <SelectContent
                position="popper"
                sideOffset={8}
                className={filterSelectContentClass}
              >
                <SelectItem value="all">{t.result}</SelectItem>
                <SelectItem value="Pass">{t.pass}</SelectItem>
                <SelectItem value="Fail">{t.fail}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredEvaluations.length === 0 ? (
            <p className="py-10 text-center text-sm font-semibold text-slate-400">
              {t.noData}
            </p>
          ) : (
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
                <TableRow
                  key={evaluation.id}
                  className={
                    evaluation.result === "Pass"
                      ? "bg-emerald-50/80 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/45"
                      : "bg-red-50/80 hover:bg-red-100/80 dark:bg-red-950/30 dark:hover:bg-red-950/45"
                  }
                >
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
        </Card>
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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.resultReport}
        className="h-[100dvh] w-full overflow-y-auto overscroll-contain bg-white p-0 shadow-2xl scrollbar-hide touch-pan-y"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-slate-950 px-4 py-4 text-white sm:gap-4 sm:px-5 sm:py-6 md:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
              {t.resultReport}
            </p>
            <h2 className="mt-2 break-words text-xl font-black tracking-tight sm:text-2xl md:text-3xl">
              {evaluation.recipient?.recipientName ?? "—"}
            </h2>
            <p className="mt-1 break-words text-sm text-slate-300">
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
        <div className="space-y-4 bg-white p-4 sm:space-y-6 sm:p-5 md:p-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-black text-slate-950">Comments</h3>
            <p className="mt-3 min-h-20 whitespace-pre-wrap border-b border-dashed border-slate-300 pb-3 text-sm leading-7 text-slate-700">
              {evaluation.comment || "—"}
            </p>
          </section>
          <EvaluationCategoryReport categories={evaluation.categorySummary} />
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
          "mt-2 break-words text-xl font-black tracking-tight sm:text-2xl",
          success ? "text-emerald-500" : "text-slate-950",
        )}
      >
        {value}
      </p>
    </div>
  );
}
