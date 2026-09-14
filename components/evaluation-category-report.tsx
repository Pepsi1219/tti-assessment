"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getReportCategoryName } from "@/lib/reports/evaluation-report";
import { cn } from "@/lib/utils";
import type { CategorySummary } from "@/lib/types";

type EvaluationCategoryReportProps = {
  categories: CategorySummary[];
  profileTitle?: string;
  scoresTitle?: string;
};

type RadarTickProps = {
  x?: number;
  y?: number;
  textAnchor?: "start" | "middle" | "end" | "inherit";
  payload?: { value?: string };
};

/** Render complete category names on multiple lines instead of clipping them. */
export function WrappedRadarTick({
  x = 0,
  y = 0,
  textAnchor = "middle",
  payload,
}: RadarTickProps) {
  const words = String(payload?.value ?? "")
    .split(/\s+/)
    .filter(Boolean);
  const lines: string[] = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (current && `${current} ${word}`.length <= 22) {
      lines[lines.length - 1] = `${current} ${word}`;
    } else {
      lines.push(word);
    }
  }
  return (
    <text x={x} y={y} textAnchor={textAnchor} fill="#475569" fontSize={10}>
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 13}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export function EvaluationCategoryReport({
  categories,
  profileTitle = "Competency Profile",
  scoresTitle = "Category Scores",
}: EvaluationCategoryReportProps) {
  const radarData = categories.map((category) => ({
    ...category,
    reportName: getReportCategoryName(category),
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-center text-lg font-black">{profileTitle}</h3>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={radarData}
              outerRadius="61%"
              margin={{ top: 28, right: 48, bottom: 28, left: 48 }}
            >
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="reportName" tick={WrappedRadarTick} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tickCount={6}
                tick={{ fontSize: 9, fill: "#64748b" }}
              />
              <Radar
                dataKey="average"
                fill="#2563EB"
                fillOpacity={0.35}
                stroke="#2563EB"
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value) => [Number(value).toFixed(2), "Average"]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-black">{scoresTitle}</h3>
        <div className="mt-4 space-y-3">
          {categories.map((category) => {
            const criticalFailure = category.isCritical && category.average < 3;
            return (
              <div key={category.categoryId}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-700">
                    {getReportCategoryName(category)}
                  </span>
                  <span
                    className={cn(
                      "font-black tabular-nums",
                      criticalFailure ? "text-danger" : "text-primary",
                    )}
                  >
                    {category.average.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className={cn(
                      "h-2 rounded-full",
                      criticalFailure ? "bg-danger" : "bg-primary",
                    )}
                    style={{
                      width: `${Math.min(100, (category.average / 5) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
