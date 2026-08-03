"use client";

import { Calendar, ChevronRight, Eye, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { EvaluationResult } from "@/lib/types";

export default function HistoryPage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [query, setQuery] = useState("");
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

  const myEvaluations = useMemo(() => {
    const myId = (session?.user?.employeeId ?? session?.user?.email ?? "").toLowerCase();
    return evaluations
      .filter((ev) => ev.evaluatorEmail.toLowerCase() === myId)
      .filter((ev) => {
        if (!query) return true;
        const text = query.toLowerCase();
        return [ev.trainer?.trainerName, ev.trainer?.employeeId, ev.bu, ev.evaluationDate]
          .join(" ")
          .toLowerCase()
          .includes(text);
      });
  }, [evaluations, session, query]);

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
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t.evaluator}</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">{t.evaluationHistory}</h2>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            className="rounded-2xl pl-11"
            placeholder={t.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {myEvaluations.length === 0 ? (
        <Card className="p-10 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm font-semibold text-slate-500">{t.noEvaluationsYet}</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {myEvaluations.map((ev) => (
            <Card
              key={ev.id}
              className={cn(
                "cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-xl",
                selected?.id === ev.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelected(selected?.id === ev.id ? null : ev)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black">{ev.trainer?.trainerName ?? "—"}</h3>
                  <p className="mt-1 text-xs text-slate-500">{ev.trainer?.employeeId} · {ev.bu}</p>
                </div>
                <Badge tone={ev.result === "Pass" ? "success" : "danger"}>
                  {ev.result === "Pass" ? t.pass : t.fail}
                </Badge>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-black text-primary">{ev.totalScore.toFixed(2)}/5</span>
                  <span className="text-slate-400">{ev.percentage}%</span>
                </div>
                <span className="text-xs text-slate-400">{ev.evaluationDate}</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                <Eye className="h-3.5 w-3.5" />
                {t.viewResult}
                <ChevronRight className="h-3 w-3" />
              </div>
            </Card>
          ))}
        </div>
      )}

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
          <div className="grid gap-3 md:grid-cols-3">
            <ResultTile label={t.totalScore} value={`${selected.totalScore.toFixed(2)}/5`} />
            <ResultTile label={t.percentage} value={`${selected.percentage}%`} />
            <ResultTile label={t.date} value={selected.evaluationDate} />
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

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white/75 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
    </div>
  );
}
