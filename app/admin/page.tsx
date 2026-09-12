"use client";

import { Activity, Award, CheckCircle2, TrendingDown, TrendingUp, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { EvaluationRecipient, EvaluationResult } from "@/lib/types";

export default function AdminDashboard() {
  const { t } = useI18n();
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [recipients, setRecipients] = useState<EvaluationRecipient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/evaluations"), fetch("/api/recipients")]).then(
      async ([evRes, recipientRes]) => {
        setEvaluations(await evRes.json());
        setRecipients(await recipientRes.json());
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalEvaluations = evaluations.length;
  const passCount = evaluations.filter((e) => e.result === "Pass").length;
  const failCount = totalEvaluations - passCount;
  const passRate = totalEvaluations ? (passCount / totalEvaluations) * 100 : 0;
  const failRate = totalEvaluations ? (failCount / totalEvaluations) * 100 : 0;
  const avgScore = totalEvaluations
    ? evaluations.reduce((sum, e) => sum + e.totalScore, 0) / totalEvaluations
    : 0;

  const recipientScores = recipients
    .map((recipient) => {
      const recipientEvals = evaluations.filter((evaluation) => evaluation.recipientId === recipient.id);
      const avg = recipientEvals.length
        ? recipientEvals.reduce((s, evaluation) => s + evaluation.totalScore, 0) / recipientEvals.length
        : 0;
      return { ...recipient, avgScore: avg, evalCount: recipientEvals.length };
    })
    .filter((t) => t.evalCount > 0)
    .sort((a, b) => b.avgScore - a.avgScore);

  const topRecipients = recipientScores.slice(0, 5);

  const categoryAvg = evaluations.length > 0
    ? evaluations[0].categorySummary.map((cat) => {
        const allAvgs = evaluations.map((ev) => {
          const found = ev.categorySummary.find((c) => c.categoryId === cat.categoryId);
          return found?.average ?? 0;
        });
        return {
          categoryName: cat.categoryName,
          average: Number((allAvgs.reduce((s, v) => s + v, 0) / allAvgs.length).toFixed(2)),
          isCritical: cat.isCritical
        };
      })
    : [];

  const scoreDistribution = [
    { label: t.scoreExcellent, count: evaluations.filter((e) => e.totalScore >= 4.5).length, color: "#22C55E" },
    { label: t.scorePass, count: evaluations.filter((e) => e.totalScore >= 3.5 && e.totalScore < 4.5).length, color: "#2563EB" },
    { label: t.scoreConditional, count: evaluations.filter((e) => e.totalScore >= 3 && e.totalScore < 3.5).length, color: "#F59E0B" },
    { label: t.scoreFail, count: evaluations.filter((e) => e.totalScore < 3).length, color: "#EF4444" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t.admin}</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">{t.certificationOverview}</h1>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Activity} label={t.totalEvaluations} value={String(totalEvaluations)} />
        <MetricCard icon={CheckCircle2} label={t.passRate} value={`${passRate.toFixed(0)}%`} tone="text-success" />
        <MetricCard icon={XCircle} label={t.failRate} value={`${failRate.toFixed(0)}%`} tone="text-danger" />
        <MetricCard icon={Award} label={t.averageScore} value={avgScore.toFixed(2)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Score Distribution */}
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-black">{t.scoreDistribution}</h3>
          {totalEvaluations > 0 ? (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {scoreDistribution.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">{t.noData}</p>
          )}
        </Card>

        {/* Category Performance Radar */}
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-black">{t.categoryPerformance}</h3>
          {categoryAvg.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer>
                <RadarChart data={categoryAvg}>
                  <PolarGrid stroke="#dbe3ef" />
                  <PolarAngleAxis dataKey="categoryName" tick={{ fontSize: 9, fill: "#475569" }} />
                  <Radar dataKey="average" fill="#2563EB" fillOpacity={0.28} stroke="#2563EB" strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">{t.noData}</p>
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Top recipients */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <h3 className="text-lg font-black">{t.recipients}</h3>
          </div>
          {topRecipients.length > 0 ? (
            <div className="space-y-2">
              {topRecipients.map((recipient, idx) => (
                <div key={recipient.id} className="flex items-center justify-between rounded-2xl bg-white/75 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{idx + 1}</span>
                    <div>
                      <p className="text-sm font-bold">{recipient.recipientName}</p>
                      <p className="text-xs text-slate-400">{recipient.employeeId} · {t.department}: {recipient.bu} · BU: {recipient.buCode ?? "-"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary">{recipient.avgScore.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">{recipient.evalCount} {t.evals}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">{t.noData}</p>
          )}
        </Card>

        {/* Category Ranking */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-warning" />
            <h3 className="text-lg font-black">{t.lowestCategories}</h3>
          </div>
          {categoryAvg.length > 0 ? (
            <div className="space-y-2">
              {[...categoryAvg].sort((a, b) => a.average - b.average).map((cat) => (
                <div key={cat.categoryName} className="rounded-2xl bg-white/75 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{cat.categoryName}</span>
                      {cat.isCritical && <Badge tone="warning">{t.critical}</Badge>}
                    </div>
                    <span className={cn("font-black", cat.average < 3 ? "text-danger" : "")}>{cat.average.toFixed(2)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className={cn("h-2 rounded-full", cat.average < 3 ? "bg-danger" : cat.average < 3.5 ? "bg-warning" : "bg-primary")}
                      style={{ width: `${(cat.average / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">{t.noData}</p>
          )}
        </Card>
      </div>

      {/* Recent Evaluations */}
      <Card className="p-5">
        <h3 className="mb-4 text-lg font-black">{t.recentEvaluations}</h3>
        {evaluations.length > 0 ? (
          <div className="space-y-2">
            {evaluations.slice(0, 10).map((ev) => (
              <div key={ev.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/75 px-4 py-3">
                <div>
                  <p className="text-sm font-bold">{ev.recipient?.recipientName ?? "—"}</p>
                  <p className="text-xs text-slate-400">{t.evaluatedBy}: {ev.evaluatorName} · {ev.evaluationDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black">{ev.totalScore.toFixed(2)}</span>
                  <Badge tone={ev.result === "Pass" ? "success" : "danger"}>
                    {ev.result === "Pass" ? t.pass : t.fail}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-slate-400">{t.noData}</p>
        )}
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone = "text-slate-950" }: { icon: typeof Activity; label: string; value: string; tone?: string }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[16px] bg-slate-950 text-white">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className={cn("mt-1 text-3xl font-black tracking-tight", tone)}>{value}</p>
    </Card>
  );
}
