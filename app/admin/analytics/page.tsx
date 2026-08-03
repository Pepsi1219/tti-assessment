"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
import type { EvaluationResult } from "@/lib/types";

export default function AnalyticsPage() {
  const { t } = useI18n();
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/evaluations")
      .then((res) => res.json())
      .then((data) => {
        setEvaluations(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const monthlyData = (() => {
    const map = new Map<string, { month: string; total: number; pass: number; fail: number; avgScore: number }>();
    evaluations.forEach((ev) => {
      const month = ev.evaluationDate.slice(0, 7);
      const existing = map.get(month) || { month, total: 0, pass: 0, fail: 0, avgScore: 0 };
      existing.total++;
      if (ev.result === "Pass") existing.pass++;
      else existing.fail++;
      existing.avgScore += ev.totalScore;
      map.set(month, existing);
    });
    return Array.from(map.values())
      .map((m) => ({ ...m, avgScore: Number((m.avgScore / m.total).toFixed(2)) }))
      .sort((a, b) => a.month.localeCompare(b.month));
  })();

  const scoreDistribution = [
    { label: "Excellent (4.5-5.0)", count: evaluations.filter((e) => e.totalScore >= 4.5).length, color: "#22C55E" },
    { label: "Pass (3.5-4.49)", count: evaluations.filter((e) => e.totalScore >= 3.5 && e.totalScore < 4.5).length, color: "#2563EB" },
    { label: "Conditional (3.0-3.49)", count: evaluations.filter((e) => e.totalScore >= 3 && e.totalScore < 3.5).length, color: "#F59E0B" },
    { label: "Fail (<3.0)", count: evaluations.filter((e) => e.totalScore < 3).length, color: "#EF4444" }
  ];

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

  const buData = (() => {
    const map = new Map<string, { bu: string; total: number; pass: number; avgScore: number }>();
    evaluations.forEach((ev) => {
      const existing = map.get(ev.bu) || { bu: ev.bu, total: 0, pass: 0, avgScore: 0 };
      existing.total++;
      if (ev.result === "Pass") existing.pass++;
      existing.avgScore += ev.totalScore;
      map.set(ev.bu, existing);
    });
    return Array.from(map.values()).map((b) => ({
      ...b,
      avgScore: Number((b.avgScore / b.total).toFixed(2)),
      passRate: Number(((b.pass / b.total) * 100).toFixed(0))
    }));
  })();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{t.admin}</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight">{t.analytics}</h1>
      </div>

      {evaluations.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-slate-400">{t.noData}</p>
        </Card>
      ) : (
        <>
          {/* Monthly Trend */}
          <Card className="p-5">
            <h3 className="mb-4 text-lg font-black">{t.monthlyTrend}</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="pass" name="Pass" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="fail" name="Fail" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Score Distribution */}
            <Card className="p-5">
              <h3 className="mb-4 text-lg font-black">{t.scoreDistribution}</h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
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
            </Card>

            {/* Category Performance Radar */}
            <Card className="p-5">
              <h3 className="mb-4 text-lg font-black">{t.categoryPerformance}</h3>
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
            </Card>
          </div>

          {/* BU Performance */}
          <Card className="p-5">
            <h3 className="mb-4 text-lg font-black">Performance by Business Unit</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {buData.map((bu) => (
                <div key={bu.bu} className="rounded-2xl bg-white/75 p-4">
                  <h4 className="text-lg font-black">{bu.bu}</h4>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.totalEvaluations}</span>
                      <span className="font-bold">{bu.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.averageScore}</span>
                      <span className="font-black text-primary">{bu.avgScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.passRate}</span>
                      <Badge tone={bu.passRate >= 80 ? "success" : bu.passRate >= 50 ? "warning" : "danger"}>
                        {bu.passRate}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Detail Table */}
          <Card className="p-5">
            <h3 className="mb-4 text-lg font-black">{t.categorySummary}</h3>
            <div className="space-y-2">
              {[...categoryAvg].sort((a, b) => b.average - a.average).map((cat) => (
                <div key={cat.categoryName} className="rounded-2xl bg-white/75 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{cat.categoryName}</span>
                      {cat.isCritical && <Badge tone="warning">{t.critical}</Badge>}
                    </div>
                    <span className={cn("text-lg font-black", cat.average < 3 ? "text-danger" : cat.average < 3.5 ? "text-warning" : "text-primary")}>
                      {cat.average.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200">
                    <div
                      className={cn("h-3 rounded-full transition-all", cat.average < 3 ? "bg-danger" : cat.average < 3.5 ? "bg-warning" : "bg-primary")}
                      style={{ width: `${(cat.average / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
