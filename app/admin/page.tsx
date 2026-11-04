"use client";

import { Activity, ArrowLeft, Award, CheckCircle2, TrendingDown, TrendingUp, XCircle } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StandardSelect } from "@/components/ui/standard-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WrappedRadarTick } from "@/components/evaluation-category-report";
import { useI18n } from "@/lib/i18n/context";
import { getReportCategoryName } from "@/lib/reports/evaluation-report";
import { getOverallPassThresholdAverage } from "@/lib/services/evaluation-scoring";
import { cn } from "@/lib/utils";
import type {
  AssessmentVersion,
  EvaluationRecipient,
  EvaluationResult,
  EvaluationTopic,
} from "@/lib/types";

function DashboardSkeleton() {
  return (
    <section className="space-y-6" aria-busy="true" aria-label="Dashboard loading">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="space-y-4">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <Card key={index} className="space-y-5">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  );
}

function AdminDashboardContent() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTopicId = searchParams.get("topicId") ?? "";
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [recipients, setRecipients] = useState<EvaluationRecipient[]>([]);
  const [topics, setTopics] = useState<EvaluationTopic[]>([]);
  const [assessmentVersions, setAssessmentVersions] = useState<AssessmentVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadedTopicId, setLoadedTopicId] = useState("");

  useEffect(() => {
    if (!selectedTopicId) {
      setLoading(false);
      setLoadedTopicId("");
      return;
    }

    let active = true;
    setLoading(true);
    setLoadedTopicId("");
    Promise.all([
      fetch("/api/evaluations"),
      fetch("/api/recipients"),
      fetch("/api/topics"),
      fetch("/api/assessment-versions"),
    ]).then(
      async ([evRes, recipientRes, topicRes, versionRes]) => {
        const [evaluationData, recipientData, topicData, versionData] = await Promise.all([
          evRes.json(),
          recipientRes.json(),
          topicRes.json(),
          versionRes.json(),
        ]);
        if (!active) return;
        setEvaluations(evaluationData);
        setRecipients(recipientData);
        setTopics(topicData);
        setAssessmentVersions(versionData);
        setSelectedVersionId("all");
        setLoadedTopicId(selectedTopicId);
        setLoading(false);
      }
    ).catch(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [selectedTopicId]);

  if (!selectedTopicId || loading || loadedTopicId !== selectedTopicId)
    return <DashboardSkeleton />;

  const courseEvaluations = evaluations.filter(
    (evaluation) => evaluation.topicId === selectedTopicId,
  );
  const filteredEvaluations = courseEvaluations.filter((evaluation) => {
    if (selectedVersionId === "all") return true;
    if (selectedVersionId === "legacy") return !evaluation.assessmentVersionId;
    return evaluation.assessmentVersionId === selectedVersionId;
  });
  const totalEvaluations = filteredEvaluations.length;
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);
  const selectedAssessment = assessmentVersions.find(
    (version) =>
      version.id ===
      (selectedVersionId === "all"
        ? selectedTopic?.activeAssessmentVersionId
        : selectedVersionId),
  );
  const dashboardProfile = selectedAssessment?.dashboardProfile ?? "category-score";
  const isAllVersions = selectedVersionId === "all";
  const showPassFail =
    !isAllVersions && dashboardProfile === "pass-fail";
  const showScoreDetails =
    !isAllVersions && dashboardProfile !== "pass-fail";
  const showCategoryDetails =
    showScoreDetails && dashboardProfile === "category-score";
  const passCount = filteredEvaluations.filter((e) => e.result === "Pass").length;
  const failCount = totalEvaluations - passCount;
  const passRate = totalEvaluations ? (passCount / totalEvaluations) * 100 : 0;
  const failRate = totalEvaluations ? (failCount / totalEvaluations) * 100 : 0;
  const avgScore = totalEvaluations
    ? filteredEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / totalEvaluations
    : 0;

  const recipientScores = !showScoreDetails ? [] : recipients
    .map((recipient) => {
      const recipientEvals = filteredEvaluations.filter(
        (evaluation) => evaluation.recipientId === recipient.id,
      );
      const avg = recipientEvals.length
        ? recipientEvals.reduce((s, evaluation) => s + evaluation.totalScore, 0) / recipientEvals.length
        : 0;
      return { ...recipient, avgScore: avg, evalCount: recipientEvals.length };
    })
    .filter((t) => t.evalCount > 0)
    .sort((a, b) => b.avgScore - a.avgScore);

  const topRecipients = recipientScores.slice(0, 5);

  const categoryAvg = showCategoryDetails && filteredEvaluations.length > 0
    ? filteredEvaluations[0].categorySummary.map((cat) => {
        const allAvgs = filteredEvaluations.map((ev) => {
          const found = ev.categorySummary.find((c) => c.categoryId === cat.categoryId);
          return found?.average ?? 0;
        });
        return {
          categoryName: getReportCategoryName(cat, locale),
          average: Number((allAvgs.reduce((s, v) => s + v, 0) / allAvgs.length).toFixed(2)),
          isCritical: cat.isCritical
        };
      })
    : [];

  const overallPassThresholdAverage = getOverallPassThresholdAverage(selectedAssessment ?? {});
  const scoreDistribution = [
    {
      label: t.scoreExcellent,
      count: filteredEvaluations.filter(
        (e) => e.totalScore >= Math.max(4.5, overallPassThresholdAverage + 0.5),
      ).length,
      color: "#22C55E",
    },
    {
      label: t.scorePass,
      count: filteredEvaluations.filter(
        (e) =>
          e.totalScore >= overallPassThresholdAverage &&
          e.totalScore < Math.max(4.5, overallPassThresholdAverage + 0.5),
      ).length,
      color: "#2563EB",
    },
    {
      label: t.scoreConditional,
      count: filteredEvaluations.filter(
        (e) =>
          e.totalScore >= Math.max(0, overallPassThresholdAverage - 0.5) &&
          e.totalScore < overallPassThresholdAverage,
      ).length,
      color: "#F59E0B",
    },
    {
      label: t.scoreFail,
      count: filteredEvaluations.filter(
        (e) => e.totalScore < Math.max(0, overallPassThresholdAverage - 0.5),
      ).length,
      color: "#EF4444",
    },
  ];
  const passFailDistribution = [
    { label: t.pass, count: passCount, color: "#22C55E" },
    { label: t.fail, count: failCount, color: "#EF4444" },
  ];
  const usedVersions = assessmentVersions.filter((version) =>
    courseEvaluations.some(
      (evaluation) => evaluation.assessmentVersionId === version.id,
    ),
  );
  if (
    selectedTopic?.activeAssessmentVersionId &&
    !usedVersions.some((version) => version.id === selectedTopic.activeAssessmentVersionId)
  ) {
    const activeVersion = assessmentVersions.find(
      (version) => version.id === selectedTopic.activeAssessmentVersionId,
    );
    if (activeVersion) usedVersions.push(activeVersion);
  }
  const versionOptions = [
    { value: "all", label: t.all },
    ...usedVersions.map((version) => ({
      value: version.id,
      label: `${version.name} · v${version.version}`,
    })),
    ...(selectedTopic?.activeAssessmentVersionId == null ||
    courseEvaluations.some((evaluation) => !evaluation.assessmentVersionId)
      ? [{ value: "legacy", label: t.legacyAssessment }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label={t.dashboard}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="truncate text-xl font-black">{selectedTopic?.topicName ?? t.dashboard}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
            {t.assessmentVersion}
            <StandardSelect value={selectedVersionId} onValueChange={setSelectedVersionId} ariaLabel={t.assessmentVersion} options={versionOptions} />
          </label>
        </div>
      </div>
      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Activity} label={t.totalEvaluations} value={String(totalEvaluations)} />
        <MetricCard icon={CheckCircle2} label={t.passRate} value={totalEvaluations ? `${passRate.toFixed(0)}%` : "—"} tone="text-success" />
        <MetricCard icon={XCircle} label={t.failRate} value={totalEvaluations ? `${failRate.toFixed(0)}%` : "—"} tone="text-danger" />
        <MetricCard icon={Award} label={t.averageScore} value={totalEvaluations ? avgScore.toFixed(2) : "—"} />
      </div>

      {showPassFail && <Card className="p-5">
        <h3 className="mb-4 text-lg font-black">{t.result}</h3>
        {totalEvaluations > 0 ? <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={passFailDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {passFailDistribution.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div> : <p className="py-10 text-center text-sm text-slate-400">{t.noData}</p>}
      </Card>}

      {showScoreDetails && <div className="grid gap-6 xl:grid-cols-2">
        {/* Score Distribution */}
        <Card className="p-5">
          <h3 className="mb-4 text-lg font-black">{t.scoreDistribution}</h3>
          {totalEvaluations > 0 ? (
            <div className="h-80">
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
        {showCategoryDetails && <Card className="p-5">
          <h3 className="mb-4 text-lg font-black">{t.categoryPerformance}</h3>
          {categoryAvg.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer>
                <RadarChart data={categoryAvg} outerRadius="99%" margin={{ top: 28, right: 48, bottom: 28, left: 48 }}>
                  <PolarGrid gridType="polygon" radialLines={false} stroke="#dbe3ef" />
                  <PolarAngleAxis dataKey="categoryName" tick={WrappedRadarTick} />
                  <PolarRadiusAxis
                    domain={[0, 5]}
                    tickCount={6}
                    allowDecimals={false}
                    axisLine={false}
                    tick={false}
                  />
                  <Radar dataKey="average" fill="#2563EB" fillOpacity={0.28} stroke="#2563EB" strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">{t.noData}</p>
          )}
        </Card>}
      </div>}

      {showScoreDetails && <div className="grid gap-6 xl:grid-cols-2">
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
                      <p className="text-xs text-slate-400">{recipient.employeeId} · {t.department}: {recipient.bu} · {t.bu}: {recipient.buCode ?? "-"}</p>
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
        {showCategoryDetails && <Card className="p-5">
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
        </Card>}
      </div>
      }

      {/* Recent Evaluations */}
      <Card className="p-5">
        <h3 className="mb-4 text-lg font-black">{t.recentEvaluations}</h3>
        {filteredEvaluations.length > 0 ? (
          <Table className="min-w-[860px] table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">{t.recipient}</TableHead>
                <TableHead className="text-left">{t.course}</TableHead>
                <TableHead className="text-left">{t.assessmentVersion}</TableHead>
                <TableHead className="text-left">{t.evaluatedBy}</TableHead>
                <TableHead className="whitespace-nowrap">{t.evaluationDate}</TableHead>
                <TableHead className="whitespace-nowrap">{t.totalScore}</TableHead>
                <TableHead className="whitespace-nowrap">{t.result}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredEvaluations.slice(0, 10).map((ev) => (
              <TableRow key={ev.id}>
                <TableCell className="text-left font-bold">{ev.recipient?.recipientName ?? "—"}</TableCell>
                <TableCell className="text-left">{ev.topicName}</TableCell>
                <TableCell className="text-left">{ev.assessmentVersion?.name ?? t.legacyAssessment}</TableCell>
                <TableCell className="text-left">{ev.evaluatorName}</TableCell>
                <TableCell className="whitespace-nowrap">{ev.evaluationDate}</TableCell>
                <TableCell className="font-black tabular-nums">{ev.totalScore.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge tone={ev.result === "Pass" ? "success" : "danger"}>
                    {ev.result === "Pass" ? t.pass : t.fail}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
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
